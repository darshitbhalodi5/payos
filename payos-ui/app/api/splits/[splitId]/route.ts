import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/database/mongodb';
import Split from '@/database/models/Split';

// GET /api/splits/[splitId] - Get specific split
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ splitId: string }> }
) {
  try {
    await connectDB();
    
    const { splitId } = await params;
    const split = await Split.findOne({ splitId });
    
    if (!split) {
      return NextResponse.json(
        { success: false, error: 'Split not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: split });
  } catch (error) {
    console.error('Error fetching split:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch split' },
      { status: 500 }
    );
  }
}

// PUT /api/splits/[splitId] - Update split
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ splitId: string }> }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { status, transactionHash, blockNumber, gasUsed, gasPrice, currentAmount } = body;
    
    const updateData: { updatedAt: Date; status?: string; transactionHash?: string; blockNumber?: number; gasUsed?: string; gasPrice?: string; currentAmount?: string; completedAt?: Date; cancelledAt?: Date } = { updatedAt: new Date() };
    
    if (status) updateData.status = status;
    if (transactionHash) updateData.transactionHash = transactionHash;
    if (blockNumber) updateData.blockNumber = blockNumber;
    if (gasUsed) updateData.gasUsed = gasUsed;
    if (gasPrice) updateData.gasPrice = gasPrice;
    if (currentAmount !== undefined) updateData.currentAmount = currentAmount;
    
    // Set completion/cancellation timestamps
    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
    }
    
    const { splitId } = await params;
    const updatedSplit = await Split.findOneAndUpdate(
      { splitId },
      updateData,
      { new: true }
    );
    
    if (!updatedSplit) {
      return NextResponse.json(
        { success: false, error: 'Split not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: updatedSplit,
      message: 'Split updated successfully' 
    });
  } catch (error) {
    console.error('Error updating split:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update split' },
      { status: 500 }
    );
  }
}

// DELETE /api/splits/[splitId] - Delete split
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ splitId: string }> }
) {
  try {
    await connectDB();
    
    const { splitId } = await params;
    const deletedSplit = await Split.findOneAndDelete({ splitId });
    
    if (!deletedSplit) {
      return NextResponse.json(
        { success: false, error: 'Split not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Split deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting split:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete split' },
      { status: 500 }
    );
  }
}
