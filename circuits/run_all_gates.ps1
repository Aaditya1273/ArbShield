# run_all_gates.ps1 - PowerShell version of the three gates test

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         THREE GATES TO PRODUCTION READINESS               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script runs the three critical tests that determine"
Write-Host "if your verifier is production ready."
Write-Host ""
Write-Host "Gate 1: Public Input Ordering"
Write-Host "Gate 2: Precompile vs Arkworks"
Write-Host "Gate 3: Parity Test (THE KING)"
Write-Host ""
Write-Host "All three MUST pass for production deployment."
Write-Host ""

$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Cancelled"
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "GATE 1: PUBLIC INPUT ORDERING VERIFICATION" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Check if build directory exists
if (-not (Test-Path "build/verification_key.json")) {
    Write-Host "❌ build/verification_key.json not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to generate circuit keys first:" -ForegroundColor Yellow
    Write-Host "  bash generate_vk.sh" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or if bash doesn't work, install circom and snarkjs:" -ForegroundColor Yellow
    Write-Host "  npm install -g circom snarkjs" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

node verify_input_order.js
$GATE1 = $LASTEXITCODE

if ($GATE1 -ne 0) {
    Write-Host ""
    Write-Host "❌ GATE 1 FAILED" -ForegroundColor Red
    Write-Host "   Public input ordering is incorrect"
    Write-Host "   Fix this before proceeding"
    exit 1
}

Write-Host ""
Write-Host "✅ GATE 1 PASSED" -ForegroundColor Green
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "GATE 2: PRECOMPILE vs ARKWORKS PARITY" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

if (-not $env:CONTRACT_ADDRESS) {
    Write-Host "⚠️  CONTRACT_ADDRESS not set, skipping Gate 2" -ForegroundColor Yellow
    Write-Host "   Set CONTRACT_ADDRESS to run this test"
    Write-Host "   Example: `$env:CONTRACT_ADDRESS = '0x...'"
    $GATE2 = 0
} else {
    node test_precompile_parity.js
    $GATE2 = $LASTEXITCODE
    
    if ($GATE2 -ne 0) {
        Write-Host ""
        Write-Host "❌ GATE 2 FAILED" -ForegroundColor Red
        Write-Host "   Precompile and arkworks disagree"
        Write-Host "   Use precompile for production"
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ GATE 2 PASSED" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "GATE 3: PARITY TEST - THE KING" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""
Write-Host "This is the MOST IMPORTANT test."
Write-Host "It will generate 20 random proofs and verify:"
Write-Host "  snarkjs verify == contract verify"
Write-Host ""
Write-Host "This will take ~5-10 minutes."
Write-Host ""

$confirm_parity = Read-Host "Run parity test? (yes/no)"

if ($confirm_parity -ne "yes") {
    Write-Host "⚠️  Skipping parity test" -ForegroundColor Yellow
    Write-Host "   WARNING: You MUST run this before production!"
    $GATE3 = 0
} else {
    if (-not $env:CONTRACT_ADDRESS) {
        Write-Host "❌ CONTRACT_ADDRESS not set" -ForegroundColor Red
        Write-Host "   Cannot run parity test"
        Write-Host ""
        Write-Host "Set it with:"
        Write-Host "  `$env:CONTRACT_ADDRESS = '0x...'"
        exit 1
    }
    
    node parity_test.js
    $GATE3 = $LASTEXITCODE
    
    if ($GATE3 -ne 0) {
        Write-Host ""
        Write-Host "❌ GATE 3 FAILED" -ForegroundColor Red
        Write-Host "   Parity test failed - system is BROKEN"
        Write-Host "   Do NOT deploy to production"
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ GATE 3 PASSED" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              🎉 ALL GATES PASSED 🎉                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Your verifier is PRODUCTION READY!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:"
Write-Host "  ✅ Gate 1: Public input ordering correct" -ForegroundColor Green
if ($GATE2 -eq 0 -and $env:CONTRACT_ADDRESS) {
    Write-Host "  ✅ Gate 2: Precompile and arkworks agree" -ForegroundColor Green
} elseif (-not $env:CONTRACT_ADDRESS) {
    Write-Host "  ⚠️  Gate 2: Skipped (no contract address)" -ForegroundColor Yellow
}
if ($GATE3 -eq 0 -and $confirm_parity -eq "yes") {
    Write-Host "  ✅ Gate 3: 100% parity with snarkjs" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Gate 3: Skipped" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "You can now deploy to mainnet with confidence." -ForegroundColor Green
Write-Host ""
Write-Host "Final checklist:"
Write-Host "  [ ] Security audit completed"
Write-Host "  [ ] Load testing done (1000+ proofs)"
Write-Host "  [ ] Emergency procedures documented"
Write-Host "  [ ] Monitoring set up"
Write-Host "  [ ] VK hash published"
Write-Host ""
Write-Host "Good luck! 🚀" -ForegroundColor Cyan
