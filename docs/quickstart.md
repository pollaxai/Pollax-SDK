# Quick Start Guide

## Installation

### TypeScript/JavaScript

```bash
npm install @pollax/sdk
```

### Python

```bash
pip install pollax
```

## Get Your API Key

1. Sign up at [pollax.ai](https://pollax.ai)
2. Navigate to Settings → API Keys
3. Click "Create New API Key"
4. Copy your API key (starts with `sk_live_` or `sk_test_`)

## Your First API Call

### TypeScript/JavaScript

```typescript
import Pollax from '@pollax/sdk';

const pollax = new Pollax({
  apiKey: 'sk_live_your_api_key_here',
});

async function main() {
  // Create an AI agent
  const agent = await pollax.agents.create({
    name: 'Customer Support Agent',
    systemPrompt: 'You are a helpful customer support agent.',
    voice_id: 'alloy',
    model: 'gpt-4',
  });

  console.log('Agent created:', agent.id);

  // Make a call
  const call = await pollax.calls.create({
    agent_id: agent.id,
    to_number: '+1234567890',
  });

  console.log('Call initiated:', call.call_sid);
}

main();
```

### Python

```python
from pollax import Pollax

client = Pollax(api_key='sk_live_your_api_key_here')

# Create an AI agent
agent = client.agents.create(
    name='Customer Support Agent',
    system_prompt='You are a helpful customer support agent.',
    voice_id='alloy',
    model='gpt-4',
)

print(f'Agent created: {agent.id}')

# Make a call
call = client.calls.create(
    agent_id=agent.id,
    to_number='+1234567890',
)

print(f'Call initiated: {call.call_sid}')
```

## Common Use Cases

### 1. Customer Support Agent

```python
# Create a customer support agent
agent = client.agents.create(
    name='24/7 Support Agent',
    system_prompt='''
    You are a helpful customer support agent for Acme Corp.
    
    Your role:
    - Answer customer questions about products
    - Help with order tracking
    - Handle returns and refunds
    - Escalate complex issues to human agents
    
    Be friendly, professional, and concise.
    ''',
    voice_id='alloy',
    model='gpt-4',
)

# Make a call
call = client.calls.create(
    agent_id=agent.id,
    to_number='+1234567890',
    metadata={'customer_id': 'cust_12345'},
)
```

### 2. Appointment Reminder Campaign

```python
# Create an agent
agent = client.agents.create(
    name='Appointment Reminder',
    system_prompt='You are calling to remind customers about their upcoming appointment.',
    voice_id='shimmer',
)

# Create a campaign
campaign = client.campaigns.create(
    name='Tomorrow\'s Appointments',
    agent_id=agent.id,
    contacts=[
        {
            'name': 'John Doe',
            'phone': '+1234567890',
            'metadata': {'appointment_time': '2:00 PM', 'doctor': 'Dr. Smith'}
        },
        {
            'name': 'Jane Smith',
            'phone': '+0987654321',
            'metadata': {'appointment_time': '3:30 PM', 'doctor': 'Dr. Jones'}
        },
    ],
)

# Start the campaign
client.campaigns.start(campaign.id)

# Check progress
stats = client.campaigns.get_stats(campaign.id)
print(f'Completed: {stats["completed_calls"]}/{stats["total_contacts"]}')
```

### 3. Sales Outreach with Knowledge Base

```python
# Upload product information
with open('product_catalog.pdf', 'rb') as f:
    doc = client.knowledge.upload(
        name='Product Catalog',
        file=f,
        doc_type='pdf',
    )

# Create sales agent with knowledge base access
agent = client.agents.create(
    name='Sales Agent',
    system_prompt='''
    You are a sales representative calling potential customers.
    Use the knowledge base to answer product questions accurately.
    Be persuasive but not pushy.
    ''',
    voice_id='onyx',
    model='gpt-4',
)

# Make outbound calls
call = client.calls.create(
    agent_id=agent.id,
    to_number='+1234567890',
)
```

## Best Practices

### 1. Use Environment Variables for API Keys

```bash
# .env file
POLLAX_API_KEY=sk_live_your_api_key_here
```

```python
import os
from pollax import Pollax

client = Pollax(api_key=os.environ['POLLAX_API_KEY'])
```

### 2. Handle Errors Gracefully

```python
from pollax import Pollax, PollaxError, RateLimitError

client = Pollax(api_key='...')

try:
    call = client.calls.create(agent_id='agent_123', to_number='+1234567890')
except RateLimitError:
    # Wait and retry
    time.sleep(5)
    call = client.calls.create(agent_id='agent_123', to_number='+1234567890')
except PollaxError as e:
    print(f'Error: {e.message}')
```

### 3. Use Context Managers (Python)

```python
# Automatically closes the client
with Pollax(api_key='...') as client:
    agents = client.agents.list()
    # client is automatically closed when exiting the context
```

### 4. Monitor Call Status

```python
import time

# Initiate call
call = client.calls.create(agent_id='agent_123', to_number='+1234567890')

# Poll for completion
while call.status in ['queued', 'ringing', 'in-progress']:
    time.sleep(5)
    call = client.calls.retrieve(call.call_sid)
    print(f'Status: {call.status}')

# Get results
if call.status == 'completed':
    transcript = client.calls.get_transcript(call.call_sid)
    print('Transcript:', transcript)
```

## Next Steps

- Read the [API Reference](./api-reference.md)
- Explore [Examples](../examples)
- Learn [Best Practices](./best-practices.md)
- Check out [Advanced Features](./advanced-features.md)

## Get Help

- [Discord Community](https://discord.gg/pollax)
- Email: support@pollax.ai
- [Report Issues](https://github.com/pollax/pollax-sdk/issues)
