/**
 * Example: Analytics and reporting
 * 
 * This example demonstrates:
 * - Getting dashboard statistics
 * - Analyzing call volume
 * - Monitoring agent performance
 * - Exporting analytics data
 */

import Pollax from '@pollax/sdk';

const pollax = new Pollax({
  apiKey: process.env.POLLAX_API_KEY || 'your-api-key-here',
});

async function main() {
  try {
    // Get dashboard stats
    console.log('Dashboard Statistics');
    console.log('='.repeat(50));
    
    const stats = await pollax.analytics.getStats();
    
    console.log(`Total Calls: ${stats.total_calls}`);
    console.log(`Active Agents: ${stats.active_agents}`);
    console.log(`Success Rate: ${stats.success_rate}%`);
    console.log(`Average Duration: ${stats.avg_duration}`);
    
    console.log('\nCalls by Status:');
    Object.entries(stats.calls_by_status).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Get call volume over time
    console.log('\n' + '='.repeat(50));
    console.log('Call Volume (Last 7 Days)');
    console.log('='.repeat(50));
    
    const volume = await pollax.analytics.getCallVolume({ period: '7d' });
    
    if (volume.data) {
      volume.data.forEach(point => {
        const date = new Date(point.timestamp).toLocaleDateString();
        console.log(`${date}: ${point.count} calls`);
      });
    }

    // Get agent performance
    console.log('\n' + '='.repeat(50));
    console.log('Agent Performance');
    console.log('='.repeat(50));
    
    const agents = await pollax.agents.list({ is_active: true });
    
    for (const agent of agents) {
      console.log(`\nAgent: ${agent.name} (${agent.id})`);
      
      try {
        const performance = await pollax.analytics.getAgentPerformance(agent.id);
        console.log(`  Total Calls: ${performance.total_calls}`);
        console.log(`  Success Rate: ${performance.success_rate}%`);
        console.log(`  Avg Duration: ${performance.avg_duration}`);
        console.log(`  Total Minutes: ${performance.total_minutes}`);
      } catch (error) {
        console.log(`  No performance data available`);
      }
    }

    // Export analytics data
    console.log('\n' + '='.repeat(50));
    console.log('Exporting Analytics Data');
    console.log('='.repeat(50));
    
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';
    
    console.log(`\nExporting data from ${startDate} to ${endDate}...`);
    
    const csvData = await pollax.analytics.export({
      start_date: startDate,
      end_date: endDate,
      format: 'csv',
    });
    
    console.log('✓ Data exported successfully');
    console.log(`  Format: CSV`);
    
    // Get recent calls
    console.log('\n' + '='.repeat(50));
    console.log('Recent Calls');
    console.log('='.repeat(50));
    
    const recentCalls = await pollax.calls.list({ limit: 5 });
    
    for (const call of recentCalls) {
      console.log(`\n${call.call_sid}`);
      console.log(`  Agent: ${call.agent_name || call.agent_id}`);
      console.log(`  To: ${call.to_number}`);
      console.log(`  Status: ${call.status}`);
      console.log(`  Duration: ${call.duration || 0}s`);
      console.log(`  Created: ${new Date(call.created_at).toLocaleString()}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
