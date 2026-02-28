import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
      maxlength: 200,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Compound index for fast cursor-based pagination: user's chats sorted by most recent
chatHistorySchema.index({ userId: 1, updatedAt: -1, _id: -1 });

export const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
