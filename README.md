# Pollax SDK

Official SDKs for the Pollax AI Voice Platform

[![npm version](https://img.shields.io/npm/v/pollax.svg)](https://www.npmjs.com/package/pollax)
[![PyPI version](https://img.shields.io/pypi/v/pollax.svg)](https://pypi.org/project/pollax/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Available SDKs

- **[TypeScript/JavaScript](./typescript)** - For Node.js and Browser
- **[Python](./python)** - For Python 3.8+
- **[Go](./go)** - For Go 1.18+

## Quick Start

### TypeScript/JavaScript

```bash
npm install pollax
```

```typescript
import Pollax from 'pollax';

const pollax = new Pollax({
  apiKey: 'sk_live_...',
});

// Create an AI agent
const agent = await pollax.agents.create({
  name: 'Customer Support Agent',
  systemPrompt: 'You are a helpful customer support agent.',
  voice: 'alloy',
  model: 'gpt-4',
});

// Make a call
const call = await pollax.calls.create({
  agentId: agent.id,
  toNumber: '+1234567890',
});

console.log('Call initiated:', call.callSid);
```

### Python

```bash
pip install pollax
```

```python
from pollax import Pollax

pollax = Pollax(api_key='sk_live_...')

# Create an AI agent
agent = pollax.agents.create(
    name='Customer Support Agent',
    system_prompt='You are a helpful customer support agent.',
    voice='alloy',
    model='gpt-4',
)

# Make a call
call = pollax.calls.create(
    agent_id=agent.id,
    to_number='+1234567890',
)

print(f'Call initiated: {call.call_sid}')
```

### Go

```bash
go get github.com/pollax/pollax-go
```

```go
import "github.com/pollax/pollax-go"

client := pollax.NewClient("sk_live_...")

// Create an AI agent
agent, _ := client.Agents.Create(&pollax.AgentCreateParams{
    Name:         "Customer Support Agent",
    SystemPrompt: "You are a helpful customer support agent.",
    Voice:        "alloy",
    Model:        "gpt-4",
})

// Make a call
call, _ := client.Calls.Create(&pollax.CallCreateParams{
    AgentID:  agent.ID,
    ToNumber: "+1234567890",
})

fmt.Printf("Call initiated: %s\n", call.CallSID)
```

## Personalizing calls with variables

Pass per-call `variables` to make the agent greet each caller by name and speak
their specific data (balance, due date, order status, …). The values are
substituted into the agent's **system prompt** and **welcome message**, and are
also given to the agent as caller context so it can answer follow-up questions
accurately ("what's my outstanding balance?").

```typescript
const call = await pollax.calls.create({
  agentId: agent.id,
  toNumber: '+1234567890',
  variables: {
    contact_name: 'Alex',
    amount_due: '120',
    due_date: '2025-07-01',
  },
});
```

```python
call = pollax.calls.create(
    agent_id=agent.id,
    to_number='+1234567890',
    variables={
        'contact_name': 'Alex',
        'amount_due': '120',
        'due_date': '2025-07-01',
    },
)
```

Reference the variables in your agent's **system prompt** or **welcome message**
with double braces:

> "Hello {{contact_name}}, this is Riya from Acme — I'm calling about your
> outstanding balance of {{amount_due}}, due {{due_date}}."

**Placeholder conventions**

| Where | Syntax | Example |
| --- | --- | --- |
| Agent system prompt & welcome message | `{{variable}}` (also accepts `{variable}`) | `{{contact_name}}` |
| One-way `announcement_message` | `{variable}` | `{contact_name}` |

- Unknown placeholders (no matching variable) are left as-is and never read aloud.
- The same `variables` work on **campaigns** — set them per contact so every call
  in a bulk run is personalized.

## Features

- **AI Agent Management** - Create and manage voice agents
- **Voice Calls** - Initiate, manage, and monitor calls
- **Campaigns** - Run bulk calling campaigns
- **Knowledge Base** - Upload documents and manage knowledge
- **Analytics** - Get call metrics and performance data
- **Integrations** - Connect with CRM and communication tools
- **Real-time Events** - WebSocket support for live updates
- **Type Safety** - Full TypeScript definitions
- **Error Handling** - Comprehensive error types
- **Retry Logic** - Automatic retries with exponential backoff

## Documentation

- [Full API Documentation](https://docs.pollax.ai)
- [Quick Start Guide](./docs/quickstart.md)
- [API Reference](./docs/api-reference.md)
- [Examples](./examples)
- [Best Practices](./docs/best-practices.md)

## Support

- [Discord Community](https://discord.gg/pollax)
- Email: support@pollax.ai
- [Report Issues](https://github.com/pollax/pollax-sdk/issues)

## License

MIT License - see [LICENSE](./LICENSE) for details.
