# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in any One Mipham Corporation project, please **do not** open a public issue.

Report it privately to the security team. We will acknowledge within 48 hours and provide a resolution timeline.

## Security Standards

All One Mipham projects follow the security requirements defined in the corporate [CLAUDE.md](./CLAUDE.md) and [Organization Docs](https://github.com/One-Mipham/docs):

### Data Encryption
- **TLS 1.3** for all data in transit
- **AES-256-GCM** for data at rest

### Credential Management
- No hardcoded credentials in code, logs, or configuration files
- API keys resolved from environment variables only
- Credentials never stored in git history

### Dependency Security
- All third-party dependencies undergo license compliance checks
- No copyleft/GPL dependencies permitted
- Regular dependency vulnerability scanning

### AI Security
- Prompt injection testing for all user-facing AI features
- Adversarial attack red-team assessment
- Content safety filtering (NSFW, PII, copyright)
- Bias evaluation for model outputs

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest release | ✅ |
| Pre-release | 🔶 Best effort |
| EOL versions | ❌ |
