use odra::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, OdraType)]
pub struct StakePosition {
    pub user: Address,
    pub cspr_amount: U256,
    pub vcspr_amount: U256,
    pub timestamp: u64,
    pub rewards_earned: U256,
}

#[derive(Clone, Debug, PartialEq, Eq, OdraType)]
pub struct YieldStrategy {
    pub id: u32,
    pub name: String,
    pub apy: u32,
    pub total_deposited: U256,
    pub is_active: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, OdraType)]
pub struct CollateralPosition {
    pub user: Address,
    pub vcspr_collateral: U256,
    pub synthetic_minted: U256,
    pub liquidation_threshold: u32,
}

#[derive(Clone, Debug, PartialEq, Eq, OdraType)]
pub struct BurnMetrics {
    pub total_fees_burned: U256,
    pub transactions_count: u64,
    pub last_burn_timestamp: u64,
}
