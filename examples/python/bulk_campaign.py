"""
Example: Bulk campaign with contact list

This example demonstrates:
- Creating a campaign with multiple contacts
- Starting the campaign
- Monitoring progress
- Getting campaign statistics
"""

import os
import time
from pollax import Pollax

client = Pollax(api_key=os.environ.get('POLLAX_API_KEY'))

# Create an agent for the campaign
print('Creating agent...')
agent = client.agents.create(
    name='Appointment Reminder Agent',
    system_prompt='''
    You are calling to remind customers about their upcoming appointment.
    
    - Be polite and brief
    - Confirm the appointment time
    - Ask if they need to reschedule
    - Thank them for their time
    ''',
    voice_id='shimmer',
    model='gpt-4',
)

print(f'✓ Agent created: {agent.id}')

# Create campaign with contacts
print('\nCreating campaign...')
contacts = [
    {
        'name': 'John Doe',
        'phone': '+1234567890',
        'metadata': {
            'appointment_time': '2:00 PM',
            'appointment_date': '2024-02-15',
            'doctor': 'Dr. Smith',
        }
    },
    {
        'name': 'Jane Smith',
        'phone': '+0987654321',
        'metadata': {
            'appointment_time': '3:30 PM',
            'appointment_date': '2024-02-15',
            'doctor': 'Dr. Jones',
        }
    },
    {
        'name': 'Bob Johnson',
        'phone': '+1122334455',
        'metadata': {
            'appointment_time': '4:15 PM',
            'appointment_date': '2024-02-15',
            'doctor': 'Dr. Brown',
        }
    },
]

campaign = client.campaigns.create(
    name='Tomorrow\'s Appointment Reminders',
    agent_id=agent.id,
    contacts=contacts,
)

print(f'✓ Campaign created: {campaign.id}')
print(f'  Total contacts: {campaign.total_contacts}')

# Start the campaign
print('\nStarting campaign...')
campaign = client.campaigns.start(campaign.id)
print(f'✓ Campaign started: {campaign.status}')

# Monitor progress
print('\nMonitoring campaign progress...')
while campaign.status in ['scheduled', 'running']:
    time.sleep(10)
    
    # Get updated campaign stats
    stats = client.campaigns.get_stats(campaign.id)
    campaign = client.campaigns.retrieve(campaign.id)
    
    completed = stats['completed_calls']
    total = stats['total_contacts']
    successful = stats['successful_calls']
    
    print(f'  Progress: {completed}/{total} calls completed')
    print(f'  Successful: {successful}')
    print(f'  Status: {campaign.status}')
    
    if completed >= total:
        break

# Final stats
print('\n' + '=' * 50)
print('Campaign Complete!')
print('=' * 50)
stats = client.campaigns.get_stats(campaign.id)
print(f'Total Contacts: {stats["total_contacts"]}')
print(f'Completed Calls: {stats["completed_calls"]}')
print(f'Successful Calls: {stats["successful_calls"]}')
print(f'Failed Calls: {stats["failed_calls"]}')
print(f'Success Rate: {stats["success_rate"]}')
