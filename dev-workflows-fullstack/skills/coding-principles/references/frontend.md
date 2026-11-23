# Frontend Coding Rules

Apply these with the SKILL.md principles to user-facing UI code in any stack. Each entry adds what UI code needs beyond them; the frontend decision criteria for component responsibility, error ownership, and profiling live in `references/frontend.md` of the ai-development-guide skill.

## Client Input Boundaries

Treat API responses, persisted client storage, and URL, route, or deep-link parameters as external input under the SKILL.md Input and Output Boundaries: handle their absent or malformed shapes, then parse and validate before converting to a domain type. External API types represent the actual external shape and convert at the application boundary.

## Type-System Escapes

Use an escape from the type system (an untyped or dynamic type, an unchecked cast, a forced unwrap) only where an existing external, generated, or legacy public signature requires it, or where removing it prevents the project type check from expressing a safe relationship. Record the declaration path or type-check result that proves the constraint. When a local adapter can preserve compatibility and expose a safer type within the user request or current task/design artifact, implement the adapter; otherwise confine the escape to the smallest adapter or public-signature boundary, document the reason, and validate untrusted data before it enters typed application code.

## Components and State

- Follow the project's adopted component architecture and file layout. Co-locate files only when it is established or approved as a new structure.
- Preserve the repository's existing local, shared, and server-state ownership boundaries. Introduce a shared-state layer or a server-state dependency only when the accepted design requires ownership or lifecycle that the existing boundary cannot represent.
- Keep one authoritative owner for each state value.
- Guard asynchronous results against stale or post-unmount updates through the repository's cancellation or server-state mechanism.

## Environment and Client Security

- Validate required client configuration through the repository's typed config layer; add a default only for an optional value or an explicitly defined local-development mode.
- Code and configuration delivered to clients are observable by their users, so credentials and secrets stay on the server.

## Performance and Compatibility

- Apply code splitting or import changes when a configured bundle or app-size budget regresses, or when the accepted task names size as an outcome and a repository size report attributes the relevant increase to the changed import. Follow the repository's existing loading pattern and verify the same signal after the change.
- Implement against the platform support policy in the PRD, Design Doc, or build configuration. When none is defined, preserve the repository's current compatibility baseline and surface any new platform-dependent API as an unresolved compatibility decision.
