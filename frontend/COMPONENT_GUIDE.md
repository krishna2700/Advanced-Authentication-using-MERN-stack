# Multi-Agent Button Component Guide

## Quick Start

The Multi-Agent Button component is now ready to use! It provides a clean interface for selecting between Claude and Codex AI agents.

## Visual Preview

### Closed State
```
┌─────────────────────┐
│ 🤖 Claude      ▼   │
└─────────────────────┘
```

### Open State
```
┌─────────────────────┐
│ 🤖 Claude      ▲   │
└─────────────────────┘
┌─────────────────────────────┐
│ 🤖  Claude                ✓│
│     Anthropic Claude AI    │
├────────────────────────────│
│ 💻  Codex                  │
│     OpenAI Codex           │
└────────────────────────────┘
```

## File Structure

```
frontend/
├── public/
│   └── index.html                    # HTML template
├── src/
│   ├── components/
│   │   ├── MultiAgentButton.jsx     # Main component
│   │   ├── MultiAgentButton.css     # Component styles
│   │   └── index.js                  # Component exports
│   ├── App.jsx                       # Example implementation
│   ├── App.css                       # App styles
│   ├── index.js                      # React entry point
│   └── index.css                     # Global styles
└── README.md                          # Full documentation
```

## Component Features

### 1. Agent Selection
- Click the button to open dropdown
- Select between Claude and Codex
- Visual feedback with checkmark
- Auto-closes after selection

### 2. Visual Design
- Icons for each agent (🤖 for Claude, 💻 for Codex)
- Color-coded borders
- Smooth animations
- Hover effects

### 3. State Management
- Tracks selected agent
- Callback on selection change
- Default agent configuration

### 4. Responsive
- Works on mobile and desktop
- Dark mode support
- Touch-friendly

## Usage Examples

### Basic Implementation
```jsx
import { MultiAgentButton } from './components';

function MyApp() {
  const handleSelect = (agentId) => {
    console.log('Selected:', agentId);
  };

  return (
    <MultiAgentButton
      onAgentSelect={handleSelect}
      defaultAgent="claude"
    />
  );
}
```

### With State
```jsx
const [agent, setAgent] = useState('claude');

<MultiAgentButton
  onAgentSelect={setAgent}
  defaultAgent={agent}
/>

<p>Current agent: {agent}</p>
```

### With API Integration
```jsx
const handleAgentSelect = async (agentId) => {
  // Update frontend state
  setSelectedAgent(agentId);

  // Notify backend
  await fetch('/api/agent/select', {
    method: 'POST',
    body: JSON.stringify({ agentId })
  });
};

<MultiAgentButton onAgentSelect={handleAgentSelect} />
```

## Component Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onAgentSelect | function | No | - | Callback when agent is selected |
| defaultAgent | string | No | 'claude' | Initial selected agent |

## Agent Configuration

Each agent has the following properties:

```javascript
{
  id: 'claude',           // Unique identifier
  name: 'Claude',         // Display name
  description: '...',     // Short description
  icon: '🤖',            // Emoji icon
  color: '#D97757'       // Theme color
}
```

## Customization

### Adding More Agents

Edit `MultiAgentButton.jsx`:

```jsx
const agents = [
  // Existing agents...
  {
    id: 'gpt4',
    name: 'GPT-4',
    description: 'OpenAI GPT-4',
    icon: '🧠',
    color: '#8B5CF6'
  }
];
```

### Changing Styles

Override CSS classes:

```css
/* Custom button color */
.multi-agent-button {
  background-color: #your-color;
}

/* Custom dropdown width */
.agent-dropdown {
  min-width: 300px;
}
```

## Integration Points

### 1. Frontend State
```jsx
const [selectedAgent, setSelectedAgent] = useState('claude');
```

### 2. Backend API
```jsx
fetch(`/api/${selectedAgent}/chat`, {
  method: 'POST',
  body: JSON.stringify({ message })
});
```

### 3. Context/Redux
```jsx
const { setAgent } = useAgentContext();

<MultiAgentButton onAgentSelect={setAgent} />
```

## Testing

### Manual Testing
1. Click the button - dropdown should appear
2. Select Claude - button shows Claude with checkmark
3. Select Codex - button shows Codex with checkmark
4. Click outside - dropdown should close
5. Check console - onAgentSelect should log selections

### Component Testing
```jsx
import { render, fireEvent } from '@testing-library/react';
import MultiAgentButton from './MultiAgentButton';

test('selects agent', () => {
  const handleSelect = jest.fn();
  const { getByText } = render(
    <MultiAgentButton onAgentSelect={handleSelect} />
  );

  fireEvent.click(getByText('Claude'));
  fireEvent.click(getByText('Codex'));

  expect(handleSelect).toHaveBeenCalledWith('codex');
});
```

## Browser Compatibility

✓ Chrome/Edge (Chromium)
✓ Firefox
✓ Safari
✓ Mobile browsers

## Performance

- Lightweight component (~100 lines)
- No external dependencies (besides React)
- CSS animations for smooth UX
- Minimal re-renders

## Accessibility

- Semantic HTML
- Keyboard navigation ready
- Clear visual indicators
- Screen reader compatible

## Next Steps

1. **Install React** (if not already):
   ```bash
   npm install react react-dom
   ```

2. **Import the component**:
   ```jsx
   import { MultiAgentButton } from './components';
   ```

3. **Use it**:
   ```jsx
   <MultiAgentButton onAgentSelect={handleSelect} />
   ```

4. **Customize** as needed for your use case

## Support

For questions or issues:
- Check the main README.md
- Review the component code
- Test the example App.jsx

---

**Status**: ✅ Ready to use
**Last Updated**: 2026-03-24
