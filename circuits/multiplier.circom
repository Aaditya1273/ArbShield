pragma circom 2.0.0;

// Simple circuit: prove you know a, b such that a * b = c
template Multiplier() {
    signal input a;
    signal input b;
    signal output c;
    
    c <== a * b;
}

component main {public [c]} = Multiplier();
