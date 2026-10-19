# Storage Templates

## Project Record

Path: `docs/project-context/external-resources.md`. Preserve existing resource labels referenced by feature documents. Include only resources actually needed; adapt grouping to the existing file.

```markdown
# External Resources

## [Stable resource label]
- Purpose: [decision or contract served]
- Location: [URL, path, package or service]
- Access method: [read operation, tool or command within existing authority]
- Evidence: [source and relevant version/date]
```

Keep credentials and secret values outside this record. Record an access limitation when it affects a consumer; a failed fetch does not establish that the resource is absent.

## Feature Reference

Use the consuming document's natural heading level for `External Resources Used`.

```markdown
## External Resources Used

| Project resource label | Feature-specific identifier | Use |
|---|---|---|
| [existing label] | [node, endpoint, module or version selector] | [decision or proof] |
```

Project entries own shared locations and access methods; feature rows own only the subset and identifiers used here.
