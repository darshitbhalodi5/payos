import { SplitCreationParams, SplitData, SplitFilters, PaginatedSplitsResponse } from "@/lib/types";

export class SplitService {
  // Create a new split in database
  static async createSplit(
    splitData: SplitCreationParams & { splitId: string }
  ): Promise<SplitData> {
    try {
      const response = await fetch('/api/splits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...splitData,
          creator: splitData.creator || splitData.creator,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        throw new Error(error.details || error.error || 'Failed to create split');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('SplitService.createSplit error:', error);
      
      // If MongoDB is not available, return a mock split for development
      if (error instanceof Error && (error.message.includes('MongoDB') || error.message.includes('bad auth') || error.message.includes('authentication failed'))) {
        console.warn('MongoDB not available, returning mock split for development');
        return {
          splitId: splitData.splitId,
          creator: splitData.creator || '',
          recipient: splitData.recipient,
          targetChainId: splitData.targetChainId,
          targetToken: splitData.targetToken,
          targetAmount: splitData.targetAmount,
          currentAmount: '0',
          description: splitData.description,
          status: 'pending',
          contributors: splitData.contributors,
          contributorAmounts: splitData.contributorAmounts,
          createdAt: Date.now(),
        };
      }
      
      throw error;
    }
  }

  // Update split status after contract interaction
  static async updateSplitStatus(
    splitId: string,
    status: "active" | "completed" | "cancelled" | "expired",
    transactionData?: {
      transactionHash?: string;
      blockNumber?: number;
      gasUsed?: string;
      gasPrice?: string;
    }
  ): Promise<SplitData | null> {
    try {
      const updateData: {
        status: string;
        transactionHash?: string;
        blockNumber?: number;
        gasUsed?: string;
        gasPrice?: string;
      } = {
        status,
      };

      if (transactionData) {
        if (transactionData.transactionHash)
          updateData.transactionHash = transactionData.transactionHash;
        if (transactionData.blockNumber)
          updateData.blockNumber = transactionData.blockNumber;
        if (transactionData.gasUsed) updateData.gasUsed = transactionData.gasUsed;
        if (transactionData.gasPrice)
          updateData.gasPrice = transactionData.gasPrice;
      }

      const response = await fetch(`/api/splits/${splitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update split');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('SplitService.updateSplitStatus error:', error);
      
      // If MongoDB is not available, return null (split won't be updated in DB)
      if (error instanceof Error && error.message.includes('MongoDB')) {
        console.warn('MongoDB not available, skipping split status update');
        return null;
      }
      
      throw error;
    }
  }

  // Update current amount (when contributions are made)
  static async updateCurrentAmount(
    splitId: string,
    currentAmount: string
  ): Promise<SplitData | null> {
    const response = await fetch(`/api/splits/${splitId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentAmount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update split');
    }

    const result = await response.json();
    return result.data;
  }

  // Get split by ID
  static async getSplitById(splitId: string): Promise<SplitData | null> {
    const response = await fetch(`/api/splits/${splitId}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch split');
    }

    const result = await response.json();
    return result.data;
  }

  // Get splits by creator
  static async getSplitsByCreator(creator: string): Promise<SplitData[]> {
    const response = await fetch(`/api/splits?creator=${creator}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch splits');
    }

    const result = await response.json();
    return result.data;
  }

  // Get splits by recipient
  static async getSplitsByRecipient(recipient: string): Promise<SplitData[]> {
    const response = await fetch(`/api/splits?recipient=${recipient}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch splits');
    }

    const result = await response.json();
    return result.data;
  }

  // Get splits by contributor
  static async getSplitsByContributor(
    contributor: string
  ): Promise<SplitData[]> {
    const response = await fetch(`/api/splits?contributor=${contributor}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch splits');
    }

    const result = await response.json();
    return result.data;
  }

  // Get all splits with optional filters
  static async getAllSplits(filters?: {
    status?: string;
    chainId?: number;
    limit?: number;
  }): Promise<SplitData[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.chainId) params.append('chainId', filters.chainId.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`/api/splits?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch splits');
    }

    const result = await response.json();
    return result.data;
  }

  // Delete split (if contract call fails)
  static async deleteSplit(splitId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/splits/${splitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete split');
      }

      return true;
    } catch (error) {
      console.error('SplitService.deleteSplit error:', error);
      
      // If MongoDB is not available, just return true (split doesn't exist in DB anyway)
      if (error instanceof Error && (error.message.includes('MongoDB') || error.message.includes('bad auth') || error.message.includes('authentication failed'))) {
        console.warn('MongoDB not available, skipping split deletion');
        return true;
      }
      
      throw error;
    }
  }

  // Get splits with pagination and filters
  static async getSplitsWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: SplitFilters = {}
  ): Promise<PaginatedSplitsResponse> {
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filters to search params
      if (filters.status) searchParams.set('status', filters.status);
      if (filters.creator) searchParams.set('creator', filters.creator);
      if (filters.recipient) searchParams.set('recipient', filters.recipient);
      if (filters.contributor) searchParams.set('contributor', filters.contributor);
      if (filters.chainId) searchParams.set('chainId', filters.chainId.toString());

      const response = await fetch(`/api/splits?${searchParams.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        throw new Error(error.details || error.error || 'Failed to get splits');
      }

      const result = await response.json();
      return {
        splits: result.data,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('SplitService.getSplitsWithPagination error:', error);
      throw error;
    }
  }
}
