# Frontend (React/TypeScript) Criteria

Apply these with the SKILL.md criteria. Each entry adds what React and TypeScript code needs beyond them.

## Anti-patterns

- **Type assertions standing in for a guarantee**: `any` or `as` declares a type that no check or contract establishes. Back the declared type with a check or an existing contract at the boundary where that guarantee holds.
- **Pass-through prop chains that obscure state ownership**: Use composition, Context, or the project's state layer when intermediate components only forward values and a broader owner is clearer. Retain explicit props when they preserve local ownership and a broader owner would add coordination while responsibility remains local.
- **Components mixing independently changing responsibilities**: Split when rendering, state/data ownership, or reusable/testable behavior forms an independent responsibility. Retain a cohesive component when splitting would add avoidable prop/state synchronization.

## Error Handling Boundaries

- A rendering failure in a child component subtree, including a hook that throws during render, belongs to the project's Error Boundary.
- Event handlers, ordinary async callbacks, SSR, and hook/API operations outside rendering are handled at the owning event, hook, API, or server boundary through its error contract.
- Require design review when the same failure is caught at multiple component, hook, or API layers without one recovery owner, or when nested handlers obscure the visible UI state.

## Reuse and Commonalization

- Component patterns (form fields, cards, and similar) and custom hooks are commonalization candidates under the SKILL.md criteria.
- When judging whether similar functionality is a valid model, compare its props, lifecycle, state ownership, and design-system role along with repository usage.

## Performance and Granularity

- Prioritize readability unless the project's performance budget or a React DevTools Profiler comparison identifies a meaningful bottleneck in the affected interaction. Measure with React DevTools Profiler before optimizing.
- Design components that express UI patterns; overly detailed components and types reduce maintainability. Prefer composition over inheritance.

## Impact Analysis

- Discovery covers every reference to the changed component or hook, its imported functions, and its Props/State types.
- Understanding covers each caller's purpose, the component hierarchy, and the data flow Props → State → Event handlers → Callbacks.
- Concise notes are sufficient for an isolated component change with no shared contract, routing, state-ownership, or build/config impact.

## Quality Check Troubleshooting

- **Port already in use**: stop the stale dev, preview, or test process holding the port
- **Stale cache**: re-run with the project's fresh or clean-cache option
- **Dependency errors**: clean-reinstall dependencies
