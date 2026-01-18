# SDK Examples

This directory contains practical examples for using the Pollax SDK.

## TypeScript/JavaScript Examples

### Basic Call
[`typescript/basic-call.ts`](./typescript/basic-call.ts)
- Create an AI agent
- Make a voice call
- Monitor call status
- Get call transcript

```bash
cd typescript
npm install
npx ts-node basic-call.ts
```

### Bulk Campaign
[`typescript/bulk-campaign.ts`](./typescript/bulk-campaign.ts)
- Create a campaign with multiple contacts
- Start and monitor campaign progress
- Get campaign statistics

```bash
npx ts-node bulk-campaign.ts
```

### Analytics
[`typescript/analytics.ts`](./typescript/analytics.ts)
- Get dashboard statistics
- Analyze call volume
- Monitor agent performance
- Export analytics data

```bash
npx ts-node analytics.ts
```

## Python Examples

### Basic Call
[`python/basic_call.py`](./python/basic_call.py)
- Create an AI agent
- Make a voice call
- Monitor call status
- Get call transcript

```bash
cd python
pip install pollax
python basic_call.py
```

### Bulk Campaign
[`python/bulk_campaign.py`](./python/bulk_campaign.py)
- Create a campaign with multiple contacts
- Start and monitor campaign progress
- Get campaign statistics

```bash
python bulk_campaign.py
```

### Knowledge Base
[`python/knowledge_base.py`](./python/knowledge_base.py)
- Upload documents to knowledge base
- Create knowledge-enabled agents
- Search knowledge base
- Make informed calls

```bash
python knowledge_base.py
```

## Setup

### Prerequisites

1. Get your API key from [pollax.ai/settings/api-keys](https://pollax.ai/settings/api-keys)
2. Set up environment variable:

```bash
export POLLAX_API_KEY=sk_live_your_api_key_here
```

Or create a `.env` file:

```env
POLLAX_API_KEY=sk_live_your_api_key_here
```

### TypeScript Setup

```bash
cd typescript
npm install
```

### Python Setup

```bash
cd python
pip install pollax
# or
pip install -r requirements.txt
```

## Common Patterns

### Error Handling

**TypeScript:**
```typescript
try {
  const call = await pollax.calls.create({
    agent_id: 'agent_123',
    to_number: '+1234567890',
  });
} catch (error) {
  if (error instanceof PollaxError) {
    console.error(`Error: ${error.message} (${error.statusCode})`);
  }
}
```

**Python:**
```python
from pollax import Pollax, PollaxError

try:
    call = client.calls.create(
        agent_id='agent_123',
        to_number='+1234567890',
    )
except PollaxError as e:
    print(f'Error: {e.message} ({e.status_code})')
```

### Async/Await Patterns

**TypeScript:**
```typescript
async function makeMultipleCalls() {
  const calls = await Promise.all([
    pollax.calls.create({ agent_id: 'agent_123', to_number: '+1111111111' }),
    pollax.calls.create({ agent_id: 'agent_123', to_number: '+2222222222' }),
    pollax.calls.create({ agent_id: 'agent_123', to_number: '+3333333333' }),
  ]);
  
  return calls;
}
```

**Python:**
```python
# Using context manager
with Pollax(api_key='...') as client:
    agents = client.agents.list()
    # Client automatically closed
```

### Pagination

```typescript
// Get all agents with pagination
let skip = 0;
const limit = 100;
const allAgents = [];

while (true) {
  const agents = await pollax.agents.list({ skip, limit });
  allAgents.push(...agents);
  
  if (agents.length < limit) break;
  skip += limit;
}
```

## Best Practices

1. **Always use environment variables for API keys**
   ```bash
   export POLLAX_API_KEY=sk_live_...
   ```

2. **Handle errors gracefully**
   ```python
   try:
       # API call
   except PollaxError as e:
       logger.error(f'API error: {e}')
   ```

3. **Use context managers in Python**
   ```python
   with Pollax(api_key='...') as client:
       # Your code
   ```

4. **Monitor call status before getting results**
   ```typescript
   while (call.status === 'in-progress') {
       await sleep(5000);
       call = await pollax.calls.retrieve(call.call_sid);
   }
   ```

5. **Set appropriate timeouts**
   ```typescript
   const pollax = new Pollax({
       apiKey: '...',
       timeout: 60000, // 60 seconds
   });
   ```

## More Resources

- 📖 [Quick Start Guide](../docs/quickstart.md)
- 📚 [API Reference](../docs/api-reference.md)
- 🎯 [Best Practices](../docs/best-practices.md)
- 💬 [Discord Community](https://discord.gg/pollax)

## Support

Need help? Reach out:
- Email: support@pollax.ai
- Discord: https://discord.gg/pollax
- Issues: https://github.com/pollax/pollax-sdk/issues
