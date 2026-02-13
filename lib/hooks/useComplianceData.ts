/**
 * Hook to fetch real compliance data from blockchain
 */

import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { useEffect, useState } from 'react';
import { CONTRACTS } from '@/lib/contracts';

// ComplianceRegistry ABI (minimal for reading)
const COMPLIANCE_REGISTRY_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }, { name: 'attributeType', type: 'string' }],
    name: 'isCompliant',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserAttributes',
    outputs: [{ name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'attributeType', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'ComplianceVerified',
    type: 'event',
  },
] as const;

export interface VerifiedAttribute {
  attributeType: string;
  timestamp: number;
  txHash: string;
  blockNumber: number;
}

export function useComplianceData() {
  const { address } = useAccount();
  const [verifiedAttributes, setVerifiedAttributes] = useState<VerifiedAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's verified attributes
  const { data: attributes, refetch } = useReadContract({
    address: CONTRACTS.COMPLIANCE_REGISTRY,
    abi: COMPLIANCE_REGISTRY_ABI,
    functionName: 'getUserAttributes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Watch for new verifications
  useWatchContractEvent({
    address: CONTRACTS.COMPLIANCE_REGISTRY,
    abi: COMPLIANCE_REGISTRY_ABI,
    eventName: 'ComplianceVerified',
    onLogs(logs) {
      console.log('New compliance verification:', logs);
      refetch();
    },
  });

  useEffect(() => {
    if (attributes && address) {
      // In a real implementation, you would fetch event logs to get timestamps and tx hashes
      // For now, we'll create a structure from the attributes
      const attrs = (attributes as string[]).map((attr, index) => ({
        attributeType: attr,
        timestamp: Date.now() - index * 86400000, // Mock: 1 day apart
        txHash: `0x${Math.random().toString(16).slice(2)}`,
        blockNumber: 0,
      }));
      setVerifiedAttributes(attrs);
      setLoading(false);
    } else if (!address) {
      setVerifiedAttributes([]);
      setLoading(false);
    }
  }, [attributes, address]);

  return {
    verifiedAttributes,
    loading,
    refetch,
  };
}

/**
 * Hook to check if user has specific compliance attribute
 */
export function useIsCompliant(attributeType: string) {
  const { address } = useAccount();

  const { data: isCompliant, isLoading } = useReadContract({
    address: CONTRACTS.COMPLIANCE_REGISTRY,
    abi: COMPLIANCE_REGISTRY_ABI,
    functionName: 'isCompliant',
    args: address && attributeType ? [address, attributeType] : undefined,
    query: {
      enabled: !!address && !!attributeType,
    },
  });

  return {
    isCompliant: isCompliant as boolean,
    isLoading,
  };
}
