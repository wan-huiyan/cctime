# Contributing to cctime

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/dioptx/cctime.git
cd cctime
npm install
npm run build
npm test
```

## Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run type check: `npx tsc --noEmit`
6. Commit with a clear message
7. Open a pull request

## Code Style

- TypeScript strict mode
- ESM modules (`.js` extensions in imports)
- No external runtime dependencies beyond `chalk` and `commander`
- Tests use vitest

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Tests are co-located with source files (`*.test.ts`).

## Reporting Issues

- Use the [bug report template](https://github.com/dioptx/cctime/issues/new?template=bug_report.md)
- Include your Node.js version and OS
- Include the output of `cctime --version`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
