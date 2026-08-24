# Client Scripts

## Structure

| Path | Responsibility |
| --- | --- |
| `assets/ts/main.ts` | Main browser entry. |
| `assets/ts/core/pageInit.ts` | Registers page feature initializers. |
| `assets/ts/core/initOnce.ts` | Guards global one-time setup. |
| `assets/ts/features/*` | Page and component features. |
| `assets/ts/features/mermaid.ts` | Opt-in Mermaid loading and rendering. |
| `assets/ts/features/header.ts` | Header search expansion, mobile search navigation, and popover behavior. |
| `assets/ts/pageTransitions.ts` | Same-origin soft navigation. |
| `assets/ts/search.tsx` | Search UI, ranking, and client-side result pagination. |

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

The search script is page-scoped through `[data-search-page-form]`; the Header
search form deliberately uses a different selector because it only navigates
to the search page. The result shell starts hidden and distinguishes loading,
results, no matches, and index-loading failures. Keep those states intact when
changing result markup; an empty query must not reserve result or pagination
space.

Color-scheme choices are rendered in the Header and bound by
`assets/ts/colorScheme.ts`. Preserve the `StackColorScheme` storage key and the
`onColorSchemeChange` event because other features depend on them.

`assets/ts/smoothAnchors.ts` subtracts the sticky Header height from manual
anchor scrolling. Keep that offset consistent with the CSS scroll padding.

## Lazy Loading

Third-party or network-heavy features should load near viewport or on demand.
Current examples include comments, GitHub info cards, search data, and image
color extraction for tile cards.

Mermaid follows the same rule: the small feature code is bundled with the main
entry, but the Mermaid renderer is requested only when an enabled page contains
`.mermaid` nodes. The feature also listens for `onColorSchemeChange` so SVGs
can be regenerated after a theme switch.
