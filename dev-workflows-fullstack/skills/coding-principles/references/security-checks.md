# Security Check Patterns

Last reviewed: 2026-09-22

## Stable Patterns

These patterns are reachable through direct source search and their shape does not change with the ecosystem.

### Hardcoded Secrets
- Credentials, API keys, or tokens assigned as string literals in source code
- Connection strings containing embedded passwords
- Private keys or certificates stored in source files
- Provider-specific token formats, which are recognizable by prefix rather than by variable name

### SQL String Concatenation
- SQL statements constructed through string concatenation or interpolation with variables, instead of parameterized data access

### Dynamic Code Execution
- Dynamic code execution functions (e.g., `eval`, `exec`) reached by non-static input
- Untrusted values flowing into a shell command string or its arguments
- Dynamic module loading with variable paths

### Insecure Deserialization
- Deserialization of untrusted input using unsafe loaders or formats that allow arbitrary object construction (e.g., native serialization, YAML without safe loader)
- Parsed data passed directly into dynamic code execution

### Untrusted Resource Targets
- File system paths constructed from user-supplied input without sanitization, including archive entry names and symlink targets
- Outbound requests whose destination host, port, or scheme is derived from user-supplied input, including values reached after a redirect (server-side request forgery)
- Both directions of this pattern let a caller select a resource the caller cannot reach directly

### Plaintext or Unverified Transport
- Credentials, tokens, or personal data sent over a non-TLS destination constructed or configured in source
- TLS certificate or hostname verification disabled in a client, agent, or transport configuration

### Credentialed Cross-Origin Exposure
- An attacker-controllable origin allowed to read an authenticated response, typically by reflecting the request origin without checking it against an allowlist while `Access-Control-Allow-Credentials` is enabled
- A wildcard origin is not this pattern: browsers reject `*` when credentials are included, and a reflected origin validated against an allowlist is the correct implementation

## Trend-Sensitive Patterns

Sources: OWASP Top 10:2025 (final, 2026-01); DryRun Agentic Coding Security Report (2026-03); CSA slopsquatting research note (2026-04); Shai-Hulud npm worm campaigns (2025-09 onward)

### Object-Level Authorization Gaps (OWASP A01:2025)
- Route handlers and resource operations reachable with no authentication or authorization check in the call chain
- Handlers that verify authentication but not the caller's right to the specific resource named in the request
- Identifiers taken from the request used to select a record without scoping the query to the caller's tenant or ownership
- Bulk, batch, export, and import operations whose authorization does not cover every target in the set
- Request-body fields that override the resource, owner, role, or scope the permission check assumed
- For the changed attack surface, verify each reachable resource access whose authorization behavior can change the security result

### Mishandling of Exceptional Conditions (OWASP A10:2025)
- Error handlers that expose internal system details (stack traces, database errors, file paths) in responses
- Error handlers that grant access, skip authentication, or bypass authorization when an exception occurs
- Missing error handling on security-critical operations (authentication, authorization, cryptographic operations)

### Dependency and Pipeline Integrity (OWASP A03:2025)
- Newly added dependencies that run install-time scripts (`preinstall`, `postinstall`, or the ecosystem equivalent)
- Installation paths that resolve versions at install time instead of from the committed lockfile

When the change includes pipeline definitions:

- Third-party pipeline actions referenced by a mutable tag or branch rather than an immutable revision
- Pipeline triggers that expose repository secrets or a writable token to code from an untrusted fork
- Interpolation of event-supplied values (titles, branch names, comment bodies) directly into pipeline shell steps
