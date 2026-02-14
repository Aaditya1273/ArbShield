# Battle-Ready Checklist

## The Three Gates to Production

This is not "does it work?" This is "can I trust this with real money?"

### 🎯 Gate 1: Public Input Ordering (FROZEN FOREVER)

**Test**: `node verify_input_order.js`

**What it checks**:
- IC structure matches circuit
- Public signals in correct order
- Frontend sends inputs correctly

**Pass criteria**: ✅ Ordering verified and frozen

**If fails**: Fix circuit or frontend, never deploy

---

### 🎯 Gate 2: Precompile vs Arkworks Parity

**Test**: `node test_precompile_parity.js`

**What it checks**:
- Both verification paths agree
- Gas costs are reasonable
- Serialization is correct

**Pass criteria**: ✅ Both paths return same result

**If disagrees**: 
- Trust precompile (canonical truth)
- Debug arkworks
- Use precompile for production

---

### 🎯 Gate 3: Parity Test - THE KING 👑

**Test**: `node parity_test.js`

**What it checks**:
- 20-50 random witnesses
- snarkjs verify == contract verify
- 100% agreement required

**Pass criteria**: ✅ 100% parity (not 99%, not 99.9%, exactly 100%)

**If fails**: 
- System is BROKEN
- Do NOT deploy
- Debug:
  1. G2 coordinate ordering
  2. VK mismatch
  3. Proof encoding
  4. Public input ordering

---

## The Mental Shift

### Before (Junior Engineer)
- "Does it compile?"
- "Does one test pass?"
- "Looks good to me"

### After (Senior Engineer)
- "Does it match reference implementation?"
- "Do ALL tests pass?"
- "Can I prove it's correct?"

### Production (Battle-Tested)
- "Have I tested 50 random cases?"
- "What happens when precompile disagrees?"
- "Is the VK hash frozen?"
- "Can I sleep at night?"

---

## Running All Gates

```bash
cd circuits

# Quick check (5 minutes)
bash run_all_gates.sh

# Full parity test (10 minutes, 50 proofs)
NUM_TESTS=50 node parity_test.js
```

---

## What Each Test Proves

### verify_input_order.js
**Proves**: Your circuit's public inputs are in the order you think they are.

**Why it matters**: If wrong, every proof will fail in production.

**Time to run**: 1 second

**Frequency**: Run once, freeze forever

---

### test_precompile_parity.js
**Proves**: Your two verification paths agree.

**Why it matters**: Precompile is canonical truth. If they disagree, you're using wrong math.

**Time to run**: 30 seconds

**Frequency**: Run on every deployment

---

### parity_test.js
**Proves**: Your verifier matches snarkjs exactly.

**Why it matters**: This is the ONLY test that matters. If this fails, nothing else matters.

**Time to run**: 5-10 minutes (20 proofs), 20-30 minutes (50 proofs)

**Frequency**: Run before EVERY production deployment

---

## Production Deployment Flow

```
1. Generate circuit keys
   ↓
2. Extract VK (with coordinate swapping)
   ↓
3. Update Rust contract
   ↓
4. Run verify_input_order.js ✅
   ↓
5. Deploy to testnet
   ↓
6. Run test_precompile_parity.js ✅
   ↓
7. Run parity_test.js (20 proofs) ✅
   ↓
8. Run parity_test.js (50 proofs) ✅
   ↓
9. Security audit
   ↓
10. Deploy to mainnet
```

---

## Red Flags 🚩

### Immediate Stop Deployment

- ❌ Parity test shows ANY mismatch
- ❌ VK hash doesn't match
- ❌ Precompile and arkworks disagree
- ❌ Public input ordering wrong
- ❌ Gas costs > 500k
- ❌ Any test fails

### Investigate But Maybe OK

- ⚠️ Precompile not available (use arkworks)
- ⚠️ Gas slightly higher than expected
- ⚠️ One proof takes longer

### Green Lights ✅

- ✅ 100% parity on 50+ proofs
- ✅ VK hash matches
- ✅ Both paths agree
- ✅ Gas < 250k
- ✅ All tests pass

---

## The Honest Truth

### Is this fake?
❌ No. This is real cryptography.

### Is this production ready?
✅ Yes, IF all three gates pass.

### Will it work first try?
😈 Probably not. Expect coordinate ordering issues.

### Will it work after fixes?
✅ Yes. The math is sound.

### Can I trust it with real money?
✅ Yes, IF:
- All three gates pass
- Security audit done
- VK hash frozen
- Monitoring in place

---

## What Professionals Do

1. ✅ Run parity test with 100+ proofs
2. ✅ Use precompile for production
3. ✅ Keep arkworks for tests
4. ✅ Auto-generate VK from JSON
5. ✅ Check VK hash on deployment
6. ✅ Fail deployment if mismatch
7. ✅ Monitor verification success rate
8. ✅ Have rollback plan

---

## Emergency Procedures

### If Proofs Start Failing in Production

1. Check VK hash hasn't changed
2. Verify circuit hasn't been modified
3. Test proof locally with snarkjs
4. Check coordinate ordering
5. Switch to precompile if using arkworks
6. Rollback if needed

### If Gas Spikes

1. Switch to precompile path
2. Optimize public input count
3. Consider batching verifications
4. Check for DoS attack

### If Parity Breaks

1. STOP ALL DEPLOYMENTS
2. Run full diagnostic
3. Check VK matches
4. Verify coordinate ordering
5. Test with known-good proof
6. Do NOT deploy until fixed

---

## Sign-Off

Before deploying to mainnet, all team members must sign:

- [ ] All three gates passed
- [ ] VK hash verified
- [ ] 50+ proofs tested
- [ ] Security audit complete
- [ ] Monitoring configured
- [ ] Emergency procedures documented
- [ ] I understand there is no partial credit in cryptography

**Deployed by**: _________________  
**Date**: _________________  
**Contract**: _________________  
**VK Hash**: _________________  
**Parity Rate**: _________________  

---

## Remember

> "In cryptography, there is no partial credit.  
> Either it works 100% or it doesn't work at all.  
> Test like your money depends on it.  
> Because it does."

---

**You are now battle-ready.** 🛡️
