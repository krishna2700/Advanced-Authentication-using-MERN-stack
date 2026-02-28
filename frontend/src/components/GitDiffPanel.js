import React, { useState } from "react";

/**
 * GitDiffPanel — Renders the diff for a single file.
 * Shows file path, additions/deletions count, and expandable patch content.
 */
const GitDiffPanel = ({ file }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    added: "#2ea043",
    modified: "#d29922",
    deleted: "#f85149",
    renamed: "#8b949e",
  };

  const statusLabels = {
    added: "A",
    modified: "M",
    deleted: "D",
    renamed: "R",
  };

  return (
    <div style={styles.fileContainer}>
      <div
        style={styles.fileHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsExpanded(!isExpanded)}
      >
        <div style={styles.fileInfo}>
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: statusColors[file.status] || "#8b949e",
            }}
          >
            {statusLabels[file.status] || "M"}
          </span>
          <span style={styles.filePath}>{file.filePath}</span>
        </div>
        <div style={styles.fileStats}>
          {file.additions > 0 && (
            <span style={styles.additions}>+{file.additions}</span>
          )}
          {file.deletions > 0 && (
            <span style={styles.deletions}>-{file.deletions}</span>
          )}
          <span style={styles.expandIcon}>{isExpanded ? "▼" : "▶"}</span>
        </div>
      </div>

      {isExpanded && file.patch && (
        <div style={styles.patchContainer}>
          <pre style={styles.patchContent}>
            {file.patch.split("\n").map((line, i) => {
              let lineStyle = styles.patchLine;
              if (line.startsWith("+") && !line.startsWith("+++")) {
                lineStyle = { ...lineStyle, ...styles.addedLine };
              } else if (line.startsWith("-") && !line.startsWith("---")) {
                lineStyle = { ...lineStyle, ...styles.deletedLine };
              } else if (line.startsWith("@@")) {
                lineStyle = { ...lineStyle, ...styles.hunkHeader };
              }
              return (
                <div key={i} style={lineStyle}>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
};

const styles = {
  fileContainer: {
    borderBottom: "1px solid #30363d",
    overflow: "hidden",
  },
  fileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    backgroundColor: "transparent",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: 0,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#ffffff",
    flexShrink: 0,
  },
  filePath: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    color: "#e6edf3",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileStats: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  additions: {
    color: "#3fb950",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    fontWeight: 600,
  },
  deletions: {
    color: "#f85149",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    fontWeight: 600,
  },
  expandIcon: {
    color: "#8b949e",
    fontSize: "10px",
    marginLeft: "4px",
  },
  patchContainer: {
    backgroundColor: "#0d1117",
    borderTop: "1px solid #30363d",
    maxHeight: "400px",
    overflow: "auto",
  },
  patchContent: {
    margin: 0,
    padding: "8px 0",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    lineHeight: "20px",
  },
  patchLine: {
    padding: "0 16px",
    whiteSpace: "pre",
  },
  addedLine: {
    backgroundColor: "rgba(46, 160, 67, 0.15)",
    color: "#3fb950",
  },
  deletedLine: {
    backgroundColor: "rgba(248, 81, 73, 0.15)",
    color: "#f85149",
  },
  hunkHeader: {
    backgroundColor: "rgba(56, 139, 253, 0.1)",
    color: "#8b949e",
  },
};

export default GitDiffPanel;
