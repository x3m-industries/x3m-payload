# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please follow these steps:

1. **Do NOT open a public issue.** Security vulnerabilities should be reported privately.

2. **Email us directly** at **security@x3m.industries** with:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Any suggested fixes (if applicable)

3. **Allow time for a response.** We aim to respond to security reports within **48 hours** and will work with you to understand and address the issue.

4. **Coordinated disclosure.** We request that you do not publicly disclose the vulnerability until we have had a chance to address it and release a fix.

## What to Expect

- **Acknowledgment:** You will receive an acknowledgment of your report within 48 hours.
- **Updates:** We will keep you informed about our progress in addressing the vulnerability.
- **Credit:** We are happy to credit you for the discovery once the vulnerability has been patched (unless you prefer to remain anonymous).

## Security Best Practices

This project follows security best practices:

- **OIDC for npm Publishing:** We use npm Trusted Publishers with OIDC authentication (no long-lived tokens)
- **Dependency Management:** Regular dependency updates via Dependabot
- **Type Safety:** Strict TypeScript configuration to prevent common vulnerabilities
- **Input Validation:** All user inputs are validated and sanitized

---

Thank you for helping keep **@x3m-industries/payload** secure!
