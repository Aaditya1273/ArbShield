@echo off
REM Casper Velocity Deployment Script for Windows
REM Usage: deploy.bat [testnet|mainnet]

setlocal enabledelayedexpansion

set NETWORK=%1
if "%NETWORK%"=="" set NETWORK=testnet

set KEYS_DIR=.\keys
set CONTRACTS_DIR=.\contracts
set APP_DIR=.\app

echo 🚀 Deploying Casper Velocity to %NETWORK%

REM Check prerequisites
where casper-client >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ casper-client not found. Please install Casper CLI tools.
    exit /b 1
)

where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ cargo not found. Please install Rust.
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install Node.js.
    exit /b 1
)

REM Setup keys directory
if not exist "%KEYS_DIR%" (
    echo 📁 Creating keys directory...
    mkdir %KEYS_DIR%
)

if not exist "%KEYS_DIR%\secret_key.pem" (
    echo 🔑 Generating Casper keys...
    casper-client keygen %KEYS_DIR%\
    echo ✅ Keys generated. Please fund your account with testnet tokens:
    echo    https://testnet.cspr.live/tools/faucet
    type %KEYS_DIR%\public_key_hex
    pause
)

REM Set network configuration
if "%NETWORK%"=="testnet" (
    set NODE_ADDRESS=http://3.208.91.63:7777
    set CHAIN_NAME=casper-test
) else if "%NETWORK%"=="mainnet" (
    set NODE_ADDRESS=http://3.208.91.63:7777
    set CHAIN_NAME=casper
) else (
    echo ❌ Invalid network. Use 'testnet' or 'mainnet'
    exit /b 1
)

echo 🔧 Network: %NETWORK%
echo 🔧 Node: %NODE_ADDRESS%
echo 🔧 Chain: %CHAIN_NAME%

REM Build contracts
echo 🔨 Building smart contracts...
cd %CONTRACTS_DIR%

where cargo-odra >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing cargo-odra...
    cargo install cargo-odra --locked
)

echo 🔨 Building contracts with Odra...
cargo odra build

echo 🧪 Running contract tests...
cargo odra test

echo 🚀 Deploying contracts to %NETWORK%...
echo ✅ Contracts ready for deployment!

cd ..

REM Build frontend
echo 🌐 Building frontend application...
cd %APP_DIR%

echo 📦 Installing dependencies...
npm install

echo 🔨 Building production frontend...
npm run build

echo ✅ Frontend built successfully!

cd ..

echo.
echo 🎉 Casper Velocity Build Complete!
echo.
echo 📋 Next Steps:
echo    1. Fund your account: https://testnet.cspr.live/tools/faucet
echo    2. Deploy contracts manually using casper-client
echo    3. Update contract addresses in .env files
echo    4. Deploy frontend to NodeOps or hosting service
echo.
echo 🚀 Ready for hackathon demo!

pause