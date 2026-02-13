# Stylus Deployment Checklist

Use this checklist to ensure a smooth deployment.

## Pre-Deployment

### Environment Setup
- [ ] Rust installed (v1.92.0+)
- [ ] `wasm32-unknown-unknown` target added
- [ ] `cargo-stylus` CLI installed
- [ ] `.env` file configured with private key
- [ ] Wallet has sufficient Arbitrum Sepolia ETH (0.01+ ETH)

### Code Verification
- [ ] Contract builds successfully
- [ ] `cargo stylus check` passes
- [ ] No compilation warnings
- [ ] Dependencies are up to date

### Testing
- [ ] Local tests pass (`cargo test`)
- [ ] Code reviewed for security issues
- [ ] Gas estimation reviewed

## Deployment

### Execute Deployment
- [ ] Run `./pre-deploy-check.sh` - all checks pass
- [ ] Run `./deploy.sh testnet`
- [ ] Contract address received
- [ ] Deployment transaction confirmed

### Verification
- [ ] Contract visible on Arbiscan Sepolia
- [ ] Contract bytecode matches local build
- [ ] Transaction shows successful deployment

## Post-Deployment

### Testing
- [ ] Run `./test-deployment.sh <address>`
- [ ] Test contract initialization
- [ ] Test proof verification
- [ ] Verify gas costs (~192k gas)

### Integration
- [ ] Run `./update-frontend.sh <address>`
- [ ] Frontend updated with new address
- [ ] Test end-to-end verification flow
- [ ] Verify transactions on Arbiscan

### Documentation
- [ ] Save deployment info (address, timestamp, network)
- [ ] Update README with contract address
- [ ] Document any deployment issues
- [ ] Share contract address with team

## Monitoring

### Initial Monitoring (First 24 Hours)
- [ ] Monitor first verification transactions
- [ ] Check gas usage patterns
- [ ] Verify no errors in contract calls
- [ ] Monitor wallet balance

### Ongoing
- [ ] Set up alerts for contract calls
- [ ] Track verification success rate
- [ ] Monitor gas costs over time
- [ ] Plan for mainnet deployment

## Mainnet Preparation (When Ready)

### Security
- [ ] Complete security audit
- [ ] Bug bounty program launched
- [ ] Emergency procedures documented
- [ ] Upgrade path planned

### Testing
- [ ] Extensive testnet testing completed
- [ ] Load testing performed
- [ ] Edge cases tested
- [ ] Integration tests pass

### Deployment
- [ ] Mainnet wallet funded
- [ ] Team notified of deployment
- [ ] Monitoring systems ready
- [ ] Rollback plan documented

---

## Quick Commands Reference

```bash
# Pre-deployment check
./pre-deploy-check.sh

# Deploy to testnet
./deploy.sh testnet

# Test deployment
./test-deployment.sh <contract_address>

# Update frontend
./update-frontend.sh <contract_address>

# Deploy to mainnet (when ready)
./deploy.sh mainnet
```

## Emergency Contacts

- Technical Lead: [Name/Contact]
- Security Team: [Contact]
- Arbitrum Support: https://discord.gg/arbitrum

## Notes

Use this space for deployment-specific notes:

```
Deployment Date: _______________
Network: _______________________
Contract Address: ______________
Deployer Address: ______________
Gas Used: ______________________
Issues Encountered: ____________
_________________________________
_________________________________
```
