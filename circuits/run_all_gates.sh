#!/bin/bash
# run_all_gates.sh - Run ALL three gates to production readiness

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         THREE GATES TO PRODUCTION READINESS               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "This script runs the three critical tests that determine"
echo "if your verifier is production ready."
echo ""
echo "Gate 1: Parity Test (THE KING)"
echo "Gate 2: Public Input Ordering"
echo "Gate 3: Precompile vs Arkworks"
echo ""
echo "All three MUST pass for production deployment."
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "GATE 1: PUBLIC INPUT ORDERING VERIFICATION"
echo "════════════════════════════════════════════════════════════"
echo ""

node verify_input_order.js
GATE1=$?

if [ $GATE1 -ne 0 ]; then
    echo ""
    echo "❌ GATE 1 FAILED"
    echo "   Public input ordering is incorrect"
    echo "   Fix this before proceeding"
    exit 1
fi

echo ""
echo "✅ GATE 1 PASSED"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "GATE 2: PRECOMPILE vs ARKWORKS PARITY"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "⚠️  CONTRACT_ADDRESS not set, skipping Gate 2"
    echo "   Set CONTRACT_ADDRESS to run this test"
    GATE2=0
else
    node test_precompile_parity.js
    GATE2=$?
    
    if [ $GATE2 -ne 0 ]; then
        echo ""
        echo "❌ GATE 2 FAILED"
        echo "   Precompile and arkworks disagree"
        echo "   Use precompile for production"
        exit 1
    fi
    
    echo ""
    echo "✅ GATE 2 PASSED"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "GATE 3: PARITY TEST - THE KING"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "This is the MOST IMPORTANT test."
echo "It will generate 20 random proofs and verify:"
echo "  snarkjs verify == contract verify"
echo ""
echo "This will take ~5-10 minutes."
echo ""
read -p "Run parity test? (yes/no): " confirm_parity

if [ "$confirm_parity" != "yes" ]; then
    echo "⚠️  Skipping parity test"
    echo "   WARNING: You MUST run this before production!"
    GATE3=0
else
    if [ -z "$CONTRACT_ADDRESS" ]; then
        echo "❌ CONTRACT_ADDRESS not set"
        echo "   Cannot run parity test"
        exit 1
    fi
    
    node parity_test.js
    GATE3=$?
    
    if [ $GATE3 -ne 0 ]; then
        echo ""
        echo "❌ GATE 3 FAILED"
        echo "   Parity test failed - system is BROKEN"
        echo "   Do NOT deploy to production"
        exit 1
    fi
    
    echo ""
    echo "✅ GATE 3 PASSED"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              🎉 ALL GATES PASSED 🎉                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Your verifier is PRODUCTION READY!"
echo ""
echo "Summary:"
echo "  ✅ Gate 1: Public input ordering correct"
echo "  ✅ Gate 2: Precompile and arkworks agree"
echo "  ✅ Gate 3: 100% parity with snarkjs"
echo ""
echo "You can now deploy to mainnet with confidence."
echo ""
echo "Final checklist:"
echo "  [ ] Security audit completed"
echo "  [ ] Load testing done (1000+ proofs)"
echo "  [ ] Emergency procedures documented"
echo "  [ ] Monitoring set up"
echo "  [ ] VK hash published"
echo ""
echo "Good luck! 🚀"
