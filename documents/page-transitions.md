# Page Transitions

This site uses a small, dependency-free soft navigation layer for same-origin
page changes.

The goal is to keep Hugo as a static multi-page site while avoiding a full
browser reload for normal internal navigation.

## Why This Approach

Older static-site solutions usually used Ajax or PJAX.
The current implementation follows the newer browser direction:

- Navigation API when available
- View Transition API for page-change animation
- a click fallback for browsers without Navigation API
- ordinary browser navigation as the final fallback

No client-side framework or runtime router is required.

## Core Files

```text
themes/hugo-theme-stack/assets/ts/pageTransitions.ts
themes/hugo-theme-stack/assets/scss/partials/page-transitions.scss
themes/hugo-theme-stack/assets/ts/main.ts
themes/hugo-theme-stack/layouts/_default/baseof.html
themes/hugo-theme-stack/layouts/partials/head/style.html
```

The page shell is:

```html
<div class="container main-container ..." data-page-shell>
```

Soft navigation fetches the next page HTML, parses it, and replaces only this
shell. The global script remains loaded.

## Navigation Flow

For an internal same-origin page URL:

1. Save the current rendered page scroll position.
2. Fetch the target HTML.
3. Update selected head metadata.
4. Replace runtime background/style variables.
5. Replace `[data-page-shell]`.
6. Update history state when needed.
7. Restore scroll position or move to top.
8. Re-run page-level Stack initialization.
9. Replay page-level scripts that were inserted with the new shell.

External links, downloads, new-tab links, form submissions, and hash-only
navigation are not intercepted.

## Head Updates

`pageTransitions.ts` updates:

- document title
- meta description
- meta keywords
- canonical link
- Open Graph metadata
- Twitter metadata
- alternate links
- search JSON preload links

The runtime background/style blocks injected from `params.background` are marked
with:

```html
style data-stack-runtime-style
```

These styles are replaced during soft navigation so page rendering stays in sync
with the fetched document.

## Script Reinitialization

The global theme script is loaded once from `assets/ts/main.ts`.
After each soft navigation, `window.Stack.init()` is called again.

Several modules have duplicate-initialization guards because their target DOM is
replaced on each navigation:

- `menu.ts`
- `stickySidebar.ts`
- `smoothAnchors.ts`
- `scrollspy.ts`
- code block controls in `main.ts`
- search setup in `search.tsx`

Page-level inline scripts are replayed after shell replacement.
The global main/custom scripts are not replayed.

This matters for pages such as:

- search page
- archives page
- comments provider blocks

## View Transition Styling

The transition CSS lives in:

```text
themes/hugo-theme-stack/assets/scss/partials/page-transitions.scss
```

The site enables cross-document transitions:

```scss
@view-transition {
    navigation: auto;
}
```

The current animation keeps the old page snapshot in place and fades the new
page in. This avoids a short white flash that can happen when both old and new
root snapshots are semi-transparent at the same time.

The transition layer and the `html` element both receive the blog background
variables so the glassmorphism background does not fall through to the browser's
default white canvas.

## Scroll Restoration

Browser-managed scroll restoration is disabled:

```ts
window.history.scrollRestoration = 'manual';
```

The soft navigation layer stores positions per URL in `sessionStorage` under:

```text
StackPageScrollPositions
```

This is intentionally URL-keyed instead of relying only on `history.state`.
During browser back/forward traversal, the address bar can change before the old
DOM has been replaced. Saving by the actual rendered URL prevents the scroll
position from being written to the wrong page.

Behavior:

- normal internal link click: target page starts at the top, or at the hash target
- browser back/forward button: previous page restores its saved scroll position
- mouse side-button back/forward: same as browser back/forward

The current page's scroll position is saved:

- before a soft navigation fetch starts
- shortly after scroll events
- on `pagehide`

## Known Caveats

The search page uses a separately built script:

```text
themes/hugo-theme-stack/assets/ts/search.tsx
```

It must remain safe to execute after `load`, because entering the search page
through soft navigation will not fire the original page-load event again.

If adding a new page that depends on inline scripts or a page-specific bundle,
verify it through both:

1. direct full page load
2. same-origin soft navigation from another page

## Verification Checklist

After changing page navigation behavior:

1. Run:

```powershell
.\env\hugo\hugo.exe --gc --minify
```

2. Start preview:

```powershell
.\env\hugo\hugo.exe server --bind 127.0.0.1 --port 1313 --disableFastRender
```

3. Check normal internal link navigation.
4. Check browser back and forward buttons.
5. Check mouse side-button back and forward if available.
6. Scroll a page, open another page, then go back and confirm the original scroll position is restored.
7. From the top of a page, open another page, scroll there, then go back and confirm the original page stays at the top.
8. Check that page transitions do not flash white over the background image.
9. Check search, archives, article pages, category/tag pages, and at least one multilingual page.
