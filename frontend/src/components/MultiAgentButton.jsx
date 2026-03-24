import React, { useState } from 'react';
import './MultiAgentButton.css';

const MultiAgentButton = ({ onAgentSelect, defaultAgent = 'claude' }) => {
  const [selectedAgent, setSelectedAgent] = useState(defaultAgent);
  const [isOpen, setIsOpen] = useState(false);

  const agents = [
    {
      id: 'claude',
      name: 'Claude',
      description: 'Anthropic Claude AI',
      icon: '🤖',
      color: '#D97757'
    },
    {
      id: 'codex',
      name: 'Codex',
      description: 'OpenAI Codex',
      icon: '💻',
      color: '#10A37F'
    }
  ];

  const handleAgentSelect = (agentId) => {
    setSelectedAgent(agentId);
    setIsOpen(false);
    if (onAgentSelect) {
      onAgentSelect(agentId);
    }
  };

  const currentAgent = agents.find(agent => agent.id === selectedAgent);

  return (
    <div className="multi-agent-button-container">
      <button
        className="multi-agent-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: currentAgent?.color }}
      >
        <span className="agent-icon">{currentAgent?.icon}</span>
        <span className="agent-name">{currentAgent?.name}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="agent-dropdown">
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`agent-option ${selectedAgent === agent.id ? 'selected' : ''}`}
              onClick={() => handleAgentSelect(agent.id)}
              style={{
                borderLeft: selectedAgent === agent.id ? `4px solid ${agent.color}` : 'none'
              }}
            >
              <span className="agent-icon">{agent.icon}</span>
              <div className="agent-info">
                <div className="agent-name">{agent.name}</div>
                <div className="agent-description">{agent.description}</div>
              </div>
              {selectedAgent === agent.id && (
                <span className="selected-check">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiAgentButton;
