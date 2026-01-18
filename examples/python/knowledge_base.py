"""
Example: Knowledge base integration

This example demonstrates:
- Uploading documents to the knowledge base
- Creating an agent with knowledge base access
- Making calls with contextual information
- Searching the knowledge base
"""

import os
from pollax import Pollax

client = Pollax(api_key=os.environ.get('POLLAX_API_KEY'))

# Upload product documentation
print('Uploading knowledge base documents...')

# Upload from file
with open('product_manual.pdf', 'rb') as f:
    doc1 = client.knowledge.upload(
        name='Product Manual',
        file=f,
        doc_type='pdf',
    )
    print(f'✓ Uploaded: {doc1.name} ({doc1.id})')

# Upload from text
doc2 = client.knowledge.upload(
    name='FAQ',
    content='''
    Q: How do I reset my password?
    A: Click "Forgot Password" on the login page and follow the email instructions.
    
    Q: What is your return policy?
    A: We accept returns within 30 days of purchase with original receipt.
    
    Q: Do you offer international shipping?
    A: Yes, we ship to over 100 countries worldwide.
    
    Q: How long does shipping take?
    A: Standard shipping takes 5-7 business days. Express shipping is 2-3 days.
    ''',
    doc_type='txt',
)
print(f'✓ Uploaded: {doc2.name} ({doc2.id})')

# Upload from URL
doc3 = client.knowledge.upload(
    name='Company Website',
    url='https://example.com',
    doc_type='url',
)
print(f'✓ Uploaded: {doc3.name} ({doc3.id})')

# List all documents
print('\nKnowledge Base Documents:')
docs = client.knowledge.list()
for doc in docs:
    print(f'  - {doc.name} ({doc.type}) - Status: {doc.status}')

# Create an agent with knowledge base access
print('\nCreating agent with knowledge base...')
agent = client.agents.create(
    name='Product Support Agent',
    system_prompt='''
    You are a product support specialist.
    
    Use the knowledge base to answer customer questions accurately.
    If you don't know the answer, say so and offer to transfer to a human agent.
    
    Always be helpful, accurate, and professional.
    ''',
    voice_id='alloy',
    model='gpt-4',
)

print(f'✓ Agent created: {agent.id}')

# Search the knowledge base
print('\nSearching knowledge base...')
results = client.knowledge.search(
    query='What is the return policy?',
    limit=3,
)

print('\nSearch Results:')
for i, result in enumerate(results.get('results', []), 1):
    print(f'\n{i}. Score: {result["score"]:.2f}')
    print(f'   {result["content"][:200]}...')

# Make a call with the knowledge-enabled agent
print('\nInitiating call with knowledge-enabled agent...')
call = client.calls.create(
    agent_id=agent.id,
    to_number='+1234567890',
    metadata={
        'customer_question': 'return policy',
    },
)

print(f'✓ Call initiated: {call.call_sid}')
print('  Agent has access to uploaded knowledge base')

# Clean up (optional)
# client.knowledge.delete(doc1.id)
# client.knowledge.delete(doc2.id)
# client.knowledge.delete(doc3.id)
# client.agents.delete(agent.id)
