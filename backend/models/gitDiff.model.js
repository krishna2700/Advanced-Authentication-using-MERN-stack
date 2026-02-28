import mongoose from "mongoose";

const fileDiffSchema = new mongoose.Schema({
  filePath: {
    type: String,
    required: true,
  },
  additions: {
    type: Number,
    default: 0,
  },
  deletions: {
    type: Number,
    default: 0,
  },
  patch: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["added", "modified", "deleted", "renamed"],
    default: "modified",
  },
});

const gitDiffSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      index: true,
    },
    parentTaskId: {
      type: String,
      default: null,
      index: true,
    },
    branchName: {
      type: String,
      default: "",
    },
    agentName: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "failed"],
      default: "pending",
    },
    files: [fileDiffSchema],
    summary: {
      totalAdditions: { type: Number, default: 0 },
      totalDeletions: { type: Number, default: 0 },
      totalFilesChanged: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Compound index for efficient querying of follow-up task diffs
gitDiffSchema.index({ parentTaskId: 1, createdAt: 1 });
gitDiffSchema.index({ taskId: 1, status: 1 });

export const GitDiff = mongoose.model("GitDiff", gitDiffSchema);
