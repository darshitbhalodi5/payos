import { NextRequest, NextResponse } from 'next/server';
import { recordOwnerContribution } from '@/lib/services/ownerContribution';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      splitId, 
      contributor, 
      sourceChainId, 
      sourceAmount, 
      targetAmount, 
      txHash,
      chainId 
    } = body;

    // Validate required parameters
    if (!splitId || !contributor || !sourceChainId || !sourceAmount || !targetAmount || !txHash || !chainId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Record the contribution as the owner
    const txHashResult = await recordOwnerContribution(
      {
        splitId,
        contributor,
        sourceChainId,
        sourceAmount,
        targetAmount,
        txHash,
      },
      chainId
    );

    return NextResponse.json({ 
      success: true,
      txHash: txHashResult 
    });
  } catch (error) {
    console.error('Error recording contribution:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to record contribution',
      },
      { status: 500 }
    );
  }
}

