import mongoose, { Document, Schema } from "mongoose";

export interface ISplit extends Document {
  splitId: string;
  creator: string;
  recipient: string;
  targetChainId: number;
  targetToken: string;
  targetAmount: string;
  description: string;
  contributors: string[];
  contributorAmounts: string[];
  status: "pending" | "active" | "completed" | "cancelled" | "expired";
  currentAmount: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
}

const SplitSchema = new Schema<ISplit>(
  {
    splitId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    creator: {
      type: String,
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      index: true,
    },
    targetChainId: {
      type: Number,
      required: true,
      index: true,
    },
    targetToken: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    contributors: [
      {
        type: String,
        required: true,
      },
    ],
    contributorAmounts: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled", "expired"],
      default: "pending",
      index: true,
    },
    currentAmount: {
      type: String,
      default: "0",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    transactionHash: {
      type: String,
      index: true,
    },
    blockNumber: {
      type: Number,
    },
    gasUsed: {
      type: String,
    },
    gasPrice: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
SplitSchema.index({ creator: 1, status: 1 });
SplitSchema.index({ recipient: 1, status: 1 });
SplitSchema.index({ contributors: 1, status: 1 });
SplitSchema.index({ targetChainId: 1, status: 1 });
SplitSchema.index({ createdAt: -1 });

export default mongoose.models.Split ||
  mongoose.model<ISplit>("Split", SplitSchema);
