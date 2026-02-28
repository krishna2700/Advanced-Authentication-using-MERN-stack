import React, { createContext, useContext, useState, useCallback } from "react";
import { useGitDiffStore } from "../hooks/useGitDiffStore";

const TaskStatusContext = createContext(null);

/**
 * TaskStatusProvider — Context provider that wraps the useGitDiffStore hook
 * and provides task/diff state to the entire component tree.
 *
 * This ensures:
 * - A single SSE connection is shared across all components
 * - The diff accumulator Map is centralized (no duplicate state)
 * - Any component can access diffs without prop drilling
 */
export const TaskStatusProvider = ({ parentTaskId, children }) => {
  const {
    diffs,
    diffsArray,
    isConnected,
    isLoading,
    error,
    refreshDiffs,
  } = useGitDiffStore(parentTaskId);

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  /**
   * Get the diff for a specific task from the accumulator.
   * Returns null if not found (task hasn't completed yet).
   */
  const getDiffForTask = useCallback(
    (taskId) => {
      return diffs.get(taskId) || null;
    },
    [diffs]
  );

  /**
   * Get the latest diff (most recently updated).
   */
  const getLatestDiff = useCallback(() => {
    if (diffsArray.length === 0) return null;
    return diffsArray[diffsArray.length - 1];
  }, [diffsArray]);

  const value = {
    // Diff data
    diffs,
    diffsArray,
    getDiffForTask,
    getLatestDiff,

    // Connection state
    isConnected,
    isLoading,
    error,

    // Actions
    refreshDiffs,

    // UI state
    selectedTaskId,
    setSelectedTaskId,
  };

  return (
    <TaskStatusContext.Provider value={value}>
      {children}
    </TaskStatusContext.Provider>
  );
};

/**
 * Hook to consume the TaskStatusContext.
 */
export const useTaskStatus = () => {
  const context = useContext(TaskStatusContext);
  if (!context) {
    throw new Error("useTaskStatus must be used within a TaskStatusProvider");
  }
  return context;
};
