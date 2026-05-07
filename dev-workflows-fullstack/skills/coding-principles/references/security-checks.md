# Security Check Patterns

Last reviewed: 2026-03-21

## Stable Patterns

These patterns have low false-positive rates and are detectable through grep or static analysis.

### Hardcoded Secrets
- Credentials, API keys, or tokens assigned as string literals in source code
- Connection strings containing embedded passwords
- Private keys or certificates stored in source files
- Detection approach: search for high-entropy strings near assignment operators, common key names (`password`, `secret`, `api_key`, `token`, `private_key`), and platform-specific token formats

### SQL String Concatenation
- SQL statements constructed through string concatenation or interpolation with variables
- Detection approach: search for SQL keywords (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) combined with string concatenation operators or string interpolation containing variable references

### Dynamic Code Execution
- Use of dynamic code execution functions (e.g., `eval`, `exec`) with non-static input
- Dynamic module loading with variable paths
- Detection approach: search for dynamic code execution or module loading calls where the argument is not a static literal

### Insecure Deserialization
- Deserialization of untrusted input using unsafe loaders or formats that allow arbitrary object construction (e.g., native serialization, YAML without safe loader)
- Parsed data passed directly into dynamic code execution
- Detection approach: search for deserialization calls that accept external input without safe loader or type-restricted configuration

### Path Traversal
- File system paths constructed from user-supplied input without sanitization
- Patterns where request parameters flow into file read/write operations
- Detection approach: search for file operations where path arguments include request parameters, query strings, or user input variables

### CORS Wildcard
- `Access-Control-Allow-Origin` set to `*` in production configuration
- CORS middleware configured with wildcard origin
- Detection approach: search for CORS configuration with wildcard values

### Non-TLS URLs
- HTTP (non-TLS) URLs embedded in source code for production endpoints (outside configuration files, tests, and documentation)
- Detection approach: search for `http://` patterns in source files, excluding localhost, configuration files, tests, and documentation

## Trend-Sensitive Patterns

Updated: 2026-03-21
Sources: OWASP Top 10:2025, DryRun Agentic Coding Security Report (2026-03)

### Access Control Gaps in AI-Generated Code
- Endpoints or route handlers defined without authentication middleware
- Resource access operations (read, update, delete) without authorization verification
- Administrative or destructive operations accessible without elevated permissions
- AI-generated code frequently omits authentication middleware and authorization checks — flag every route handler and resource access operation for explicit verification during review
- Detection approach: search for route/endpoint handler definitions that lack authentication middleware, and resource operations (read, update, delete) without authorization checks in the call chain

### Mishandling of Exceptional Conditions (OWASP A10:2025)
- Error handlers that expose internal system details (stack traces, database errors, file paths) in responses
- Error handlers that grant access, skip authentication, or bypass authorization when an exception occurs (fail-open behavior)
- Missing error handling on security-critical operations (authentication, authorization, cryptographic operations)
- Detection approach: search for catch/error handler blocks that return stack traces, database error messages, or file paths in responses; search for catch blocks that call next() or return success without re-validating security state

### Software Supply Chain Patterns (OWASP A03:2025)
- Dependencies imported without version pinning
- Use of deprecated or unmaintained packages for security-critical functions
- Detection approach: check dependency manifests for unpinned versions and known deprecated packages
