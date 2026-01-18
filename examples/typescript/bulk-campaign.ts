/**
 * Example: Bulk campaign with contact list
 * 
 * This example demonstrates:
 * - Creating a campaign with multiple contacts
 * - Starting the campaign
 * - Monitoring progress
 * - Getting campaign statistics
 */

import Pollax from '@pollax/sdk';

const pollax = new Pollax({
  apiKey: process.env.POLLAX_API_KEY || 'your-api-key-here',
});

async function main() {
  try {
    // Create an agent for the campaign
    console.log('Creating agent...');
    const agent = await pollax.agents.create({
      name: 'Appointment Reminder Agent',
      systemPrompt: `
        You are calling to remind customers about their upcoming appointment.
        
        - Be polite and brief
        - Confirm the appointment time
        - Ask if they need to reschedule
        - Thank them for their time
      `,
      voice_id: 'shimmer',
      model: 'gpt-4',
    });

    console.log(`✓ Agent created: ${agent.id}`);

    // Create campaign with contacts
    console.log('\nCreating campaign...');
    const contacts = [
      {
        name: 'John Doe',
        phone: '+1234567890',
        metadata: {
          appointment_time: '2:00 PM',
          appointment_date: '2024-02-15',
          doctor: 'Dr. Smith',
        },
      },
      {
        name: 'Jane Smith',
        phone: '+0987654321',
        metadata: {
          appointment_time: '3:30 PM',
          appointment_date: '2024-02-15',
          doctor: 'Dr. Jones',
        },
      },
      {
        name: 'Bob Johnson',
        phone: '+1122334455',
        metadata: {
          appointment_time: '4:15 PM',
          appointment_date: '2024-02-15',
          doctor: 'Dr. Brown',
        },
      },
    ];

    let campaign = await pollax.campaigns.create({
      name: 'Tomorrow\'s Appointment Reminders',
      agent_id: agent.id,
      contacts,
    });

    console.log(`✓ Campaign created: ${campaign.id}`);
    console.log(`  Total contacts: ${campaign.total_contacts}`);

    // Start the campaign
    console.log('\nStarting campaign...');
    campaign = await pollax.campaigns.start(campaign.id);
    console.log(`✓ Campaign started: ${campaign.status}`);

    // Monitor progress
    console.log('\nMonitoring campaign progress...');
    while (['scheduled', 'running'].includes(campaign.status)) {
      await sleep(10000);
      
      // Get updated campaign stats
      const stats = await pollax.campaigns.getStats(campaign.id);
      campaign = await pollax.campaigns.retrieve(campaign.id);
      
      const completed = stats.completed_calls;
      const total = stats.total_contacts;
      const successful = stats.successful_calls;
      
      console.log(`  Progress: ${completed}/${total} calls completed`);
      console.log(`  Successful: ${successful}`);
      console.log(`  Status: ${campaign.status}`);
      
      if (completed >= total) {
        break;
      }
    }

    // Final stats
    console.log('\n' + '='.repeat(50));
    console.log('Campaign Complete!');
    console.log('='.repeat(50));
    const finalStats = await pollax.campaigns.getStats(campaign.id);
    console.log(`Total Contacts: ${finalStats.total_contacts}`);
    console.log(`Completed Calls: ${finalStats.completed_calls}`);
    console.log(`Successful Calls: ${finalStats.successful_calls}`);
    console.log(`Failed Calls: ${finalStats.failed_calls}`);
    console.log(`Success Rate: ${finalStats.success_rate}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
