# Backend Domain Axes

Hearing axes for tasks that involve server-side, data, or storage work.

## Axis 1: Database Schema Source

The canonical source of the database schema (tables, columns, indexes, constraints).

**AskUserQuestion choices**:
- Migration files in the repository (e.g., a `migrations/` directory)
- Schema file in the repository (e.g., `schema.sql`, `prisma/schema.prisma`)
- Database MCP that introspects a live database
- External schema registry (URL or hosted catalog)
- No persistent database
- Not applicable

**Follow-up (when not N/A)**: Record the path, MCP name, or URL. If multiple databases exist (primary, analytics, cache), list each.

## Axis 2: Migration History

How schema changes are tracked over time.

**AskUserQuestion choices**:
- Versioned migration files in the repository
- ORM-managed migration tool (e.g., Alembic, Flyway, Prisma Migrate)
- Manual change log document
- No migration tracking
- Not applicable

**Follow-up (when not N/A)**: Record the directory path or tool entry command. Note whether migrations are applied automatically on deploy or manually.

## Axis 3: Secret Store

Where credentials, API keys, and other secrets are stored and accessed.

**AskUserQuestion choices**:
- Secret manager service (e.g., AWS Secrets Manager, Vault, GCP Secret Manager)
- Environment variables loaded from a `.env` file (development only)
- Encrypted file in the repository
- No secrets required
- Not applicable

**Follow-up (when not N/A)**: Record the access mechanism. Examples — service name, MCP name, retrieval command. Do NOT record actual secret values; record only how they are reached.

## Axis 4: Background Job Infrastructure (When Relevant)

How asynchronous work is dispatched and observed.

**AskUserQuestion choices**:
- Queue service (e.g., SQS, Pub/Sub, RabbitMQ)
- Cron / scheduled tasks managed by deployment platform
- In-process worker thread
- No background work
- Not applicable

**Follow-up (when not N/A)**: Record the queue or scheduler name and how to enqueue / inspect jobs.

## Self-Declaration

After the structured axes, ask once: "Are there any other backend external resources this work depends on that the structured questions did not cover?"

Examples that may surface only via self-declaration: third-party SaaS APIs (payment, email, search index), distributed cache services (Redis, Memcached), object storage (S3, GCS), feature flag services consumed server-side, observability platforms (logs, traces, metrics).
