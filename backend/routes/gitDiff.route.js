import express from "express";
import {
  saveDiff,
  getDiffByTaskId,
  getAllDiffs,
  updateDiffStatus,
  deleteDiff,
  sseEvents,
} from "../controllers/gitDiff.controller.js";

const router = express.Router();

// SSE endpoint — must be before parameterized routes to avoid conflicts
router.get("/events", sseEvents);

// Get all diffs (with optional parentTaskId filter)
router.get("/diffs", getAllDiffs);

// Get diff for a specific task
router.get("/diff/:taskId", getDiffByTaskId);

// Save or update a diff
router.post("/diff", saveDiff);

// Update diff status
router.patch("/diff/:taskId/status", updateDiffStatus);

// Delete a diff
router.delete("/diff/:taskId", deleteDiff);

export default router;
