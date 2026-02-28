import React, { useEffect } from "react";
import { useTaskStatus } from "../context/TaskStatusContext";
import GitDiffPanel from "./GitDiffPanel";

/**
 * GitDiffViewer — Main component that displays Git diffs for all tasks.
 *
 * KEY DESIGN DECISIONS that fix the reported issues:
 *
 * Issue 1 Fix: This component consumes diffsArray from the TaskStatusContext,
 * which is backed by the useGitDiffStore hook. The hook uses SSE (Server-Sent
 * Events) to receive real-time updates. When a follow-up task completes and
 * its diff is saved, the SSE event triggers mergeDiff(), which updates the
 * Map and produces a new diffsArray. React detects the state change and
 * re-renders this component immediately — no manual refresh needed.
 *
 * Issue 2 Fix: The diffsArray is derived from a persistent Map<taskId, diffData>.
 * When a new follow-up task completes, its diff is ADDED to the Map via
 * mergeDiff(). The Map never clears previous entries. So when task B completes
 * after task A, both A's and B's diffs remain in the Map and are rendered.
 * The Map uses taskId as the key, so each task's diff is uniquely stored.
 */
const GitDiffViewer = () => {
  const {
    diffsArray,
    isConnected,
    isLoading,
    error,
    selectedTaskId,
    setSelectedTaskId,
  } = useTaskStatus();

  // Auto-select the latest task when new diffs arrive
  useEffect(() => {
    if (diffsArray.length > 0 && !selectedTaskId) {
      setSelectedTaskId(diffsArray[diffsArray.length - 1].taskId);
    }
  }, [diffsArray, selectedTaskId, setSelectedTaskId]);

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Saving Git Changes</h3>
          <div style={styles.loadingDot} />
        </div>
        <div style={styles.loadingState}>Loading diffs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Saving Git Changes</h3>
        </div>
        <div style={styles.errorState}>
          Failed to load diffs: {error}
        </div>
      </div>
    );
  }

  // Get the currently selected diff, or show all
  const selectedDiff = selectedTaskId
    ? diffsArray.find((d) => d.taskId === selectedTaskId)
    : null;

  const displayDiff = selectedDiff || (diffsArray.length > 0 ? diffsArray[diffsArray.length - 1] : null);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>
          Saving Git Changes
          <span
            style={{
              ...styles.connectionDot,
              backgroundColor: isConnected ? "#3fb950" : "#f85149",
            }}
          />
        </h3>
      </div>

      {/* Agent tabs — one per task that has diffs */}
      {diffsArray.length > 1 && (
        <div style={styles.tabBar}>
          {diffsArray.map((diff) => (
            <button
              key={diff.taskId}
              style={{
                ...styles.tab,
                ...(selectedTaskId === diff.taskId || (!selectedTaskId && diff === diffsArray[diffsArray.length - 1])
                  ? styles.activeTab
                  : {}),
              }}
              onClick={() => setSelectedTaskId(diff.taskId)}
            >
              <span style={styles.tabLabel}>
                {diff.agentName || diff.taskId.substring(0, 8)}
              </span>
              {diff.status === "completed" && (
                <span style={styles.completedBadge}>Done</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* File list */}
      <div style={styles.fileList}>
        {displayDiff && displayDiff.files && displayDiff.files.length > 0 ? (
          <>
            {/* Summary bar */}
            <div style={styles.summaryBar}>
              <span style={styles.summaryText}>
                {displayDiff.summary?.totalFilesChanged || displayDiff.files.length} file
                {(displayDiff.summary?.totalFilesChanged || displayDiff.files.length) !== 1 ? "s" : ""} changed
              </span>
              {displayDiff.summary?.totalAdditions > 0 && (
                <span style={styles.summaryAdditions}>
                  +{displayDiff.summary.totalAdditions}
                </span>
              )}
              {displayDiff.summary?.totalDeletions > 0 && (
                <span style={styles.summaryDeletions}>
                  -{displayDiff.summary.totalDeletions}
                </span>
              )}
            </div>

            {/* Individual file diffs */}
            {displayDiff.files.map((file, index) => (
              <GitDiffPanel key={`${displayDiff.taskId}-${file.filePath}-${index}`} file={file} />
            ))}
          </>
        ) : (
          <div style={styles.emptyState}>
            {diffsArray.length === 0
              ? "No git changes yet. Changes will appear here as tasks complete."
              : "No file changes in this diff."}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "8px",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "400px",
    width: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #30363d",
    backgroundColor: "#0d1117",
  },
  title: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 600,
    color: "#e6edf3",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  connectionDot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  loadingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#d29922",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  tabBar: {
    display: "flex",
    borderBottom: "1px solid #30363d",
    backgroundColor: "#0d1117",
    overflowX: "auto",
    padding: "0 8px",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    border: "none",
    borderBottom: "2px solid transparent",
    backgroundColor: "transparent",
    color: "#8b949e",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  },
  activeTab: {
    color: "#e6edf3",
    borderBottomColor: "#58a6ff",
  },
  tabLabel: {
    fontSize: "13px",
  },
  completedBadge: {
    fontSize: "10px",
    padding: "1px 6px",
    borderRadius: "10px",
    backgroundColor: "rgba(46, 160, 67, 0.2)",
    color: "#3fb950",
    fontWeight: 600,
  },
  fileList: {
    maxHeight: "500px",
    overflowY: "auto",
  },
  summaryBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 16px",
    borderBottom: "1px solid #30363d",
    backgroundColor: "#0d1117",
  },
  summaryText: {
    fontSize: "12px",
    color: "#8b949e",
  },
  summaryAdditions: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#3fb950",
    fontFamily: "'JetBrains Mono', monospace",
  },
  summaryDeletions: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#f85149",
    fontFamily: "'JetBrains Mono', monospace",
  },
  emptyState: {
    padding: "32px 16px",
    textAlign: "center",
    color: "#8b949e",
    fontSize: "13px",
  },
  loadingState: {
    padding: "32px 16px",
    textAlign: "center",
    color: "#8b949e",
    fontSize: "13px",
  },
  errorState: {
    padding: "16px",
    color: "#f85149",
    fontSize: "13px",
    backgroundColor: "rgba(248, 81, 73, 0.1)",
    margin: "8px",
    borderRadius: "6px",
  },
};

export default GitDiffViewer;
