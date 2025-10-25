"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { type SplitData, type UseSplitsDataReturn } from "@/lib/types";
import { extractErrorMessage } from "@/lib/utils";
import { SplitService } from "@/database/services/splitService";

export function useSplitsData(): UseSplitsDataReturn {
  const { ready } = usePrivy();
  const { address } = useAccount();
  const [splits, setSplits] = useState<SplitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch splits from database
  const fetchSplits = useCallback(async () => {
    if (!ready || !address) {
      setSplits([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch splits where user is creator, recipient, or contributor
      const [createdSplits, receivedSplits, contributedSplits] = await Promise.all([
        SplitService.getSplitsByCreator(address),
        SplitService.getSplitsByRecipient(address),
        SplitService.getSplitsByContributor(address)
      ]);

      // Combine all splits and remove duplicates
      const allSplits = [...createdSplits, ...receivedSplits, ...contributedSplits];
      const uniqueSplits = allSplits.filter((split, index, self) => 
        index === self.findIndex(s => s.id === split.id)
      );

      // Sort by creation date (newest first)
      uniqueSplits.sort((a, b) => b.createdAt - a.createdAt);

      setSplits(uniqueSplits);
    } catch (err) {
      console.error("Failed to fetch splits:", err);
      setError(extractErrorMessage(err));
      // Set empty array on error instead of showing mock data
      setSplits([]);
    } finally {
      setIsLoading(false);
    }
  }, [ready, address]);

  // Fetch splits when address changes
  useEffect(() => {
    fetchSplits();
  }, [fetchSplits]);

  // Get splits by status
  const getSplitsByStatus = useCallback(
    (status: "active" | "completed") => {
      return splits.filter((split) => split.status === status);
    },
    [splits]
  );

  // Get splits where user is creator
  const getCreatedSplits = useCallback(() => {
    if (!address) return [];
    return splits.filter(
      (split) => split.creator.toLowerCase() === address.toLowerCase()
    );
  }, [splits, address]);

  // Get splits where user is recipient
  const getReceivedSplits = useCallback(() => {
    if (!address) return [];
    return splits.filter(
      (split) => split.recipient.toLowerCase() === address.toLowerCase()
    );
  }, [splits, address]);

  // Get splits where user is contributor
  const getContributedSplits = useCallback(() => {
    if (!address) return [];
    return splits.filter((split) =>
      split.contributors.some(
        (contributor) => contributor.toLowerCase() === address.toLowerCase()
      )
    );
  }, [splits, address]);

  // Refresh splits data
  const refreshSplits = useCallback(() => {
    fetchSplits();
  }, [fetchSplits]);

  return {
    splits,
    isLoading,
    error,
    getSplitsByStatus,
    getCreatedSplits,
    getReceivedSplits,
    getContributedSplits,
    refreshSplits,
  };
}
