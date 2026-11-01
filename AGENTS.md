# Agent notes

Read the versioned docs before writing code — most of this stack is on a recent major:
Vite 8, TypeScript 7 (native `tsc`), TanStack Router v1 / Query v5 / Table v9, Zod 4,
Tailwind 4, shadcn (radix-nova), Vitest 5, MSW 3, oxlint. Don't write their APIs from memory.

- Follow the import rules and conventions in README.md; `npm run lint` enforces most of them.
- Every backend call goes through `request(schema, config)` in `src/lib/api.ts`, from a
  feature's `api/` folder. Never call axios or fetch from a component.
- Add UI primitives with `npx shadcn@latest add <name>` (icons: Phosphor), don't hand-write them.
- Before finishing: `npm run typecheck && npm run lint && npm test` must pass.
