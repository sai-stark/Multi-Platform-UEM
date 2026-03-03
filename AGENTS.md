# Agent Instructions

This project has mandatory coding rules. **Before making any changes, read ALL rule files in `.agent/rules/`:**

- `.agent/rules/component-patterns.mdc` — architecture, state management, routing, error handling, i18n, performance
- `.agent/rules/design-system.mdc` — color tokens, typography, spacing, animation, component visual standards
- `.agent/rules/wcag-aa.mdc` — WCAG 2.2 AA accessibility requirements

## Key Non-Negotiables

- Never use `window.confirm()` or `confirm()` — always use Radix `AlertDialog` for destructive actions
- Never use hardcoded Tailwind color classes (`bg-blue-100`, `text-green-600`, etc.) — use design system tokens only
- All user-visible strings must be wrapped in `t()` from `useLanguage()`
- All `console.log` must be gated behind `import.meta.env.DEV`
- No component file exceeds 500 lines
- All API data fetching uses React Query (`useQuery`/`useMutation`), not raw `useEffect + useState`
- All destructive action buttons use `onClick` only (never `mousedown`/`touchstart`)
