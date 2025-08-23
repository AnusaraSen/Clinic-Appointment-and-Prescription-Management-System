# Frontend

Global styling lives in `src/index.css` (Tailwind v4 + design tokens). The old scaffold `App.css` was removed because it only contained initial Vite demo styles and is no longer imported.

## Entry Points
- `index.html` bootstraps the app and sets the document title.
- `src/main.jsx` mounts the React app and imports global CSS once.
- `src/App.jsx` defines routes/layout. Avoid importing `index.css` again inside child components to prevent duplicate injection.

## Adding Styles
Use utility classes directly in JSX. For reusable patterns, create component-level classes in `index.css` or new component-specific CSS modules if they grow large. Prefer Tailwind utilities over custom CSS when possible.

## Tailwind Tokens
Design tokens (colors, radius, shadows) are defined via `@theme` block in `index.css` and mirrored in `tailwind.config.js` for IntelliSense.

## Development
Run the dev server from this directory:

```powershell
npm run dev
```

If you see class name warnings, ensure you have the latest Tailwind CSS IntelliSense extension and that it recognizes Tailwind v4.
