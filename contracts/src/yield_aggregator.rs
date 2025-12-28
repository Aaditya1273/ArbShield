use odra::prelude::*;
use crate::types::YieldStrategy;

#[odra::module]
pub struct YieldAggregatorContract {
    // Strategy management
    strategies: Mapping<u32, YieldStrategy>,
    strategy_count: Variable<u32>,
    
    // User deposits per strategy
    user_deposits: Mapping<(Address, u32), U256>,
    user_rewards: Mapping<(Address, u32), U256>,
    
    // Total deposits per strategy
    strategy_totals: Mapping<u32, U256>,
    
    // Admin
    owner: Variable<Address>,
    paused: Variable<bool>,
    
    // Performance tracking
    total_yield_generated: Variable<U256>,
    active_strategies_count: Variable<u32>,
}

#[odra::module]
impl YieldAggregatorContract {
    pub fn init(&mut self, owner: Address) {
        self.owner.set(owner);
        self.strategy_count.set(0);
        self.active_strategies_count.set(0);
        self.paused.set(false);
        self.total_yield_generated.set(U256::zero());
        
        // Initialize default strategies
        self.add_default_strategies();
    }
    
    fn add_default_strategies(&mut self) {
        // Strategy 1: Conservative DeFi (Lower risk, stable returns)
        let conservative_strategy = YieldStrategy {
            id: 1,
            name: "Conservative DeFi Pool".to_string(),
            apy: 800, // 8% APY
            total_deposited: U256::zero(),
            is_active: true,
        };
        
        // Strategy 2: Aggressive DeFi (Higher risk, higher returns)
        let aggressive_strategy = YieldStrategy {
            id: 2,
            name: "High-Yield Farming".to_string(),
            apy: 1500, // 15% APY
            total_deposited: U256::zero(),
            is_active: true,
        };
        
        // Strategy 3: Cross-chain arbitrage
        let arbitrage_strategy = YieldStrategy {
            id: 3,
            name: "Cross-Chain Arbitrage".to_string(),
            apy: 1200, // 12% APY
            total_deposited: U256::zero(),
            is_active: true,
        };
        
        self.strategies.set(&1, conservative_strategy);
        self.strategies.set(&2, aggressive_strategy);
        self.strategies.set(&3, arbitrage_strategy);
        
        self.strategy_count.set(3);
        self.active_strategies_count.set(3);
    }
    
    #[odra(payable)]
    pub fn deposit_to_strategy(&mut self, strategy_id: u32) {
        let caller = self.env().caller();
        let amount = self.env().attached_value();
        
        require!(!self.paused.get_or_default(), "Contract is paused");
        require!(amount > U256::zero(), "Amount must be greater than zero");
        
        let strategy = self.strategies.get(&strategy_id)
            .expect("Strategy does not exist");
        require!(strategy.is_active, "Strategy is not active");
        
        // Update user deposit
        let current_deposit = self.user_deposits.get(&(caller, strategy_id)).unwrap_or_default();
        self.user_deposits.set(&(caller, strategy_id), current_deposit + amount);
        
        // Update strategy total
        let strategy_total = self.strategy_totals.get(&strategy_id).unwrap_or_default();
        self.strategy_totals.set(&strategy_id, strategy_total + amount);
        
        // Update strategy in mapping
        let mut updated_strategy = strategy;
        updated_strategy.total_deposited += amount;
        self.strategies.set(&strategy_id, updated_strategy);
        
        self.env().emit_event("DepositMade", &(caller, strategy_id, amount));
    }
    
    pub fn withdraw_from_strategy(&mut self, strategy_id: u32, amount: U256) {
        let caller = self.env().caller();
        
        require!(!self.paused.get_or_default(), "Contract is paused");
        
        let current_deposit = self.user_deposits.get(&(caller, strategy_id)).unwrap_or_default();
        require!(current_deposit >= amount, "Insufficient deposit balance");
        
        // Calculate and distribute rewards before withdrawal
        self.calculate_and_distribute_rewards(caller, strategy_id);
        
        // Update user deposit
        self.user_deposits.set(&(caller, strategy_id), current_deposit - amount);
        
        // Update strategy total
        let strategy_total = self.strategy_totals.get(&strategy_id).unwrap_or_default();
        self.strategy_totals.set(&strategy_id, strategy_total - amount);
        
        // Update strategy in mapping
        if let Some(mut strategy) = self.strategies.get(&strategy_id) {
            strategy.total_deposited -= amount;
            self.strategies.set(&strategy_id, strategy);
        }
        
        // Transfer tokens back to user
        self.env().transfer_tokens(&caller, &amount);
        
        self.env().emit_event("WithdrawalMade", &(caller, strategy_id, amount));
    }
    
    pub fn claim_rewards(&mut self, strategy_id: u32) {
        let caller = self.env().caller();
        
        // Calculate current rewards
        self.calculate_and_distribute_rewards(caller, strategy_id);
        
        let rewards = self.user_rewards.get(&(caller, strategy_id)).unwrap_or_default();
        require!(rewards > U256::zero(), "No rewards to claim");
        
        // Reset user rewards
        self.user_rewards.set(&(caller, strategy_id), U256::zero());
        
        // Transfer rewards to user
        self.env().transfer_tokens(&caller, &rewards);
        
        self.env().emit_event("RewardsClaimed", &(caller, strategy_id, rewards));
    }
    
    fn calculate_and_distribute_rewards(&mut self, user: Address, strategy_id: u32) {
        let strategy = self.strategies.get(&strategy_id);
        if strategy.is_none() {
            return;
        }
        
        let strategy = strategy.unwrap();
        let user_deposit = self.user_deposits.get(&(user, strategy_id)).unwrap_or_default();
        
        if user_deposit == U256::zero() {
            return;
        }
        
        // Calculate rewards based on APY (simplified daily calculation)
        let daily_rate = strategy.apy / 365; // basis points per day
        let daily_rewards = user_deposit * U256::from(daily_rate) / U256::from(10000);
        
        // Add to user rewards
        let current_rewards = self.user_rewards.get(&(user, strategy_id)).unwrap_or_default();
        self.user_rewards.set(&(user, strategy_id), current_rewards + daily_rewards);
        
        // Update total yield generated
        let total_yield = self.total_yield_generated.get_or_default();
        self.total_yield_generated.set(total_yield + daily_rewards);
    }
    
    pub fn add_strategy(&mut self, name: String, apy: u32) {
        require!(self.env().caller() == self.owner.get_or_default(), "Only owner");
        
        let strategy_count = self.strategy_count.get_or_default();
        let new_id = strategy_count + 1;
        
        let new_strategy = YieldStrategy {
            id: new_id,
            name,
            apy,
            total_deposited: U256::zero(),
            is_active: true,
        };
        
        self.strategies.set(&new_id, new_strategy);
        self.strategy_count.set(new_id);
        
        let active_count = self.active_strategies_count.get_or_default();
        self.active_strategies_count.set(active_count + 1);
        
        self.env().emit_event("StrategyAdded", &(new_id, apy));
    }
    
    pub fn toggle_strategy(&mut self, strategy_id: u32) {
        require!(self.env().caller() == self.owner.get_or_default(), "Only owner");
        
        if let Some(mut strategy) = self.strategies.get(&strategy_id) {
            strategy.is_active = !strategy.is_active;
            self.strategies.set(&strategy_id, strategy.clone());
            
            let active_count = self.active_strategies_count.get_or_default();
            if strategy.is_active {
                self.active_strategies_count.set(active_count + 1);
            } else {
                self.active_strategies_count.set(active_count - 1);
            }
            
            self.env().emit_event("StrategyToggled", &(strategy_id, strategy.is_active));
        }
    }
    
    // View functions
    pub fn get_strategy(&self, strategy_id: u32) -> Option<YieldStrategy> {
        self.strategies.get(&strategy_id)
    }
    
    pub fn get_user_deposit(&self, user: Address, strategy_id: u32) -> U256 {
        self.user_deposits.get(&(user, strategy_id)).unwrap_or_default()
    }
    
    pub fn get_user_rewards(&self, user: Address, strategy_id: u32) -> U256 {
        self.user_rewards.get(&(user, strategy_id)).unwrap_or_default()
    }
    
    pub fn get_strategy_total(&self, strategy_id: u32) -> U256 {
        self.strategy_totals.get(&strategy_id).unwrap_or_default()
    }
    
    pub fn get_all_strategies(&self) -> Vec<YieldStrategy> {
        let mut strategies = Vec::new();
        let count = self.strategy_count.get_or_default();
        
        for i in 1..=count {
            if let Some(strategy) = self.strategies.get(&i) {
                strategies.push(strategy);
            }
        }
        
        strategies
    }
    
    pub fn get_total_yield_generated(&self) -> U256 {
        self.total_yield_generated.get_or_default()
    }
    
    pub fn get_active_strategies_count(&self) -> u32 {
        self.active_strategies_count.get_or_default()
    }
    
    // Admin functions
    pub fn pause(&mut self) {
        require!(self.env().caller() == self.owner.get_or_default(), "Only owner");
        self.paused.set(true);
    }
    
    pub fn unpause(&mut self) {
        require!(self.env().caller() == self.owner.get_or_default(), "Only owner");
        self.paused.set(false);
    }
}