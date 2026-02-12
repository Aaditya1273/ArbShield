import { create } from "zustand";

interface OnboardingState {
  currentStep: number;
  completedSteps: number[];

  // Token amounts (shared between steps)
  wsttAmount: string;
  usdcAmount: string;

  // Step 1: Prepare Tokens
  wrapCompleted: boolean;
  mintCompleted: boolean;
  approveWSTTCompleted: boolean;
  approveUSDCCompleted: boolean;

  // Step 2: Deposit
  depositCompleted: boolean;

  // Step 3: Automation
  automationCompleted: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  setWsttAmount: (amount: string) => void;
  setUsdcAmount: (amount: string) => void;
  setWrapCompleted: (completed: boolean) => void;
  setMintCompleted: (completed: boolean) => void;
  setApproveWSTTCompleted: (completed: boolean) => void;
  setApproveUSDCCompleted: (completed: boolean) => void;
  setDepositCompleted: (completed: boolean) => void;
  setAutomationCompleted: (completed: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  completedSteps: [],
  wsttAmount: "",
  usdcAmount: "",
  wrapCompleted: false,
  mintCompleted: false,
  approveWSTTCompleted: false,
  approveUSDCCompleted: false,
  depositCompleted: false,
  automationCompleted: false,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setCurrentStep: (step) =>
    set((state) => ({
      currentStep: step,
      completedSteps: state.completedSteps.includes(step - 1)
        ? state.completedSteps
        : [...state.completedSteps, step - 1],
    })),

  completeStep: (step) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step],
    })),

  setWsttAmount: (amount) => set({ wsttAmount: amount }),
  setUsdcAmount: (amount) => set({ usdcAmount: amount }),
  setWrapCompleted: (completed) => set({ wrapCompleted: completed }),
  setMintCompleted: (completed) => set({ mintCompleted: completed }),
  setApproveWSTTCompleted: (completed) =>
    set({ approveWSTTCompleted: completed }),
  setApproveUSDCCompleted: (completed) =>
    set({ approveUSDCCompleted: completed }),
  setDepositCompleted: (completed) => set({ depositCompleted: completed }),
  setAutomationCompleted: (completed) =>
    set({ automationCompleted: completed }),

  reset: () => set(initialState),
}));
