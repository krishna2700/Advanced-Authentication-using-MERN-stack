/**
 * Agent Behavior Configuration
 *
 * This configuration ensures AI agents (Blackbox, Claude, etc.)
 * don't get stuck in plan mode and provide proper responses with git diffs
 */

const AGENT_CONFIG = {
  // Prevent agents from getting stuck in plan mode
  behavior: {
    // Force execution mode (no endless planning)
    mode: 'execute',

    // Maximum plan iterations before forcing execution
    maxPlanIterations: 1,

    // Require immediate response
    requireResponse: true,

    // Always include git diff in response
    includeGitDiff: true,

    // Auto-execute after planning
    autoExecute: true
  },

  // Response requirements
  response: {
    // Minimum response structure
    required: ['message', 'gitDiff', 'status'],

    // Response format
    format: 'json',

    // Include execution summary
    includeSummary: true,

    // Include file changes
    includeChanges: true
  },

  // Git diff settings
  gitDiff: {
    // Always fetch current diff
    autoFetch: true,

    // Include both staged and unstaged
    includeBoth: true,

    // Save diff after operations
    autoSave: true,

    // Include in response
    includeInResponse: true
  },

  // Execution settings
  execution: {
    // Skip plan mode entirely
    skipPlanMode: true,

    // Execute immediately
    immediate: true,

    // Show progress
    showProgress: true,

    // Return results
    returnResults: true
  },

  // Timeout settings
  timeout: {
    // Max time in plan mode (ms)
    planMode: 30000, // 30 seconds

    // Max time for execution (ms)
    execution: 300000, // 5 minutes

    // Response timeout (ms)
    response: 5000 // 5 seconds
  },

  // Agent-specific overrides
  agents: {
    blackbox: {
      mode: 'execute',
      skipPlanMode: true,
      requireResponse: true,
      includeGitDiff: true,
      autoExecute: true
    },
    claude: {
      mode: 'execute',
      skipPlanMode: false, // Claude can plan briefly
      maxPlanIterations: 2,
      requireResponse: true,
      includeGitDiff: true
    },
    cursor: {
      mode: 'execute',
      skipPlanMode: true,
      requireResponse: true,
      includeGitDiff: true
    },
    copilot: {
      mode: 'execute',
      skipPlanMode: true,
      requireResponse: true,
      includeGitDiff: true
    }
  }
};

// Get configuration for specific agent
export const getAgentConfig = (agentName = 'default') => {
  const baseConfig = { ...AGENT_CONFIG };
  const agentSpecific = AGENT_CONFIG.agents[agentName.toLowerCase()];

  if (agentSpecific) {
    return {
      ...baseConfig,
      behavior: { ...baseConfig.behavior, ...agentSpecific }
    };
  }

  return baseConfig;
};

// Validate agent is not stuck in plan mode
export const validateAgentState = (state) => {
  const warnings = [];

  if (state.mode === 'plan' && state.iterations > AGENT_CONFIG.behavior.maxPlanIterations) {
    warnings.push('Agent stuck in plan mode - forcing execution');
  }

  if (!state.hasResponse && state.elapsed > AGENT_CONFIG.timeout.response) {
    warnings.push('Agent response timeout - requiring immediate response');
  }

  if (state.inPlanMode && state.elapsed > AGENT_CONFIG.timeout.planMode) {
    warnings.push('Plan mode timeout - switching to execution');
  }

  return {
    valid: warnings.length === 0,
    warnings,
    shouldForceExecution: warnings.length > 0
  };
};

// Create agent response with git diff
export const createAgentResponse = async (message, gitDiffData, status = 'success') => {
  return {
    success: status === 'success',
    timestamp: new Date().toISOString(),
    mode: 'execute',
    message,
    gitDiff: gitDiffData || null,
    status,
    metadata: {
      responseGenerated: true,
      includedGitDiff: !!gitDiffData,
      executionMode: 'immediate'
    }
  };
};

export default AGENT_CONFIG;
