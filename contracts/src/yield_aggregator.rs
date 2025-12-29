use odra::prelude::*;
use crate::types::YieldStrategy;

#[odra::module]
pub struct YieldAggregatorContract {
    strategies: Mapping<u32, YieldStrategy>,
    strategy_count: Variable<u32>,
    user_deposits: Mapping<(Address, u32), U256>,
    owner: Variable<Address>,
}

#[odra::module]
impl YieldAggregatorContract {
    pub fn init(&mut self, owner: Address) {
        self.owner.set(owner);
        self.strategy_count.set(0);
    }
    
    pub fn add_strategy(&mut self, name: String, apy: u32) {
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
    }
    
    pub fn get_strategy(&self, strategy_id: u32) -> Option<YieldStrategy> {
        self.strategies.get(&strategy_id)
    }
}
