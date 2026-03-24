import React, { useState } from 'react';
import MultiAgentButton from './components/MultiAgentButton';
import './App.css';

function App() {
  const [selectedAgent, setSelectedAgent] = useState('claude');
  const [responseMessage, setResponseMessage] = useState('');

  const handleAgentSelect = (agentId) => {
    setSelectedAgent(agentId);
    setResponseMessage(`Switched to ${agentId === 'claude' ? 'Claude' : 'Codex'} agent`);

    // Here you can add logic to switch the backend API endpoint or configuration
    console.log(`Agent selected: ${agentId}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Multi-Agent Selection Demo</h1>
        <p>Select your preferred AI agent</p>
      </header>

      <main className="App-main">
        <div className="agent-selector-container">
          <MultiAgentButton
            onAgentSelect={handleAgentSelect}
            defaultAgent="claude"
          />
        </div>

        {responseMessage && (
          <div className="response-message">
            {responseMessage}
          </div>
        )}

        <div className="info-section">
          <h2>Currently Selected: {selectedAgent === 'claude' ? 'Claude' : 'Codex'}</h2>
          <p>
            {selectedAgent === 'claude'
              ? 'Claude is Anthropic\'s AI assistant, known for being helpful, harmless, and honest.'
              : 'Codex is OpenAI\'s AI system that translates natural language to code.'}
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
