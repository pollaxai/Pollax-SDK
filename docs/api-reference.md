# API Reference

Complete reference for the Pollax SDK.

## Client Initialization

### TypeScript/JavaScript

```typescript
import Pollax from '@pollax/sdk';

const pollax = new Pollax({
  apiKey: string;        // Required: Your API key
  baseURL?: string;      // Optional: API base URL
  timeout?: number;      // Optional: Request timeout (ms)
  maxRetries?: number;   // Optional: Max retry attempts
  tenantId?: string;     // Optional: Organization/tenant ID
});
```

### Python

```python
from pollax import Pollax

client = Pollax(
    api_key: str,          # Required: Your API key
    base_url: str = "https://api.pollax.ai",  # Optional
    timeout: float = 30.0, # Optional: Request timeout (seconds)
    max_retries: int = 3,  # Optional: Max retry attempts
    tenant_id: str = None, # Optional: Organization/tenant ID
)
```

## Agents

### create()

Create a new AI agent.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Agent name |
| system_prompt | string | Yes | System prompt for the agent |
| description | string | No | Agent description |
| provider | string | No | LLM provider (openai, anthropic, ollama) |
| model | string | No | Model name (gpt-4, claude-3, etc.) |
| voice_provider | string | No | Voice provider (elevenlabs, openai, google) |
| voice_id | string | No | Voice ID |
| stt_provider | string | No | Speech-to-text provider |
| temperature | number | No | Model temperature (0-1) |
| max_tokens | number | No | Maximum tokens |

**Returns:** `Agent`

**Example:**

```typescript
const agent = await pollax.agents.create({
  name: 'Support Agent',
  system_prompt: 'You are helpful',
  voice_id: 'alloy',
  model: 'gpt-4',
});
```

### list()

List all agents.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| is_active | boolean | No | Filter by active status |
| skip | number | No | Number to skip |
| limit | number | No | Maximum to return |

**Returns:** `Agent[]`

### retrieve()

Get a single agent by ID.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| agent_id | string | Yes | Agent ID |

**Returns:** `Agent`

### update()

Update an agent.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| agent_id | string | Yes | Agent ID |
| name | string | No | New name |
| description | string | No | New description |
| system_prompt | string | No | New system prompt |
| is_active | boolean | No | Active status |

**Returns:** `Agent`

### delete()

Delete an agent.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| agent_id | string | Yes | Agent ID |

**Returns:** `{ success: boolean }`

## Calls

### create()

Create a new voice call.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| agent_id | string | Yes | Agent ID |
| to_number | string | Yes | Destination phone number |
| from_number | string | No | Caller phone number |
| metadata | object | No | Additional metadata |

**Returns:** `Call`

**Example:**

```python
call = client.calls.create(
    agent_id='agent_123',
    to_number='+1234567890',
    metadata={'customer_id': 'cust_456'},
)
```

### list()

List all calls.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| agent_id | string | No | Filter by agent ID |
| status | string | No | Filter by status |
| skip | number | No | Number to skip |
| limit | number | No | Maximum to return |

**Returns:** `Call[]`

### retrieve()

Get a single call by SID.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| call_sid | string | Yes | Call SID |

**Returns:** `Call`

### end()

End an active call.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| call_sid | string | Yes | Call SID |

**Returns:** `Call`

### transfer()

Transfer a call to another number.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| call_sid | string | Yes | Call SID |
| to_number | string | Yes | Transfer destination |

**Returns:** `Call`

### getTranscript()

Get call transcript.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| call_sid | string | Yes | Call SID |

**Returns:** `{ transcript: string, messages: any[] }`

### getRecording()

Get call recording URL.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| call_sid | string | Yes | Call SID |

**Returns:** `{ url: string }`

## Campaigns

### create()

Create a new campaign.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Campaign name |
| agent_id | string | No | Agent ID |
| scheduled_time | string | No | Scheduled start time (ISO 8601) |
| contacts | array | No | Array of contact objects |

**Returns:** `Campaign`

**Example:**

```typescript
const campaign = await pollax.campaigns.create({
  name: 'Q1 Outreach',
  agent_id: 'agent_123',
  contacts: [
    { name: 'John', phone: '+1234567890' },
    { name: 'Jane', phone: '+0987654321' },
  ],
});
```

### list()

List all campaigns.

**Returns:** `Campaign[]`

### retrieve()

Get a single campaign by ID.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| campaign_id | string | Yes | Campaign ID |

**Returns:** `Campaign`

### update()

Update a campaign.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| campaign_id | string | Yes | Campaign ID |
| name | string | No | New name |
| agent_id | string | No | New agent ID |
| status | string | No | New status |

**Returns:** `Campaign`

### delete()

Delete a campaign.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| campaign_id | string | Yes | Campaign ID |

**Returns:** `{ success: boolean }`

### start()

Start a campaign.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| campaign_id | string | Yes | Campaign ID |

**Returns:** `Campaign`

### pause()

Pause a running campaign.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| campaign_id | string | Yes | Campaign ID |

**Returns:** `Campaign`

### getStats()

Get campaign statistics.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| campaign_id | string | Yes | Campaign ID |

**Returns:** Statistics object

## Knowledge Base

### upload()

Upload a document to the knowledge base.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Document name |
| file | File/Buffer | No | File to upload |
| content | string | No | Text content |
| url | string | No | URL to fetch |
| type | string | No | Document type (pdf, txt, docx, url) |

**Returns:** `KnowledgeDocument`

**Example:**

```python
with open('manual.pdf', 'rb') as f:
    doc = client.knowledge.upload(
        name='Product Manual',
        file=f,
        doc_type='pdf',
    )
```

### list()

List all knowledge documents.

**Returns:** `KnowledgeDocument[]`

### retrieve()

Get a single document by ID.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| document_id | string | Yes | Document ID |

**Returns:** `KnowledgeDocument`

### delete()

Delete a document.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| document_id | string | Yes | Document ID |

**Returns:** `{ success: boolean }`

### search()

Search the knowledge base.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| query | string | Yes | Search query |
| limit | number | No | Maximum results (default: 5) |

**Returns:** Search results

## Analytics

### getStats()

Get dashboard statistics.

**Returns:** `DashboardStats`

**Example:**

```typescript
const stats = await pollax.analytics.getStats();
console.log(`Total calls: ${stats.total_calls}`);
console.log(`Success rate: ${stats.success_rate}`);
```

### getCallVolume()

Get call volume over time.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| period | string | No | Time period (24h, 7d, 30d) |

**Returns:** Call volume data

### getAgentPerformance()

Get agent performance metrics.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| agent_id | string | Yes | Agent ID |

**Returns:** Performance metrics

### export()

Export analytics data.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| start_date | string | Yes | Start date (YYYY-MM-DD) |
| end_date | string | Yes | End date (YYYY-MM-DD) |
| format | string | No | Export format (csv, json) |

**Returns:** Exported data

## Models

### Agent

```typescript
{
  id: string;
  name: string;
  description?: string;
  system_prompt: string;
  provider: 'openai' | 'anthropic' | 'ollama';
  model: string;
  voice_provider?: 'elevenlabs' | 'openai' | 'google';
  voice_id?: string;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  calls_count?: number;
  success_rate?: string;
  avg_duration?: string;
}
```

### Call

```typescript
{
  call_sid: string;
  agent_id: string;
  to_number: string;
  from_number?: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed';
  direction: 'inbound' | 'outbound';
  duration?: number;
  start_time?: string;
  end_time?: string;
  recording_url?: string;
  transcript?: string;
  metadata?: object;
  created_at: string;
}
```

### Campaign

```typescript
{
  id: string;
  name: string;
  agent_id?: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';
  scheduled_time?: string;
  contacts: Array<{
    name?: string;
    phone: string;
    email?: string;
    metadata?: object;
  }>;
  total_contacts: number;
  completed_calls: number;
  successful_calls: number;
  failed_calls: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}
```

## Error Handling

### Error Types

- `PollaxError` - Base error class
- `AuthenticationError` - Authentication failed (401)
- `NotFoundError` - Resource not found (404)
- `RateLimitError` - Rate limit exceeded (429)
- `ValidationError` - Validation failed (400)

### Example

```python
from pollax import Pollax, PollaxError, AuthenticationError

try:
    agent = client.agents.retrieve('agent_123')
except AuthenticationError:
    print('Invalid API key')
except PollaxError as e:
    print(f'Error: {e.message} (Status: {e.status_code})')
```

## Rate Limits

- **Default**: 10,000 requests per minute
- **Burst**: Up to 100 requests per second

When rate limited, the SDK automatically retries with exponential backoff.

## Pagination

List endpoints support pagination:

```python
agents = client.agents.list(skip=0, limit=100)
```

## Webhooks

See [Webhook Guide](./webhooks.md) for details on receiving real-time events.
