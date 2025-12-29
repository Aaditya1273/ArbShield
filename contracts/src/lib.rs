use odra::prelude::*;

#[odra::module]
pub struct SimpleContract {
    value: Variable<u32>,
}

#[odra::module]
impl SimpleContract {
    pub fn init(&mut self) {
        self.value.set(0);
    }
    
    pub fn set_value(&mut self, new_value: u32) {
        self.value.set(new_value);
    }
    
    pub fn get_value(&self) -> u32 {
        self.value.get_or_default()
    }
}
