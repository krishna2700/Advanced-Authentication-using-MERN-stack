import { useState, useEffect, useRef, useCallback } from "react";
import { fetchAllDiffs, createDiffEventSource } from "../utils/api";

/**
 * useGitDiffStore — Custom hook that manages Git diff state with:
 *
 * 1. PERSISTENT ACCUMULATOR PATTERN (fixes Issue 2):
 *    Uses a Map<taskId, diffData> that only ADDS entries, never replaces
 *    the entire collection. When a new follow-up task completes, its diff
 *    is appended to the Map. Previous task diffs remain intact.
 *
 * 2. SSE-BASED REACTIVE UPDATES (fixes Issue 1):
 *    Opens a Server-Sent Events connection to receive real-time diff
 *    updates. When the server broadcasts a diff_update event, the hook
 *    immediately merges it into the Map and triggers a re-render.
 *    No polling or manual refresh needed.
 *
 * 3. useRef TO AVOID STALE CLOSURES:
 *    The diff Map is stored in a ref so SSE event handlers always have
 *    access to the latest state, preventing race conditions when
 *    back-to-back tasks complete rapidly.
 *
 * @param {string|null} parentTaskId - Filter diffs to a specific parent task
 * @returns {{ diffs: Map, diffsArray: Array, isConnected: boolean, isLoading: boolean, error: string|null, refreshDiffs: Function }}
 */
export const useGitDiffStore = (parentTaskId = null) => {
  // The persistent accumulator: Map<taskId, diffData>
  // Using useRef so SSE callbacks always see the latest state
  const diffMapRef = useRef(new Map());

  // State for triggering re-renders when the map changes
  const [diffsArray, setDiffsArray] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref for the EventSource to manage cleanup
  const eventSourceRef = useRef(null);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Merge a single diff into the accumulator Map.
   * This is the key function that prevents diffs from disappearing:
   * it only ADDS or UPDATES entries, never clears the map.
   */
  const mergeDiff = useCallback((diff) => {
    if (!diff || !diff.taskId) return;

    const map = diffMapRef.current;
    map.set(diff.taskId, {
      ...diff,
      _lastUpdated: Date.now(),
    });

    // Trigger re-render with a new array derived from the map
    // Sort by createdAt to maintain execution order
    if (isMountedRef.current) {
      const sorted = Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setDiffsArray(sorted);
    }
  }, []);

  /**
   * Merge multiple diffs into the accumulator (used for initial load).
   * Does NOT clear existing entries — only adds/updates.
   */
  const mergeDiffs = useCallback(
    (diffs) => {
      if (!Array.isArray(diffs)) return;
      diffs.forEach((diff) => {
        if (diff && diff.taskId) {
          diffMapRef.current.set(diff.taskId, {
            ...diff,
            _lastUpdated: Date.now(),
          });
        }
      });

      if (isMountedRef.current) {
        const sorted = Array.from(diffMapRef.current.values()).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setDiffsArray(sorted);
      }
    },
    []
  );

  /**
   * Fetch all existing diffs from the server and merge into the map.
   * Called on mount and can be called manually to refresh.
   */
  const refreshDiffs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAllDiffs(parentTaskId);
      if (data.success && data.diffs) {
        mergeDiffs(data.diffs);
      }
    } catch (err) {
      console.error("Failed to fetch diffs:", err);
      if (isMountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [parentTaskId, mergeDiffs]);

  /**
   * Set up SSE connection for real-time updates.
   * Handles reconnection with exponential backoff.
   */
  useEffect(() => {
    isMountedRef.current = true;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_DELAY = 30000;

    const connect = () => {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = createDiffEventSource(parentTaskId);
      eventSourceRef.current = es;

      es.onopen = () => {
        if (isMountedRef.current) {
          setIsConnected(true);
          setError(null);
          reconnectAttempts = 0;
        }
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "connected":
              // Initial connection confirmed
              break;

            case "diff_update":
              // A diff was saved or updated — merge it into our accumulator
              // This is the reactive update that fixes Issue 1
              if (data.diff) {
                mergeDiff(data.diff);
              }
              break;

            case "heartbeat":
              // Keep-alive, no action needed
              break;

            default:
              break;
          }
        } catch (err) {
          console.error("Failed to parse SSE event:", err);
        }
      };

      es.onerror = () => {
        if (isMountedRef.current) {
          setIsConnected(false);
        }

        // Close the errored connection
        es.close();
        eventSourceRef.current = null;

        // Reconnect with exponential backoff
        if (isMountedRef.current) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts),
            MAX_RECONNECT_DELAY
          );
          reconnectAttempts++;
          reconnectTimeout = setTimeout(connect, delay);
        }
      };
    };

    // Initial data fetch, then connect SSE
    refreshDiffs().then(() => {
      if (isMountedRef.current) {
        connect();
      }
    });

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [parentTaskId, refreshDiffs, mergeDiff]);

  return {
    diffs: diffMapRef.current,
    diffsArray,
    isConnected,
    isLoading,
    error,
    refreshDiffs,
  };
};
