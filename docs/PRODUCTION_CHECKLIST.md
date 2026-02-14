# Production Deployment Checklist

## Pre-Deployment Verification

### ✅ Step 1: Generate YOUR Verification Key
```bash
cd circuits
bash generate_vk.sh
```

**Verify**:
- [ ] `build/verification_key.json` exists
- [ ] `build/proof.json` exists
- [ ] snarkjs verification passes locally
- [ ] Note the VK hash from output

### ✅ Step 2: Extract VK with Coordinate Swapping
```bash
node extract_vk.js > vk_output.txt
```

**Critical checks**:
- [ ] G2 coordinates are SWAPPED (x1, x0 → x0, x1)
- [ ] VK hash is included
- [ ] All constants are 32 bytes
- [ ] IC points match number of public inputs

### ✅ Step 3: Update Rust Contract
```bash
# Copy vk_constants module to src/lib.rs
cat vk_output.txt
```

**Verify**:
- [ ] VK_HASH constant matches
- [ ] N_PUBLIC matches your circuit
- [ ] All G2 points have "// swapped" comments
- [ ] No placeholder values remain

### ✅ Step 4: Test Locally First
```bash
cd contracts/lib/verifier
cargo test --release
```

**Expected**:
- [ ] All tests pass
- [ ] Pairing check works
- [ ] Public input combination correct

### ✅ Step 5: Deploy with Safety Checks
```bash
export PRIVATE_KEY=0x...
bash deploy_production.sh
```

**The script will**:
- [ ] Check VK hash matches
- [ ] Build optimized WASM
- [ ] Run cargo stylus check
- [ ] Ask for confirmation
- [ ] Deploy to Arbitrum Sepolia
- [ ] Save deployment info

### ✅ Step 6: Test with Real Proof
```bash
cd ../../../circuits
export CONTRACT_ADDRESS=0x...
node test_real_proof.js
```

**Expected**:
- [ ] Proof verifies successfully
- [ ] Gas used ~200k
- [ ] Transaction succeeds
- [ ] Event emitted

## Common Issues & Fixes

### Issue: "VK hash mismatch"
**Cause**: VK in code doesn't match verification_key.json
**Fix**: Re-run `node extract_vk.js` and update lib.rs

### Issue: "Proof verification failed"
**Possible causes**:
1. **G2 coordinate order** - Check "// swapped" comments
2. **Wrong VK** - Regenerate from YOUR circuit
3. **Proof format** - Check encoding in test script
4. **Public inputs** - Must be 32-byte Fr elements

**Debug**:
```bash
# Verify proof locally first
cd circuits
snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json
```

### Issue: "Pairing check fails"
**Cause**: Usually coordinate ordering
**Fix**: 
1. Check G2 points are swapped
2. Verify proof encoding matches arkworks format
3. Test with precompile path

### Issue: "Gas estimation fails"
**Cause**: Contract not initialized or wrong address
**Fix**:
```bash
# Check contract exists
cast code $CONTRACT_ADDRESS --rpc-url https://sepolia-rollup.arbitrum.io/rpc
```

## Production Best Practices

### ✅ Use Precompile Path
```rust
// Always prefer precompile for production
pub fn verify_with_precompile(
    &mut self,
    proof_bytes: Vec<u8>,
    public_inputs: Vec<Vec<u8>>,
) -> Result<bool, Vec<u8>>
```

**Why**: Matches Ethereum reference implementation exactly

### ✅ Validate Subgroup Membership
```rust
// Check points are in correct subgroup
if !point.is_on_curve() || !point.is_in_correct_subgroup_assuming_on_curve() {
    return Err(b"Invalid point".to_vec());
}
```

### ✅ Hash VK on Deployment
```rust
pub const VK_HASH: &str = "abc123...";

// Verify at runtime
assert_eq!(compute_vk_hash(), VK_HASH, "VK mismatch!");
```

### ✅ Test Matrix

| Test Case | Expected | Status |
|-----------|----------|--------|
| Valid proof from YOUR circuit | ✅ Pass | |
| Valid proof from DIFFERENT circuit | ❌ Fail | |
| Invalid proof (wrong values) | ❌ Fail | |
| Malformed proof (wrong length) | ❌ Fail | |
| Wrong public inputs | ❌ Fail | |
| Infinity points | ❌ Fail | |

### ✅ Gas Benchmarks

| Operation | Expected Gas | Actual |
|-----------|--------------|--------|
| Verify (arkworks) | ~200k | |
| Verify (precompile) | ~180k | |
| Parse proof | ~10k | |
| Public input combination | ~5k per input | |

## Mainnet Deployment

### Additional Checks
- [ ] Security audit completed
- [ ] Circuit audited by ZK expert
- [ ] Trusted setup ceremony verified
- [ ] VK hash published publicly
- [ ] Emergency pause mechanism
- [ ] Upgrade path defined
- [ ] Gas costs acceptable
- [ ] Load tested (1000+ proofs)

### Monitoring
- [ ] Track verification success rate
- [ ] Monitor gas usage
- [ ] Alert on failures
- [ ] Log VK hash on each deployment

## Emergency Procedures

### If Proofs Start Failing
1. Check VK hash hasn't changed
2. Verify circuit hasn't been modified
3. Test proof locally with snarkjs
4. Check coordinate ordering
5. Rollback if needed

### If Gas Spikes
1. Switch to precompile path
2. Optimize public input count
3. Consider batching verifications

## Sign-Off

- [ ] All tests pass
- [ ] VK hash verified
- [ ] Deployment successful
- [ ] Real proof verified on-chain
- [ ] Gas costs acceptable
- [ ] Documentation updated

**Deployed by**: _________________
**Date**: _________________
**Contract**: _________________
**VK Hash**: _________________

---

**Remember**: In ZK, there is no partial credit. Either it works 100% or it doesn't work at all.
