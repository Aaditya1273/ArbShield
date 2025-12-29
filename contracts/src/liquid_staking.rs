use odra::prelude::*;
use crate::types::{StakePosition, BurnMetrics};

#[odra::module]
pub struct LiquidStakingContract {
    total_cspr_staked: Variable<U256>,
    total_vcspr_supply: Variable<U256>,
    exchange_rate: Variable<U256>,
    positions: Mapping<Address, StakePosition>,
    owner: Variable<Address>,
}

#[odra::module]
impl LiquidStakingContract {
    pub fn init(&mut self, owner: Address) {
        self.owner.set(owner);
        self.exchange_rate.set(U256::from(1_000_000_000_000_000_000u64)); // 1:1 initially
    }
    
    #[odra(payable)]
    pub fn stake_cspr(&mut self) {
        let caller = self.env().caller();
        let amount = self.env().attached_value();
        
        let exchange_rate = self.exchange_rate.get_or_default();
        let vcspr_to_mint = amount * U256::from(1_000_000_000_000_000_000u64) / exchange_rate;
        
        let position = StakePosition {
            user: caller,
            cspr_amount: amount,
            vcspr_amount: vcspr_to_mint,
            timestamp: self.env().get_block_time(),
            rewards_earned: U256::zero(),
        };
        
        self.positions.set(&caller, position);
        
        let total_staked = self.total_cspr_staked.get_or_default();
        let total_supply = self.total_vcspr_supply.get_or_default();
        
        self.total_cspr_staked.set(total_staked + amount);
        self.total_vcspr_supply.set(total_supply + vcspr_to_mint);
    }
    
    pub fn get_user_position(&self, user: Address) -> Option<StakePosition> {
        self.positions.get(&user)
    }
    
    pub fn get_exchange_rate(&self) -> U256 {
        self.exchange_rate.get_or_default()
    }
}
