# Frontend Criteria

Apply these with the SKILL.md criteria to user-facing UI code in any stack. Each entry adds what UI code needs beyond them.

## Anti-patterns

- **Pass-through prop chains that obscure state ownership**: Use composition, the framework's scoped context, or the project's state layer when intermediate components only forward values and a broader owner is clearer. Retain explicit props when they preserve local ownership and a broader owner would add coordination while responsibility remains local.
- **Components mixing independently changing responsibilities**: Split when rendering, state/data ownership, or reusable/testable behavior forms an independent responsibility. Retain a cohesive component when splitting would add avoidable prop/state synchronization.

## Error Handling Boundaries

- A failure while rendering a component subtree belongs to the project's render-error boundary when the framework provides one.
- Event handlers, ordinary async callbacks, server rendering, and data operations outside rendering are handled at the owning event, data, API, or server boundary through its error contract.

## Reuse and Commonalization

- Component patterns (form fields, cards, and similar) and shared UI logic are commonalization candidates under the SKILL.md criteria.
- When judging whether similar functionality is a valid model, compare its props, lifecycle, state ownership, and design-system role along with repository usage.

## Performance and Granularity

- Besides a profiler measurement, a project performance budget for the affected interaction justifies optimization.
- Design components that express UI patterns; overly fine-grained components and types reduce maintainability.

## Impact Analysis

- Discovery covers every reference to the changed component or shared UI logic, its imported functions, and its prop and state types.
- Understanding covers each caller's purpose, the component hierarchy, and the data flow from props through state to events and callbacks.
- Concise notes are sufficient for an isolated component change with no shared contract, routing, state-ownership, or build/config impact.
