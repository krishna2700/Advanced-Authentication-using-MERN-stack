import React from "react";
import { TaskStatusProvider } from "./context/TaskStatusContext";
import GitDiffViewer from "./components/GitDiffViewer";

/**
 * App — Root component that wraps GitDiffViewer in the TaskStatusProvider.
 *
 * The parentTaskId prop can be passed to filter diffs to a specific
 * parent task. When null, all diffs are shown.
 *
 * In a real integration, parentTaskId would come from the URL or
 * the parent task execution context.
 */
const App = () => {
  // In production, this would come from URL params or parent context
  const parentTaskId = new URLSearchParams(window.location.search).get("parentTaskId");

  return (
    <div style={styles.appContainer}>
      <TaskStatusProvider parentTaskId={parentTaskId}>
        <div style={styles.sidePanel}>
          <GitDiffViewer />
        </div>
      </TaskStatusProvider>
    </div>
  );
};

const styles = {
  appContainer: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "16px",
    minHeight: "100vh",
  },
  sidePanel: {
    position: "sticky",
    top: "16px",
    alignSelf: "flex-start",
  },
};

export default App;
