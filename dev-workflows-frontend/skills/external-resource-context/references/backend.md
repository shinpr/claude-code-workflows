# Backend Domain Axes

Hearing axes for tasks that involve server-side, data, or storage work.

## Axis 1: Database Schema Source

The canonical source of the database schema (tables, columns, indexes, constraints).

**Question choices**:
- Migration files in the repository (e.g., a `migrations/` directory)
- Schema file in the repository (e.g., `schema.sql`, `prisma/schema.prisma`)
- Database MCP that introspects a live database
- External schema registry (URL or hosted catalog)
- No persistent database
- Not applicable

**Follow-up (when not N/A)**: Record the path, MCP name, or URL. If multiple databases exist (primary, analytics, cache), list each.

## Axis 2: Migration History

How schema changes are tracked over time.

**Question choices**:
- Versioned migration files in the repository
- ORM-managed migration tool (e.g., Alembic, Flyway, Prisma Migrate)
- Manual change log document
- No migration tracking
- Not applicable

**Follow-up (when not N/A)**: Record the directory path or tool entry command. Note whether migrations are applied automatically on deploy or manually.

## Axis 3: Secret Store

Where credentials, API keys, and other secrets are stored and accessed.

**Question choices**:
- Secret manager service (e.g., AWS Secrets Manager, Vault, GCP Secret Manager)
- Environment variables loaded from a `.env` file (development only)
- Encrypted file in the repository
- No secrets required
- Not applicable

**Follow-up (when not N/A)**: Record the access mechanism. Examples — service name, MCP name, retrieval command. Do NOT record actual secret values; record only how they are reached.

## Axis 4: Background Job Infrastructure (When Relevant)

How asynchronous work is dispatched and observed.

**Question choices**:
- Queue service (e.g., SQS, Pub/Sub, RabbitMQ)
- Cron / scheduled tasks managed by deployment platform
- In-process worker thread
- No background work
- Not applicable

**Follow-up (when not N/A)**: Record the queue or scheduler name and how to enqueue / inspect jobs.

## Domain Completion

After these axes, return to the parent skill. The parent asks one integrated self-declaration question after all selected domains are complete. Backend-specific resources such as third-party services, distributed caches, object storage, feature flags, or observability platforms can be captured in that answer.
