"""
Example: Basic agent creation and call management

This example demonstrates:
- Creating an AI agent
- Making a voice call
- Monitoring call status
- Getting call transcript
"""

import os
import time
from pollax import Pollax

# Initialize client
client = Pollax(api_key=os.environ.get('POLLAX_API_KEY', 'your-api-key-here'))

# Create an agent
print('Creating agent...')
agent = client.agents.create(
    name='Customer Support Agent',
    system_prompt='''
    You are a helpful customer support agent for Acme Corp.
    
    Your responsibilities:
    - Answer customer questions professionally
    - Help with order tracking
    - Process returns and refunds
    - Escalate complex issues to human agents
    
    Be friendly, concise, and helpful.
    ''',
    voice_id='alloy',
    model='gpt-4',
    temperature=0.7,
)

print(f'✓ Agent created: {agent.id}')
print(f'  Name: {agent.name}')
print(f'  Model: {agent.model}')

# Make a call
print('\nInitiating call...')
call = client.calls.create(
    agent_id=agent.id,
    to_number='+1234567890',  # Replace with actual number
    metadata={
        'customer_id': 'cust_12345',
        'order_id': 'order_67890',
    },
)

print(f'✓ Call initiated: {call.call_sid}')
print(f'  Status: {call.status}')
print(f'  To: {call.to_number}')

# Monitor call status
print('\nMonitoring call status...')
while call.status in ['queued', 'ringing', 'in-progress']:
    time.sleep(5)
    call = client.calls.retrieve(call.call_sid)
    print(f'  Status: {call.status}')

print(f'\n✓ Call completed with status: {call.status}')

# Get call transcript
if call.status == 'completed':
    print('\nFetching transcript...')
    transcript = client.calls.get_transcript(call.call_sid)
    
    print('\nCall Transcript:')
    print('=' * 50)
    if 'messages' in transcript:
        for msg in transcript['messages']:
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            print(f'{role.upper()}: {content}')
    else:
        print(transcript.get('transcript', 'No transcript available'))
    print('=' * 50)

# Get call details
print('\nCall Summary:')
print(f'  Duration: {call.duration} seconds')
print(f'  Start: {call.start_time}')
print(f'  End: {call.end_time}')

# Clean up (optional)
# client.agents.delete(agent.id)
