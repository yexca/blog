# Client Scripts

## Structure

| Path | Responsibility |
| --- | --- |
| `assets/ts/main.ts` | Main browser entry. |
| `assets/ts/core/pageInit.ts` | Registers page feature initializers. |
| `assets/ts/core/initOnce.ts` | Guards global one-time setup. |
| `assets/ts/features/*` | Page and component features. |
| `assets/ts/features/mermaid.ts` | Opt-in Mermaid loading and rendering. |
| `assets/ts/pageTransitions.ts` | Same-origin soft navigation. |
| `assets/ts/search.tsx` | Search UI. |

## Feature Pattern

Feature modules should expose a setup function that accepts an optional root:

```ts
setupFeature(root?: ParentNode): void
```

Use selectors to decide whether work is needed. Store readiness flags on
elements when repeated initialization would duplicate listeners or DOM.

## Soft Navigation Requirements

Because page content can be replaced without a full reload:

- Do not rely only on `DOMContentLoaded`.
- Re-run page features through `pageInit.ts`.
- Avoid global state that assumes only one page render.
- Cleanly tolerate missing containers.
- Recompute selectors inside the provided root.

## Lazy Loading

Third-party or network-heavy features should load near viewport or on demand.
Current examples include comments, GitHub info cards, search data, and image
color extraction for tile cards.

Mermaid follows the same rule: the small feature code is bundled with the main
entry, but the Mermaid renderer is requested only when an enabled page contains
`.mermaid` nodes. The feature also listens for `onColorSchemeChange` so SVGs
can be regenerated after a theme switch.
