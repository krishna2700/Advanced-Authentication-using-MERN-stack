const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api/git";

/**
 * Fetch all diffs, optionally filtered by parentTaskId.
 * Returns the complete list so the frontend can build its persistent Map.
 */
export const fetchAllDiffs = async (parentTaskId = null) => {
  const params = new URLSearchParams();
  if (parentTaskId) params.set("parentTaskId", parentTaskId);

  const res = await fetch(`${API_BASE}/diffs?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch diffs: ${res.status}`);
  return res.json();
};

/**
 * Fetch a single diff by taskId.
 */
export const fetchDiffByTaskId = async (taskId) => {
  const res = await fetch(`${API_BASE}/diff/${taskId}`);
  if (!res.ok) throw new Error(`Failed to fetch diff: ${res.status}`);
  return res.json();
};

/**
 * Save or update a diff for a task.
 */
export const saveDiff = async (diffData) => {
  const res = await fetch(`${API_BASE}/diff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(diffData),
  });
  if (!res.ok) throw new Error(`Failed to save diff: ${res.status}`);
  return res.json();
};

/**
 * Update the status of a task's diff.
 */
export const updateDiffStatus = async (taskId, status) => {
  const res = await fetch(`${API_BASE}/diff/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update status: ${res.status}`);
  return res.json();
};

/**
 * Create an SSE connection for real-time diff updates.
 * Returns the EventSource instance for cleanup.
 */
export const createDiffEventSource = (parentTaskId = null) => {
  const params = new URLSearchParams();
  if (parentTaskId) params.set("parentTaskId", parentTaskId);

  return new EventSource(`${API_BASE}/events?${params.toString()}`);
};
