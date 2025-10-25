import { NextResponse } from "next/server";
import connectDB from "@/database/mongodb";

export async function GET() {
  try {
    console.log("Testing MongoDB connection...");
    await connectDB();
    console.log("MongoDB connected successfully!");
    
    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "MongoDB connection failed",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
