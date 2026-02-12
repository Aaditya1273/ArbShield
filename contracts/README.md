# 🏗️ LiquidMesh Smart Contracts

**AI-Powered Concentrated Liquidity Management on Somnia**

Production-ready smart contracts for autonomous LP position optimization using multi-agent AI coordination.

---

## 📦 **Contracts Overview**

| Contract             | Address                                      | Purpose                                  |
| -------------------- | -------------------------------------------- | ---------------------------------------- |
| `WrappedSTT.sol`     | `0x9e1B4FbB45F30b0628e4C406A6F4Eec1fadb54E1` | Wrap native STT → wSTT for DEX pairs     |
| `MockUSDC.sol`       | `0x758dA18F8424f637f788a0CD0DAF8407069D380b` | Test USDC token (6 decimals)             |
| `LiquidityVault.sol` | `0x28205BB97e1BEe146E0b095D3cf62433D9bAb47d` | Main vault for pair deposits & LP tokens |
| `AgentExecutor.sol`  | `0x5e639e2F345577514aFA0159AEdDf0A832e4139f` | AI agent proposal & execution system     |

---

## 📁 **File Structure**

```
contracts/
├── README.md
├── contracts/
│   ├── AgentExecutor.sol
│   ├── LiquidityVault.sol
│   ├── MockUSDC.sol
│   └── WrappedSTT.sol
├── scripts/
│   └── deploy.ts
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

---

## 🎯 **What This Does**

### **Problem:**

Managing concentrated liquidity positions is complex and requires constant monitoring.

### **Solution:**

AI agents automatically optimize your wSTT/USDC liquidity positions:

1. **User deposits** wSTT + USDC → Receives LP tokens
2. **AI agents monitor** market conditions 24/7
3. **Agents propose** optimal range adjustments
4. **User executes** or agents auto-rebalance
5. **User earns** trading fees automatically
6. **User withdraws** anytime (burns LP tokens)

---

## ⚙️ **Tech Stack**

-   **Solidity:** 0.8.28
-   **Framework:** Hardhat 2.19.0
-   **Deployment:** ethers.js scripts
-   **Libraries:** OpenZeppelin Contracts
-   **Network:** Somnia Testnet (Chain ID: 50312)

---

## 🚀 **Quick Start**

### **Prerequisites**

-   Node.js 18+
-   Somnia testnet STT for gas ([Get from faucet](https://testnet.somnia.network))

### **1. Install Dependencies**

```bash
cd contracts
bun install
```

### **2. Configure Environment**

Set your private key in `.env`:

```bash
echo "SOMNIA_PRIVATE_KEY=your_private_key_here" > .env
```

### **3. Compile Contracts**

```bash
npx hardhat compile
```

### **4. Deploy to Somnia Testnet**

```bash
npx hardhat run scripts/deploy.ts --network somnia
```

---

## 🧪 **Testing**

### **Run Tests**

```bash
npx hardhat test
```

### **Test Coverage**

```bash
npx hardhat coverage
```

---

## 🔍 **Verify on Somnia Explorer**

All contracts are already verified! View them at:

-   [WrappedSTT](https://shannon-explorer.somnia.network/address/0x9e1B4FbB45F30b0628e4C406A6F4Eec1fadb54E1#code)
-   [MockUSDC](https://shannon-explorer.somnia.network/address/0x758dA18F8424f637f788a0CD0DAF8407069D380b#code)
-   [LiquidityVault](https://shannon-explorer.somnia.network/address/0x28205BB97e1BEe146E0b095D3cf62433D9bAb47d#code)
-   [AgentExecutor](https://shannon-explorer.somnia.network/address/0x5e639e2F345577514aFA0159AEdDf0A832e4139f#code)

### DEX Adapter Notes

-   Current demo integration uses the `LiquidityVault` together with a Uniswap V2-style router (Somnia Exchange V2) for agent-driven deposits/withdrawals.
-   Planned concentrated-liquidity integrations (Somnex/QuickSwap V3) will rely on their position manager contracts once available on Somnia Testnet.

---

## 🏗️ **Architecture**

### **Contract Relationships**

```
User
  │
  ├─> WrappedSTT.deposit() → Wrap STT to wSTT
  │
  ├─> MockUSDC.mint() → Get test USDC
  │
  ├─> LiquidityVault.depositPair()
  │     ├─ Transfers wSTT + USDC
  │     ├─ Mints LP tokens (ERC20)
  │     └─ Creates position
  │
  └─> AgentExecutor.executeProposal()
        └─ Updates vault position range

AI Agents (off-chain)
  │
  ├─> Monitor vault positions
  ├─> Analyze market conditions
  └─> AgentExecutor.proposeStrategy()
        └─ Stores reasoning on-chain
```

### **Data Flow**

```
1. Deposit → Event emitted
2. Agent detects → Analyzes position
3. Agent proposes → Stored on-chain
4. User/agent executes → Range updated
5. Fees accrue → Claimable anytime
6. User withdraws → LP tokens burned
```

---

## 🔐 **Security Features**

-   ✅ **ReentrancyGuard** on all state-changing functions
-   ✅ **Ownable** for access control
-   ✅ **Pausable** for emergency stops
-   ✅ **Input validation** on all parameters
-   ✅ **CEI pattern** (Checks-Effects-Interactions)
-   ✅ **Agent authorization** system

---

## 🐛 **Troubleshooting**

### **"Insufficient funds for gas"**

Get more STT from [Somnia faucet](https://testnet.somnia.network)

### **"SOMNIA_PRIVATE_KEY not set"**

Set in `.env` file: `SOMNIA_PRIVATE_KEY=your_key_here`

### **"Transaction reverted"**

Check:

-   Token approvals are sufficient
-   Minimum deposit met (10 USDC)
-   Agent is authorized (for proposals)

## ⚠️ **Disclaimer**

This is a **hackathon project** for Somnia AI Hackathon 2025. Not for production use.

**Questions?** Check the main project [README](../README.md) or open an issue.
