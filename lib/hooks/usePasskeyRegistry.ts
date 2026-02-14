/**
 * Hook to interact with PasskeyRegistry contract
 * Provides on-chain passkey management with multi-device support
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { useState } from 'react';

// PasskeyRegistry ABI
const PASSKEY_REGISTRY_ABI = [
  {
    inputs: [
      { name: 'credentialId', type: 'bytes32' },
      { name: 'publicKey', type: 'bytes' },
      { name: 'deviceName', type: 'string' },
    ],
    name: 'registerPasskey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'credentialId', type: 'bytes32' }],
    name: 'revokePasskey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserPasskeys',
    outputs: [
      { name: 'credentialIds', type: 'bytes32[]' },
      { name: 'deviceNames', type: 'string[]' },
      { name: 'lastUsed', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'hasActivePasskey',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface PasskeyDevice {
  credentialId: string;
  deviceName: string;
  lastUsed: number;
}

/**
 * Hook to get user's registered passkeys from blockchain
 */
export function useUserPasskeys() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.PASSKEY_REGISTRY,
    abi: PASSKEY_REGISTRY_ABI,
    functionName: 'getUserPasskeys',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const passkeys: PasskeyDevice[] = data
    ? (data[0] as string[]).map((credId, index) => ({
        credentialId: credId,
        deviceName: (data[1] as string[])[index],
        lastUsed: Number((data[2] as bigint[])[index]),
      }))
    : [];

  return {
    passkeys,
    isLoading,
    refetch,
  };
}

/**
 * Hook to check if user has any active passkeys
 */
export function useHasPasskey() {
  const { address } = useAccount();

  const { data: hasPasskey, isLoading } = useReadContract({
    address: CONTRACTS.PASSKEY_REGISTRY,
    abi: PASSKEY_REGISTRY_ABI,
    functionName: 'hasActivePasskey',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    hasPasskey: hasPasskey as boolean,
    isLoading,
  };
}

/**
 * Hook to register a passkey on-chain
 */
export function useRegisterPasskey() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const registerPasskey = async (
    credentialId: string,
    publicKey: string,
    deviceName: string
  ) => {
    // Convert credentialId to bytes32
    const credIdBytes32 = `0x${credentialId.padEnd(64, '0')}` as `0x${string}`;
    
    // Convert publicKey to bytes
    const publicKeyBytes = publicKey as `0x${string}`;

    writeContract({
      address: CONTRACTS.PASSKEY_REGISTRY,
      abi: PASSKEY_REGISTRY_ABI,
      functionName: 'registerPasskey',
      args: [credIdBytes32, publicKeyBytes, deviceName],
    });
  };

  return {
    registerPasskey,
    isPending: isPending || isConfirming,
    hash,
  };
}

/**
 * Hook to revoke a passkey
 */
export function useRevokePasskey() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const revokePasskey = async (credentialId: string) => {
    const credIdBytes32 = `0x${credentialId.padEnd(64, '0')}` as `0x${string}`;

    writeContract({
      address: CONTRACTS.PASSKEY_REGISTRY,
      abi: PASSKEY_REGISTRY_ABI,
      functionName: 'revokePasskey',
      args: [credIdBytes32],
    });
  };

  return {
    revokePasskey,
    isPending: isPending || isConfirming,
    hash,
  };
}
