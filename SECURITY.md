# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email: Open a private security advisory via [GitHub Security Advisories](https://github.com/dioptx/cctime/security/advisories/new)
3. Include a description of the vulnerability and steps to reproduce

## Scope

cctime reads local Claude Code session files (`~/.claude/projects/`). It does not:
- Make network requests
- Execute arbitrary code from session files
- Modify any files

The primary security concern is ensuring session data (which may contain sensitive prompts/responses) is not leaked.
