# API Contract Domain Axes

Hearing axes for tasks that involve API contract design, client integration, or server endpoint implementation.

## Axis 1: API Schema Source

The canonical source of API contracts (request/response shapes, endpoints, RPC methods).

**AskUserQuestion choices**:
- OpenAPI / Swagger specification (file in repository or hosted URL)
- Protobuf definitions (file in repository)
- GraphQL schema (SDL file or introspection endpoint)
- TypeScript or other code-first contract definitions in the repository
- No formal contract (ad-hoc JSON)
- Not applicable

**Follow-up (when not N/A)**: Record the path or URL. When multiple contracts exist (public API, internal services), list each with its purpose.

## Axis 2: Mock Environment

How clients exercise the API without depending on the live server.

**AskUserQuestion choices**:
- Generated mocks from the schema (e.g., from OpenAPI / Protobuf tooling)
- Hand-written mock server in the repository
- Hosted mock service (URL)
- Live development server (no separate mock)
- Not applicable

**Follow-up (when not N/A)**: Record the entry command or URL. Note whether the mock is updated automatically when the schema changes.

## Axis 3: Authentication Method

How the API authenticates and authorizes requests.

**AskUserQuestion choices**:
- Bearer token (e.g., JWT) issued by an auth service
- API key in a header or query parameter
- Session cookie set by a separate login flow
- Mutual TLS
- No authentication
- Not applicable

**Follow-up (when not N/A)**: Record where credentials are obtained for development and testing. Reference the secret store axis from `backend.md` if applicable.

## Axis 4: Schema Change Process (When Relevant)

How breaking and non-breaking schema changes are reviewed and rolled out.

**AskUserQuestion choices**:
- Documented contract review process (link to the document)
- Versioned endpoints (e.g., `/v1/`, `/v2/`)
- Backward-compatible changes only, no formal versioning
- Not applicable

**Follow-up (when not N/A)**: Record the document path or the version negotiation rule.

## Self-Declaration

After the structured axes, ask once: "Are there any other API external resources this work depends on that the structured questions did not cover?"

Examples that may surface only via self-declaration: rate-limit configuration, gateway / proxy in front of the API, contract test suite (e.g., Pact broker URL), API gateway management consoles, third-party API documentation that is not directly imported but consulted during design.
