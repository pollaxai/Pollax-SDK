# Pollax TypeScript/JavaScript SDK

Official TypeScript/JavaScript SDK for the Pollax AI Voice Platform.

## Installation

```bash
npm install @pollax/sdk
# or
yarn add @pollax/sdk
# or
pnpm add @pollax/sdk
```

## Quick Start

```typescript
import Pollax from '@pollax/sdk';

const pollax = new Pollax({
  apiKey: 'sk_live_your_api_key_here',
});

// Create an AI agent
const agent = await pollax.agents.create({
  name: 'Customer Support Agent',
  systemPrompt: 'You are a helpful customer support agent for Acme Corp.',
  voice_id: 'alloy',
  model: 'gpt-4',
});

// Make a call
const call = await pollax.calls.create({
  agent_id: agent.id,
  to_number: '+1234567890',
  from_number: '+0987654321',
});

console.log(`Call initiated: ${call.callSid}`);
```

## Features

- Full TypeScript support with complete type definitions
- Promise-based async/await API
- Automatic retry logic with exponential backoff
- Comprehensive error handling
- Works in Node.js and modern browsers
- Tree-shakeable ESM and CommonJS builds

## API Reference

### Client Initialization

```typescript
const pollax = new Pollax({
  apiKey: 'sk_live_...',        // Required
  baseURL: 'https://api.pollax.ai',  // Optional
  timeout: 30000,                // Optional (ms)
  maxRetries: 3,                 // Optional
  tenantId: 'org_123',          // Optional
});
```

### Agents

```typescript
// Create agent
const agent = await pollax.agents.create({
  name: 'Support Agent',
  system_prompt: 'You are a helpful assistant',
  voice_provider: 'elevenlabs',
  voice_id: 'voice_abc123',
  model: 'gpt-4',
});

// List agents
const agents = await pollax.agents.list({ is_active: true });

// Get agent
const agent = await pollax.agents.retrieve('agent_123');

// Update agent
const updated = await pollax.agents.update('agent_123', {
  name: 'New Name',
  is_active: false,
});

// Delete agent
await pollax.agents.delete('agent_123');
```

### Calls

```typescript
// Create call
const call = await pollax.calls.create({
  agent_id: 'agent_123',
  to_number: '+1234567890',
  from_number: '+0987654321',
  metadata: {
    customer_id: 'cust_456',
  },
});

// List calls
const calls = await pollax.calls.list({
  agent_id: 'agent_123',
  status: 'completed',
});

// Get call
const call = await pollax.calls.retrieve('CA123456');

// End call
await pollax.calls.end('CA123456');

// Get transcript
const transcript = await pollax.calls.getTranscript('CA123456');
```

### Campaigns

```typescript
// Create campaign
const campaign = await pollax.campaigns.create({
  name: 'Q1 Outreach',
  agent_id: 'agent_123',
  contacts: [
    { name: 'John', phone: '+1234567890' },
    { name: 'Jane', phone: '+0987654321' },
  ],
});

// Start campaign
await pollax.campaigns.start('campaign_123');

// Get stats
const stats = await pollax.campaigns.getStats('campaign_123');
```

### Knowledge Base

```typescript
// Upload document
const doc = await pollax.knowledge.upload({
  name: 'Product Manual',
  file: pdfFile,
  type: 'pdf',
});

// Search knowledge
const results = await pollax.knowledge.search({
  query: 'How do I reset password?',
  limit: 5,
});
```

### Analytics

```typescript
// Get dashboard stats
const stats = await pollax.analytics.getStats();

// Get call volume
const volume = await pollax.analytics.getCallVolume({
  period: '7d',
});

// Get agent performance
const performance = await pollax.analytics.getAgentPerformance('agent_123');
```

## Error Handling

```typescript
import { PollaxError, AuthenticationError, NotFoundError } from '@pollax/sdk';

try {
  const agent = await pollax.agents.retrieve('agent_123');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof NotFoundError) {
    console.error('Agent not found');
  } else if (error instanceof PollaxError) {
    console.error(`API error: ${error.message}`);
    console.error(`Status code: ${error.statusCode}`);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides complete type definitions:

```typescript
import Pollax, { Agent, Call, Campaign } from '@pollax/sdk';

const pollax = new Pollax({ apiKey: 'sk_live_...' });

// Full type safety
const agent: Agent = await pollax.agents.create({
  name: 'Support Agent',
  system_prompt: 'You are helpful',
  model: 'gpt-4', // TypeScript knows valid values
});

const call: Call = await pollax.calls.create({
  agent_id: agent.id,
  to_number: '+1234567890',
});
```

## Browser Usage

The SDK works in modern browsers with module bundlers:

```html
<script type="module">
  import Pollax from '@pollax/sdk';

  const pollax = new Pollax({
    apiKey: 'sk_live_...',
  });

  const agents = await pollax.agents.list();
  console.log(agents);
</script>
```

## License

MIT
