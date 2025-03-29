# Contributing Guide

## Performance Standards

| Metric | Threshold | Measurement |
|--------|-----------|-------------|
| Frame Time | <16ms | `performance.now()` |
| Memory | <100MB | Chrome DevTools |
| Audio Drops | <5% | Built-in metrics |

## Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Run test suite:
   ```bash
   npm run validate      # Lint + Type check
   npm test             # Unit tests
   npm run test:perf    # Performance tests
   ```
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
5. Push and PR

## Analysis Tools

```bash
# Memory monitoring
npm run profile:memory

# CPU profiling
npm run profile:cpu

# Bundle analysis
npm run analyze
```

## PR Checklist

- [ ] Tests cover new functionalities
- [ ] Performance tests meet thresholds
- [ ] Documentation updated
- [ ] Changelog updated
