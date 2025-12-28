use odra::prelude::*;
use crate::types::CollateralPosition;

#[odra::module]
pub struct SyntheticStablecoinContract {
    // Token info
    name: Variable<String>,
    symbol: Variable<String>,
    decimals: Variable<u8>,
    total_supply: Variable<U256>,
    
    // Balances and allowances
    balances: Mapping<Address, U256>,
    allowances: Mapping<(Address, Address), U256>,
    
    // Collateral management
    collateral_positions: Mapping<Address, CollateralPosition>,
    total_collateral: Variable<U256>,
    total_synthetic_supply: Variable<U256>,
    
    // Risk parameters
    collateral_ratio: Variable<u32>, // basis points (15000 = 150%)
    liquidation_threshold: Variable<u32>, // basis points (13000 = 130%)
    liquidation_penalty: Variable<u32>, // basis points (500 = 5%)
    
    // Oracle and pricing
    vcspr_price: Variable<U256>, // Price in USD (scaled by 1e18)
    last_price_update: Variable<u64>,
    
    // Admin
    owner: Variable<Address>,
    paused: Variable<bool>,
    
    // Cross-chain bridge info
    bridge_contract: Variable<Address>,
    supported_chains: Mapping<u32, bool>, // chain_id -> supported
}

#[odra::module]
impl SyntheticStablecoinContract {
    pub fn init(&mut self, owner: Address, bridge_contract: Address) {
        self.owner.set(owner);
        self.bridge_contract.set(bridge_contract);
        
        // Token metadata
        self.name.set("Velocity Synthetic USD".to_string());
        self.symbol.set("vUSD".to_string());
        self.decimals.set(18);
        self.total_supply.set(U256::zero());
        
        // Risk parameters (conservative initially)
        self.collateral_ratio.set(15000); // 150% collateralization
        self.liquidation_threshold.set(13000); // 130% liquidation threshold
        self.liquidation_penalty.set(500); // 5% penalty
        
        // Initial vCSPR price (placeholder - would use oracle in production)
        self.vcspr_price.set(U256::from(1_000_000_000_000_000_000u64)); // $1 USD
        self.last_price_update.set(0);
        
        self.paused.set(false);
        
        // Initialize supported chains (Ethereum, Polygon, BSC)
        self.supported_chains.set(&1, true); // Ethereum
        self.supported_chains.set(&137, true); // Polygon
        self.supported_chains.set(&56, true); // BSC
    }
    
    pub fn mint_with_collateral(&mut self, vcspr_amount: U256, synthetic_amount: U256) {
        let caller = self.env().caller();
        
        require!(!self.paused.get_or_default(), "Contract is paused");
        require!(vcspr_amount > U256::zero(), "Collateral amount must be positive");
        require!(synthetic_amount > U256::zero(), "Synthetic amount must be positive");
        
        // Check collateralization ratio
        let vcspr_price = self.vcspr_price.get_or_default();
        let collateral_value = vcspr_amount * vcspr_price / U256::from(1_000_000_000_000_000_000u64);
        let required_collateral = synthetic_amount * U256::from(self.collateral_ratio.get_or_default()) / U256::from(10000);
        
        require!(collateral_value >= required_collateral, "Insufficient collateral");
        
        // Update or create collateral position
        let mut position = self.collateral_positions.get(&caller).unwrap_or_else(|| CollateralPosition {
            user: caller,
            vcspr_collateral: U256::zero(),
            synthetic_minted: U256::zero(),
            liquidation_threshold: self.liquidation_threshold.get_or_default(),
        });
        
        position.vcspr_collateral += vcspr_amount;
        position.synthetic_minted += synthetic_amount;
        
        self.collateral_positions.set(&caller, position);
        
        // Update totals
        let total_collateral = self.total_collateral.get_or_default();
        let total_synthetic = self.total_synthetic_supply.get_or_default();
        
        self.total_collateral.set(total_collateral + vcspr_amount);
        self.total_synthetic_supply.set(total_synthetic + synthetic_amount);
        
        // Mint synthetic tokens
        self.mint_tokens(caller, synthetic_amount);
        
        self.env().emit_event("SyntheticMinted", &(caller, vcspr_amount, synthetic_amount));
    }
    
    pub fn burn_and_redeem(&mut self, synthetic_amount: U256) {
        let caller = self.env().caller();
        
        require!(!self.paused.get_or_default(), "Contract is paused");
        
        let balance = self.balances.get(&caller).unwrap_or_default();
        require!(balance >= synthetic_amount, "Insufficient synthetic balance");
        
        let mut position = self.collateral_positions.get(&caller)
            .expect("No collateral position found");
        
        require!(position.synthetic_minted >= synthetic_amount, "Cannot redeem more than minted");
        
        // Calculate collateral to return proportionally
        let collateral_to_return = position.vcspr_collateral * synthetic_amount / position.synthetic_minted;
        
        // Update position
        position.vcspr_collateral -= collateral_to_return;
        position.synthetic_minted -= synthetic_amount;
        
        if position.synthetic_minted == U256::zero() {
            // Remove position if fully redeemed
            self.collateral_positions.remove(&caller);
        } else {
            self.collateral_positions.set(&caller, position);
        }
        
        // Update totals
        let total_collateral = self.total_collateral.get_or_default();
        let total_synthetic = self.total_synthetic_supply.get_or_default();
        
        self.total_collateral.set(total_collateral - collateral_to_return);
        self.total_synthetic_supply.set(total_synthetic - synthetic_amount);
        
        // Burn synthetic tokens
        self.burn_tokens(caller, synthetic_amount);
        
        // Return collateral (in production, would transfer vCSPR tokens)
        self.env().emit_event("SyntheticBurned", &(caller, synthetic_amount, collateral_to_return));
    }
    
    pub fn liquidate_position(&mut self, user: Address) {
        let caller = self.env().caller();
        
        let position = self.collateral_positions.get(&user)
            .expect("Position does not exist");
        
        // Check if position is undercollateralized
        let vcspr_price = self.vcspr_price.get_or_default();
        let collateral_value = position.vcspr_collateral * vcspr_price / U256::from(1_000_000_000_000_000_000u64);
        let debt_value = position.synthetic_minted;
        let current_ratio = collateral_value * U256::from(10000) / debt_value;
        
        require!(current_ratio < U256::from(position.liquidation_threshold), "Position is not liquidatable");
        
        // Calculate liquidation penalty
        let penalty_amount = position.vcspr_collateral * U256::from(self.liquidation_penalty.get_or_default()) / U256::from(10000);
        let liquidator_reward = penalty_amount / U256::from(2); // 50% to liquidator
        let protocol_fee = penalty_amount - liquidator_reward;
        
        // Remove position
        self.collateral_positions.remove(&user);
        
        // Update totals
        let total_collateral = self.total_collateral.get_or_default();
        let total_synthetic = self.total_synthetic_supply.get_or_default();
        
        self.total_collateral.set(total_collateral - position.vcspr_collateral);
        self.total_synthetic_supply.set(total_synthetic - position.synthetic_minted);
        
        // Burn the user's synthetic tokens (simplified - in production would handle differently)
        self.burn_tokens(user, position.synthetic_minted);
        
        self.env().emit_event("PositionLiquidated", &(user, caller, position.vcspr_collateral, liquidator_reward));
    }
    
    pub fn bridge_to_chain(&mut self, amount: U256, target_chain: u32, recipient: String) {
        let caller = self.env().caller();
        
        require!(!self.paused.get_or_default(), "Contract is paused");
        require!(self.supported_chains.get(&target_chain).unwrap_or_default(), "Chain not supported");
        
        let balance = self.balances.get(&caller).unwrap_or_default();
        require!(balance >= amount, "Insufficient balance");
        
        // Burn tokens on Casper
        self.burn_tokens(caller, amount);
        
        // Emit bridge event (bridge contract would listen and mint on target chain)
        self.env().emit_event("BridgeInitiated", &(caller, amount, target_chain, recipient));
    }
    
    fn mint_tokens(&mut self, to: Address, amount: U256) {
        let current_balance = self.balances.get(&to).unwrap_or_default();
        self.balances.set(&to, current_balance + amount);
        
        let total_supply = self.total_supply.get_or_default();
        self.total_supply.set(total_supply + amount);
        
        self.env().emit_event("Transfer", &(Address::zero(), to, amount));
    }
    
    fn burn_tokens(&mut self, from: Address, amount: U256) {
        let current_balance = self.balances.get(&from).unwrap_or_default();
        require!(current_balance >= amount, "Insufficient balance to burn");
        
        self.balances.set(&from, current_balance - amount);
        
        let total_supply = self.total_supply.get_or_default();
        self.total_supply.set(total_supply - amount);
        
        self.env().emit_event("Transfer", &(from, Address::zero(), amount));
    }
    
    // ERC20-like functions
    pub fn transfer(&mut self, to: Address, amount: U256) -> bool {
        let caller = self.env().caller();
        self.transfer_from(caller, to, amount)
    }
    
    pub fn transfer_from(&mut self, from: Address, to: Address, amount: U256) -> bool {
        let caller = self.env().caller();
        
        if caller != from {
            let current_allowance = self.allowances.get(&(from, caller)).unwrap_or_default();
            require!(current_allowance >= amount, "Insufficient allowance");
            self.allowances.set(&(from, caller), current_allowance - amount);
        }
        
        let from_balance = self.balances.get(&from).unwrap_or_default();
        require!(from_balance >= amount, "Insufficient balance");
        
        self.balances.set(&from, from_balance - amount);
        
        let to_balance = self.balances.get(&to).unwrap_or_default();
        self.balances.set(&to, to_balance + amount);
        
        self.env().emit_event("Transfer", &(from, to, amount));
        true
    }
    
    pub fn approve(&mut self, spender: Address, amount: U256) -> bool {
        let caller = self.env().caller();
        self.allowances.set(&(caller, spender), amount);
        self.env().emit_event("Approval", &(caller, spender, amount));
        true
    }
    
    // View functions
    pub fn balance_of(&self, account: Address) -> U256 {
        self.balances.get(&account).unwrap_or_default()
    }
    
    pub fn allowance(&self, owner: Address, spender: Address) -> U256 {
        self.allowances.get(&(owner, spender)).unwrap_or_default()
    }
    
    pub fn get_collateral_position(&self, user: Address) -> Option<CollateralPosition> {
        self.collateral_positions.get(&user)
    }
    
    pub fn get_collateral_ratio(&self, user: Address) -> U256 {
        if let Some(position) = self.collateral_positions.get(&user) {
            let vcspr_price = self.vcspr_price.get_or_default();
            let collateral_value = position.vcspr_collateral * vcspr_price / U256::from(1_000_000_000_000_000_000u64);
            if position.synthetic_minted > U256::zero() {
                return collateral_value * U256::from(10000) / position.synthetic_minted;
            }
        }
        U256::zero()
    }
    
    pub fn total_supply(&self) -> U256 {
        self.total_supply.get_or_default()
    }
    
    pub fn name(&self) -> String {
        self.name.get_or_default()
    }
    
    pub fn symbol(&self) -> String {
        self.symbol.get_or_default()
    }
    
    pub fn decimals(&self) -> u8 {
        self.decimals.get_or_default()
    }
    
    // Admin functions
    pub fn update_price(&mut self, new_price: U256) {
        require!(self.env().caller() == self.owner.get_or_default(), "Only owner");
        self.vcspr_price.set(new_price);
        self.last_price_update.set(self.env().get_block_time());
        self.env().emit_event("PriceUpdated", &new_price);
    }
    
    pub fn add_supported_chain(&mut self, chain_id: u32) {
        require!(self.env().caller() == self.owner.get_or_default(), "Only owner");
        self.supported_chains.set(&chain_id, true);
    }
    
    pub fn pause(&mut self) {
        require!(self.env().caller() == self.owner.get_or_default(), "Only owner");
        self.paused.set(true);
    }
    
    pub fn unpause(&mut self) {
        require!(self.env().caller() == self.owner.get_or_default(), "Only owner");
        self.paused.set(false);
    }
}