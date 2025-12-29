use odra::prelude::*;
use crate::types::CollateralPosition;

#[odra::module]
pub struct SyntheticStablecoinContract {
    name: Variable<String>,
    symbol: Variable<String>,
    total_supply: Variable<U256>,
    balances: Mapping<Address, U256>,
    collateral_positions: Mapping<Address, CollateralPosition>,
    owner: Variable<Address>,
}

#[odra::module]
impl SyntheticStablecoinContract {
    pub fn init(&mut self, owner: Address) {
        self.owner.set(owner);
        self.name.set("Velocity Synthetic USD".to_string());
        self.symbol.set("vUSD".to_string());
        self.total_supply.set(U256::zero());
    }
    
    pub fn mint_with_collateral(&mut self, vcspr_amount: U256, synthetic_amount: U256) {
        let caller = self.env().caller();
        
        let position = CollateralPosition {
            user: caller,
            vcspr_collateral: vcspr_amount,
            synthetic_minted: synthetic_amount,
            liquidation_threshold: 13000, // 130%
        };
        
        self.collateral_positions.set(&caller, position);
        
        let current_balance = self.balances.get(&caller).unwrap_or_default();
        self.balances.set(&caller, current_balance + synthetic_amount);
        
        let total_supply = self.total_supply.get_or_default();
        self.total_supply.set(total_supply + synthetic_amount);
    }
    
    pub fn balance_of(&self, account: Address) -> U256 {
        self.balances.get(&account).unwrap_or_default()
    }
    
    pub fn total_supply(&self) -> U256 {
        self.total_supply.get_or_default()
    }
}
