# Contributing to Pollax SDK

Thank you for your interest in contributing to the Pollax SDK! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/pollax-sdk.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit with clear messages: `git commit -m "Add feature X"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

### TypeScript/JavaScript

```bash
cd typescript
npm install
npm run dev  # Watch mode
npm run build  # Build
npm test  # Run tests
```

### Python

```bash
cd python
pip install -e ".[dev]"
pytest  # Run tests
black pollax  # Format code
mypy pollax  # Type checking
```

## Code Style

### TypeScript/JavaScript
- Follow existing code style
- Use TypeScript for type safety
- Write JSDoc comments for public APIs
- Run `npm run lint` before committing

### Python
- Follow PEP 8
- Use type hints
- Write docstrings for public APIs
- Run `black` and `mypy` before committing

## Testing

All contributions should include tests:

```typescript
// TypeScript
describe('Agents', () => {
  it('should create an agent', async () => {
    const agent = await pollax.agents.create({
      name: 'Test Agent',
      system_prompt: 'Test',
    });
    expect(agent).toBeDefined();
    expect(agent.name).toBe('Test Agent');
  });
});
```

```python
# Python
def test_create_agent():
    client = Pollax(api_key='test')
    agent = client.agents.create(
        name='Test Agent',
        system_prompt='Test',
    )
    assert agent.name == 'Test Agent'
```

## Pull Request Guidelines

1. **Title**: Use clear, descriptive titles
   - ✅ "Add support for voice cloning"
   - ❌ "Update code"

2. **Description**: Include:
   - What changed and why
   - Related issue numbers
   - Breaking changes (if any)
   - Testing done

3. **Code Quality**:
   - All tests pass
   - No linting errors
   - Documentation updated
   - Type-safe code

4. **Commits**:
   - Use clear commit messages
   - Keep commits focused
   - Reference issues when applicable

## Adding New Features

When adding new features:

1. **Add to both SDKs** (TypeScript and Python)
2. **Update types/models**
3. **Add tests**
4. **Update documentation**
5. **Add examples**

Example structure:

```typescript
// TypeScript: src/resources/new-feature.ts
export class NewFeature {
  constructor(private request: RequestFn) {}
  
  async create(params: CreateParams): Promise<Result> {
    return this.request({
      method: 'POST',
      url: '/api/v1/new-feature',
      data: params,
    });
  }
}
```

```python
# Python: pollax/resources/new_feature.py
class NewFeatureResource:
    def __init__(self, client):
        self._client = client
    
    def create(self, **params) -> Result:
        return self._client.request(
            'POST',
            '/api/v1/new-feature',
            json=params,
        )
```

## Reporting Issues

When reporting issues, include:

1. **SDK version**
2. **Language/runtime version**
3. **Operating system**
4. **Code to reproduce**
5. **Expected vs actual behavior**
6. **Error messages/stack traces**

## Feature Requests

For feature requests:

1. Check existing issues first
2. Describe the use case
3. Explain why it's useful
4. Provide examples if possible

## Documentation

Documentation improvements are always welcome:

- Fix typos
- Clarify confusing sections
- Add examples
- Improve code comments

## Questions?

- [Discord Community](https://discord.gg/pollax)
- Email: support@pollax.ai
- [GitHub Issues](https://github.com/pollax/pollax-sdk/issues)

## Code of Conduct

Be respectful, inclusive, and professional. We're all here to build great software together.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
