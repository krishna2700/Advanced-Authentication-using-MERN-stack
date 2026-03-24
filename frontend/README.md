# Multi-Agent Selection Button

A React component that provides a user-friendly interface for selecting between different AI agents (Claude and Codex).

## Features

- **Dropdown Selection**: Clean dropdown interface to switch between agents
- **Visual Feedback**: Icons, colors, and checkmarks for selected agent
- **Smooth Animations**: Slide-down animations and hover effects
- **Dark Mode Support**: Automatic dark mode styling
- **Responsive Design**: Works on mobile and desktop
- **Customizable**: Easy to extend with additional agents

## Component Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── MultiAgentButton.jsx    # Main component
│   │   └── MultiAgentButton.css    # Component styles
│   ├── App.jsx                      # Example usage
│   └── App.css                      # App styles
└── README.md                        # This file
```

## Installation

1. Ensure you have React installed in your project:
```bash
npm install react react-dom
```

2. Copy the component files to your project:
   - `MultiAgentButton.jsx`
   - `MultiAgentButton.css`

## Usage

### Basic Usage

```jsx
import React, { useState } from 'react';
import MultiAgentButton from './components/MultiAgentButton';

function App() {
  const [selectedAgent, setSelectedAgent] = useState('claude');

  const handleAgentSelect = (agentId) => {
    setSelectedAgent(agentId);
    console.log(`Selected agent: ${agentId}`);
  };

  return (
    <div>
      <MultiAgentButton
        onAgentSelect={handleAgentSelect}
        defaultAgent="claude"
      />
    </div>
  );
}

export default App;
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onAgentSelect` | `function` | - | Callback function called when an agent is selected. Receives `agentId` as parameter. |
| `defaultAgent` | `string` | `'claude'` | The initially selected agent. Can be `'claude'` or `'codex'`. |

### Available Agents

The component comes pre-configured with two agents:

1. **Claude**
   - ID: `claude`
   - Icon: 🤖
   - Color: #D97757
   - Description: Anthropic Claude AI

2. **Codex**
   - ID: `codex`
   - Icon: 💻
   - Color: #10A37F
   - Description: OpenAI Codex

## Customization

### Adding More Agents

To add more agents, modify the `agents` array in `MultiAgentButton.jsx`:

```jsx
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
  },
  {
    id: 'gpt4',
    name: 'GPT-4',
    description: 'OpenAI GPT-4',
    icon: '🧠',
    color: '#8B5CF6'
  }
];
```

### Styling

The component uses CSS custom properties for easy theming. You can override styles in your own CSS:

```css
.multi-agent-button {
  /* Your custom styles */
}

.agent-dropdown {
  /* Custom dropdown styles */
}
```

## Integration with Backend

Here's an example of how to integrate the agent selection with your backend:

```jsx
import React, { useState } from 'react';
import MultiAgentButton from './components/MultiAgentButton';

function ChatInterface() {
  const [selectedAgent, setSelectedAgent] = useState('claude');
  const [messages, setMessages] = useState([]);

  const handleAgentSelect = async (agentId) => {
    setSelectedAgent(agentId);

    // Update backend configuration
    try {
      await fetch('/api/agent/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });
    } catch (error) {
      console.error('Failed to update agent:', error);
    }
  };

  const sendMessage = async (message) => {
    // Use the selected agent for API calls
    const response = await fetch(`/api/${selectedAgent}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    setMessages([...messages, data]);
  };

  return (
    <div>
      <MultiAgentButton
        onAgentSelect={handleAgentSelect}
        defaultAgent="claude"
      />
      {/* Chat interface */}
    </div>
  );
}
```

## Examples

### Example 1: Simple Agent Switcher

```jsx
<MultiAgentButton
  onAgentSelect={(agentId) => console.log(`Switched to ${agentId}`)}
  defaultAgent="claude"
/>
```

### Example 2: With State Management

```jsx
const [agent, setAgent] = useState('codex');

<MultiAgentButton
  onAgentSelect={setAgent}
  defaultAgent={agent}
/>
```

### Example 3: With Notification

```jsx
const handleAgentChange = (agentId) => {
  setAgent(agentId);
  toast.success(`Switched to ${agentId}`);
};

<MultiAgentButton
  onAgentSelect={handleAgentChange}
  defaultAgent="claude"
/>
```

## Styling Features

- **Hover Effects**: Buttons lift slightly on hover
- **Active States**: Visual feedback on selection
- **Animations**: Smooth dropdown slide animation
- **Dark Mode**: Automatic theme adaptation
- **Responsive**: Mobile-friendly design

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

- Keyboard navigation support
- Semantic HTML structure
- Clear visual indicators
- Screen reader friendly

## Contributing

To improve this component:

1. Ensure changes maintain backward compatibility
2. Test in both light and dark modes
3. Verify responsive design on mobile devices
4. Update documentation for new features

## License

ISC

## Related

This component is part of the Advanced Authentication MERN Stack project.
