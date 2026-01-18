# Best Practices

Guidelines for using the Pollax SDK effectively and securely.

## Security

### API Key Management

**DO:**
```python
import os
from pollax import Pollax

# Use environment variables
client = Pollax(api_key=os.environ['POLLAX_API_KEY'])
```

**DON'T:**
```python
# Never hardcode API keys
client = Pollax(api_key='sk_live_abc123...')  # BAD!
```

### Environment Variables

Create a `.env` file (and add to `.gitignore`):
```bash
POLLAX_API_KEY=sk_live_your_key_here
POLLAX_BASE_URL=https://api.pollax.ai
```

Load with:
```python
from dotenv import load_dotenv
load_dotenv()
```

## Error Handling

### Always Handle Errors

**TypeScript:**
```typescript
try {
  const call = await pollax.calls.create({
    agent_id: 'agent_123',
    to_number: '+1234567890',
  });
} catch (error) {
  if (error instanceof RateLimitError) {
    // Wait and retry
    await sleep(5000);
    // Retry logic
  } else if (error instanceof AuthenticationError) {
    // Log and alert
    logger.error('Invalid API key');
  } else {
    // Generic error handling
    logger.error(`API error: ${error.message}`);
  }
}
```

**Python:**
```python
from pollax import Pollax, PollaxError, RateLimitError

try:
    call = client.calls.create(
        agent_id='agent_123',
        to_number='+1234567890',
    )
except RateLimitError:
    # Wait and retry
    time.sleep(5)
    # Retry logic
except PollaxError as e:
    # Handle error
    logger.error(f'API error: {e.message}')
```

## Resource Management

### Use Context Managers (Python)

```python
# Automatically closes the client
with Pollax(api_key=os.environ['POLLAX_API_KEY']) as client:
    agents = client.agents.list()
    # Client is automatically closed
```

### Close Clients Explicitly

```typescript
const pollax = new Pollax({ apiKey: '...' });

try {
  // Your code
} finally {
  // Clean up if needed
}
```

## Performance

### Batch Operations

```typescript
// Good: Parallel requests
const calls = await Promise.all([
  pollax.calls.create({ agent_id: 'agent_1', to_number: '+1111' }),
  pollax.calls.create({ agent_id: 'agent_1', to_number: '+2222' }),
  pollax.calls.create({ agent_id: 'agent_1', to_number: '+3333' }),
]);

// Bad: Sequential requests
const call1 = await pollax.calls.create({ agent_id: 'agent_1', to_number: '+1111' });
const call2 = await pollax.calls.create({ agent_id: 'agent_1', to_number: '+2222' });
const call3 = await pollax.calls.create({ agent_id: 'agent_1', to_number: '+3333' });
```

### Pagination

```python
# Efficient pagination
def get_all_agents(client):
    skip = 0
    limit = 100
    all_agents = []
    
    while True:
        agents = client.agents.list(skip=skip, limit=limit)
        all_agents.extend(agents)
        
        if len(agents) < limit:
            break
        skip += limit
    
    return all_agents
```

### Caching

```typescript
// Cache frequently accessed data
class AgentCache {
  private cache = new Map<string, Agent>();
  
  async get(pollax: Pollax, agentId: string): Promise<Agent> {
    if (this.cache.has(agentId)) {
      return this.cache.get(agentId)!;
    }
    
    const agent = await pollax.agents.retrieve(agentId);
    this.cache.set(agentId, agent);
    return agent;
  }
}
```

## Call Management

### Monitor Call Status

```python
import time

def wait_for_call_completion(client, call_sid, max_wait=300):
    """Wait for call to complete with timeout"""
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        call = client.calls.retrieve(call_sid)
        
        if call.status not in ['queued', 'ringing', 'in-progress']:
            return call
        
        time.sleep(5)
    
    raise TimeoutError(f'Call {call_sid} did not complete in {max_wait}s')
```

### Handle Call Failures

```typescript
async function makeResilientCall(
  pollax: Pollax,
  params: CreateCallParams,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const call = await pollax.calls.create(params);
      
      // Wait for completion
      let status = call.status;
      while (['queued', 'ringing', 'in-progress'].includes(status)) {
        await sleep(5000);
        const updated = await pollax.calls.retrieve(call.call_sid);
        status = updated.status;
      }
      
      if (status === 'completed') {
        return call;
      }
      
      // Call failed, retry if attempts remaining
      if (i < maxRetries - 1) {
        console.log(`Call failed (${status}), retrying...`);
        await sleep(2000 * Math.pow(2, i)); // Exponential backoff
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(2000 * Math.pow(2, i));
    }
  }
  
  throw new Error('Call failed after max retries');
}
```

## Campaign Management

### Validate Contacts

```python
def validate_phone_number(phone: str) -> bool:
    """Validate phone number format"""
    import re
    # E.164 format
    return bool(re.match(r'^\+[1-9]\d{1,14}$', phone))

def create_campaign_safely(client, name, agent_id, contacts):
    """Create campaign with validated contacts"""
    valid_contacts = [
        c for c in contacts
        if validate_phone_number(c.get('phone', ''))
    ]
    
    if not valid_contacts:
        raise ValueError('No valid contacts provided')
    
    return client.campaigns.create(
        name=name,
        agent_id=agent_id,
        contacts=valid_contacts,
    )
```

### Monitor Campaign Progress

```typescript
async function monitorCampaign(
  pollax: Pollax,
  campaignId: string,
  onProgress?: (stats: any) => void
) {
  let campaign = await pollax.campaigns.retrieve(campaignId);
  
  while (['scheduled', 'running'].includes(campaign.status)) {
    await sleep(10000); // Check every 10 seconds
    
    const stats = await pollax.campaigns.getStats(campaignId);
    campaign = await pollax.campaigns.retrieve(campaignId);
    
    if (onProgress) {
      onProgress(stats);
    }
    
    const progress = (stats.completed_calls / stats.total_contacts) * 100;
    console.log(`Progress: ${progress.toFixed(1)}%`);
  }
  
  return campaign;
}
```

## Logging

### Structure Your Logs

```python
import logging

# Configure logger
logger = logging.getLogger('pollax_app')
logger.setLevel(logging.INFO)

# Log with context
def create_agent_with_logging(client, **params):
    logger.info('Creating agent', extra={
        'name': params.get('name'),
        'model': params.get('model'),
    })
    
    try:
        agent = client.agents.create(**params)
        logger.info('Agent created successfully', extra={
            'agent_id': agent.id,
        })
        return agent
    except Exception as e:
        logger.error('Failed to create agent', extra={
            'error': str(e),
            'params': params,
        })
        raise
```

### Don't Log Sensitive Data

```typescript
// BAD - Logs API key
console.log('Client:', pollax);

// GOOD - Logs without sensitive data
console.log('Making API call to:', '/api/v1/agents');
```

## Testing

### Mock API Calls

```python
from unittest.mock import Mock, patch

def test_agent_creation():
    with patch('pollax.client.httpx.Client') as mock_client:
        # Mock the response
        mock_client.return_value.request.return_value.json.return_value = {
            'id': 'agent_123',
            'name': 'Test Agent',
        }
        
        client = Pollax(api_key='test_key')
        agent = client.agents.create(name='Test Agent', system_prompt='Test')
        
        assert agent.id == 'agent_123'
        assert agent.name == 'Test Agent'
```

### Integration Tests

```typescript
describe('Pollax Integration', () => {
  let pollax: Pollax;
  let testAgent: Agent;
  
  beforeAll(() => {
    pollax = new Pollax({
      apiKey: process.env.POLLAX_TEST_API_KEY || '',
    });
  });
  
  afterEach(async () => {
    // Clean up test resources
    if (testAgent) {
      await pollax.agents.delete(testAgent.id);
    }
  });
  
  it('should create and retrieve agent', async () => {
    testAgent = await pollax.agents.create({
      name: 'Test Agent',
      system_prompt: 'Test',
    });
    
    const retrieved = await pollax.agents.retrieve(testAgent.id);
    expect(retrieved.id).toBe(testAgent.id);
  });
});
```

## Rate Limiting

### Respect Rate Limits

```python
import time
from functools import wraps

def rate_limit(calls_per_second=10):
    """Decorator to rate limit function calls"""
    min_interval = 1.0 / calls_per_second
    last_called = [0.0]
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            wait_time = min_interval - elapsed
            
            if wait_time > 0:
                time.sleep(wait_time)
            
            result = func(*args, **kwargs)
            last_called[0] = time.time()
            return result
        
        return wrapper
    return decorator

@rate_limit(calls_per_second=10)
def create_call(client, **params):
    return client.calls.create(**params)
```

## Monitoring

### Track SDK Usage

```typescript
class PollaxMonitor {
  private metrics = {
    calls_created: 0,
    calls_failed: 0,
    avg_duration: 0,
  };
  
  async createCall(pollax: Pollax, params: CreateCallParams) {
    const startTime = Date.now();
    
    try {
      const call = await pollax.calls.create(params);
      this.metrics.calls_created++;
      return call;
    } catch (error) {
      this.metrics.calls_failed++;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.metrics.avg_duration = 
        (this.metrics.avg_duration + duration) / 2;
    }
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}
```

## Summary

**Always:**
- Use environment variables for API keys
- Handle errors gracefully
- Close resources properly
- Validate inputs
- Log operations (without sensitive data)
- Test your code
- Monitor rate limits

**Never:**
- Hardcode API keys
- Ignore errors
- Log sensitive data
- Make unlimited parallel requests
- Skip input validation
- Deploy without testing

For more information, see:
- [Quick Start Guide](./quickstart.md)
- [API Reference](./api-reference.md)
- [Examples](../examples)
