import { GitDiff } from "../models/gitDiff.model.js";

// In-memory SSE client registry for real-time push
const sseClients = new Map();

/**
 * Broadcast a diff update event to all connected SSE clients.
 * Filters by parentTaskId so clients only get relevant updates.
 */
const broadcastDiffUpdate = (diffData) => {
  const payload = `data: ${JSON.stringify({
    type: "diff_update",
    taskId: diffData.taskId,
    parentTaskId: diffData.parentTaskId,
    status: diffData.status,
    diff: diffData,
    timestamp: new Date().toISOString(),
  })}\n\n`;

  for (const [clientId, client] of sseClients.entries()) {
    try {
      // Send to all clients, or filter by parentTaskId if client subscribed to one
      if (
        !client.parentTaskId ||
        client.parentTaskId === diffData.parentTaskId
      ) {
        client.res.write(payload);
      }
    } catch (err) {
      // Client disconnected, clean up
      sseClients.delete(clientId);
    }
  }
};

/**
 * POST /api/git/diff
 * Save or update a git diff for a task. Broadcasts SSE event on completion.
 *
 * This is the key endpoint that fixes Issue 1:
 * When a follow-up task completes, saving the diff triggers an SSE broadcast,
 * so the frontend receives the update immediately without manual refresh.
 */
export const saveDiff = async (req, res) => {
  try {
    const { taskId, parentTaskId, branchName, agentName, files, status } =
      req.body;

    if (!taskId) {
      return res.status(400).json({ error: "taskId is required" });
    }

    // Calculate summary from files
    const summary = {
      totalAdditions: (files || []).reduce((sum, f) => sum + (f.additions || 0), 0),
      totalDeletions: (files || []).reduce((sum, f) => sum + (f.deletions || 0), 0),
      totalFilesChanged: (files || []).length,
    };

    // Upsert: update if exists, create if not.
    // This ensures we don't create duplicate entries for the same taskId,
    // which is critical for Issue 2 (diffs not disappearing).
    const diff = await GitDiff.findOneAndUpdate(
      { taskId },
      {
        taskId,
        parentTaskId: parentTaskId || null,
        branchName: branchName || "",
        agentName: agentName || "",
        status: status || "completed",
        files: files || [],
        summary,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Broadcast to SSE clients immediately — this is the reactive update
    broadcastDiffUpdate(diff.toObject());

    return res.status(200).json({
      success: true,
      diff,
    });
  } catch (error) {
    console.error("Error saving diff:", error);
    return res.status(500).json({ error: "Failed to save diff" });
  }
};

/**
 * GET /api/git/diff/:taskId
 * Fetch the diff for a specific task.
 */
export const getDiffByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;
    const diff = await GitDiff.findOne({ taskId });

    if (!diff) {
      return res.status(404).json({ error: "Diff not found for this task" });
    }

    return res.status(200).json({ success: true, diff });
  } catch (error) {
    console.error("Error fetching diff:", error);
    return res.status(500).json({ error: "Failed to fetch diff" });
  }
};

/**
 * GET /api/git/diffs?parentTaskId=xxx
 * Fetch ALL diffs for a parent task (including all follow-up tasks).
 *
 * This is the key endpoint that fixes Issue 2:
 * Instead of fetching only the latest diff, we fetch ALL diffs for the parent task.
 * The frontend accumulates these in a Map, so previous diffs never disappear.
 */
export const getAllDiffs = async (req, res) => {
  try {
    const { parentTaskId, status } = req.query;
    const filter = {};

    if (parentTaskId) {
      filter.parentTaskId = parentTaskId;
    }
    if (status) {
      filter.status = status;
    }

    // Sort by createdAt ascending so diffs appear in execution order
    const diffs = await GitDiff.find(filter).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: diffs.length,
      diffs,
    });
  } catch (error) {
    console.error("Error fetching diffs:", error);
    return res.status(500).json({ error: "Failed to fetch diffs" });
  }
};

/**
 * PATCH /api/git/diff/:taskId/status
 * Update the status of a task's diff entry.
 * Broadcasts SSE event so the UI updates reactively.
 */
export const updateDiffStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const diff = await GitDiff.findOneAndUpdate(
      { taskId },
      { status },
      { new: true }
    );

    if (!diff) {
      return res.status(404).json({ error: "Diff not found for this task" });
    }

    // Broadcast status change
    broadcastDiffUpdate(diff.toObject());

    return res.status(200).json({ success: true, diff });
  } catch (error) {
    console.error("Error updating diff status:", error);
    return res.status(500).json({ error: "Failed to update diff status" });
  }
};

/**
 * DELETE /api/git/diff/:taskId
 * Delete a specific task's diff.
 */
export const deleteDiff = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await GitDiff.findOneAndDelete({ taskId });

    if (!result) {
      return res.status(404).json({ error: "Diff not found for this task" });
    }

    return res.status(200).json({ success: true, message: "Diff deleted" });
  } catch (error) {
    console.error("Error deleting diff:", error);
    return res.status(500).json({ error: "Failed to delete diff" });
  }
};

/**
 * GET /api/git/events
 * Server-Sent Events (SSE) endpoint for real-time diff updates.
 *
 * This is the core mechanism that fixes Issue 1:
 * The frontend opens a persistent SSE connection. When any diff is saved
 * or updated, the server pushes the event immediately to all connected clients.
 * No polling or manual refresh needed.
 *
 * Query params:
 *   - parentTaskId: optional, filter events to a specific parent task
 */
export const sseEvents = (req, res) => {
  const { parentTaskId } = req.query;

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "X-Accel-Buffering": "no", // Disable nginx buffering
  });

  // Send initial connection event
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  // Register this client
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sseClients.set(clientId, {
    res,
    parentTaskId: parentTaskId || null,
    connectedAt: new Date(),
  });

  // Send heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(
        `data: ${JSON.stringify({
          type: "heartbeat",
          timestamp: new Date().toISOString(),
        })}\n\n`
      );
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(clientId);
    }
  }, 30000);

  // Clean up on disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(clientId);
  });
};
