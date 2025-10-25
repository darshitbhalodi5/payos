import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/mongodb";
import Split from "@/database/models/Split";

// GET /api/splits - Get all splits
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const creator = searchParams.get("creator");
    const recipient = searchParams.get("recipient");
    const contributor = searchParams.get("contributor");
    const status = searchParams.get("status");
    const chainId = searchParams.get("chainId");

    const query: {
      creator?: string;
      recipient?: string;
      contributors?: string;
      status?: string;
      targetChainId?: number;
    } = {};

    if (creator) query.creator = creator;
    if (recipient) query.recipient = recipient;
    if (contributor) query.contributors = contributor;
    if (status) query.status = status;
    if (chainId) query.targetChainId = parseInt(chainId);

    const splits = await Split.find(query).sort({ createdAt: -1 }).limit(100);

    return NextResponse.json({ success: true, data: splits });
  } catch (error) {
    console.error("Error fetching splits:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch splits" },
      { status: 500 }
    );
  }
}

// POST /api/splits - Create new split
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      splitId,
      creator,
      recipient,
      targetChainId,
      targetToken,
      targetAmount,
      description,
      contributors,
      contributorAmounts,
    } = body;

    // Validate required fields
    if (
      !splitId ||
      !creator ||
      !recipient ||
      !targetChainId ||
      !targetToken ||
      !targetAmount ||
      !description ||
      !contributors ||
      !contributorAmounts
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new split document
    const newSplit = new Split({
      splitId,
      creator,
      recipient,
      targetChainId,
      targetToken,
      targetAmount,
      description,
      contributors,
      contributorAmounts,
      status: "pending",
    });

    const savedSplit = await newSplit.save();

    return NextResponse.json({
      success: true,
      data: savedSplit,
      message: "Split created successfully",
    });
  } catch (error) {
    console.error("Error creating split:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create split",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
