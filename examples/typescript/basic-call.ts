/**
 * Example: Basic agent creation and call management
 * 
 * This example demonstrates:
 * - Creating an AI agent
 * - Making a voice call
 * - Monitoring call status
 * - Getting call transcript
 */

import Pollax from '@pollax/sdk';

const pollax = new Pollax({
  apiKey: process.env.POLLAX_API_KEY || 'your-api-key-here',
});

async function main() {
  try {
    // Create an agent
    console.log('Creating agent...');
    const agent = await pollax.agents.create({
      name: 'Customer Support Agent',
      systemPrompt: `
        You are a helpful customer support agent for Acme Corp.
        
        Your responsibilities:
        - Answer customer questions professionally
        - Help with order tracking
        - Process returns and refunds
        - Escalate complex issues to human agents
        
        Be friendly, concise, and helpful.
      `,
      voice_id: 'alloy',
      model: 'gpt-4',
      temperature: 0.7,
    });

    console.log(`✓ Agent created: ${agent.id}`);
    console.log(`  Name: ${agent.name}`);
    console.log(`  Model: ${agent.model}`);

    // Make a call
    console.log('\nInitiating call...');
    let call = await pollax.calls.create({
      agent_id: agent.id,
      to_number: '+1234567890', // Replace with actual number
      metadata: {
        customer_id: 'cust_12345',
        order_id: 'order_67890',
      },
    });

    console.log(`✓ Call initiated: ${call.call_sid}`);
    console.log(`  Status: ${call.status}`);
    console.log(`  To: ${call.to_number}`);

    // Monitor call status
    console.log('\nMonitoring call status...');
    while (['queued', 'ringing', 'in-progress'].includes(call.status)) {
      await sleep(5000);
      call = await pollax.calls.retrieve(call.call_sid);
      console.log(`  Status: ${call.status}`);
    }

    console.log(`\n✓ Call completed with status: ${call.status}`);

    // Get call transcript
    if (call.status === 'completed') {
      console.log('\nFetching transcript...');
      const transcript = await pollax.calls.getTranscript(call.call_sid);
      
      console.log('\nCall Transcript:');
      console.log('='.repeat(50));
      if (transcript.messages) {
        for (const msg of transcript.messages) {
          const role = msg.role || 'unknown';
          const content = msg.content || '';
          console.log(`${role.toUpperCase()}: ${content}`);
        }
      } else {
        console.log(transcript.transcript || 'No transcript available');
      }
      console.log('='.repeat(50));
    }

    // Get call details
    console.log('\nCall Summary:');
    console.log(`  Duration: ${call.duration} seconds`);
    console.log(`  Start: ${call.start_time}`);
    console.log(`  End: ${call.end_time}`);

    // Clean up (optional)
    // await pollax.agents.delete(agent.id);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
