# 0013. Code-quality tooling

- Status: Accepted
- Date: 2026-10-29

## Context

Most code is written by AI agents and reviewed by one person. Checks that run the same way for
every agent, on every machine, catch mistakes before review and keep the code consistent.
Commits should stay fast, so not every check can run on each commit.

## Decision

- **TypeScript 6.x** (root devDependency). Strict options are shared in `tsconfig.base.json`;
  each app extends it. The server uses `NodeNext` and compiles with `tsc` to `apps/server/dist`.
  The web app uses `Bundler` resolution with `noEmit`, leaving output to Vite.
- **ESLint 10** with one root flat config (`eslint.config.js`): `@eslint/js` recommended and
  `typescript-eslint` recommended type-checked rules. `projectService` picks each file's nearest
  tsconfig. React lint plugins are added with React.
- **Prettier 3** formats every file (`.prettierrc.json`). `eslint-config-prettier` turns off
  ESLint rules that clash with it.
- **Vitest 5** runs tests from one root `vitest.config.js`, with one project per workspace. Tests
  sit next to code as `*.test.ts`. They are typechecked and linted, but `apps/server` builds with
  `tsconfig.build.json`, which leaves them out of `dist`.
- Root scripts (`build`, `typecheck`, `lint`, `format`, `test`) run across every workspace that
  has them.
- A **pre-commit hook** (husky 9 + lint-staged 17) runs `eslint --fix` and `prettier --write` on
  staged files. Typecheck and tests run in CI, not in the hook.
- Shared dev tools, including `@types/node` for root config files, are root devDependencies.
- Text files use LF line endings everywhere (`.gitattributes`).

## Consequences

- Type-checked lint rules catch unhandled promises and unsafe `any`, which agents often produce,
  at the cost of a slower lint run.
- Formatting is never a review topic.
- One test command for the whole repo; a workspace joins by adding a project to the root config.
- Commits stay fast, but a commit can still fail typecheck or tests; CI catches that before
  merge (ADR-0014).
- LF everywhere avoids line-ending diffs between Windows and other machines.
- The commands are listed under **Commands** in `AGENTS.md`.
