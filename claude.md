# claude.md

Local AI memory for `.`.

## Links

- Peer memory: `./codex.md`
- App spec: `./app_spec.txt`
- Progress: `./progress.md`
- Task plan: `./.codex-run/tasks.md`
- Semantic index: `./.codex-index/codebase-index.json`

## Folder Role

Project root. Owns global specification, task plan, progress, and workspace-level AI memory.

## Working Rules

- Read the peer memory file when starting in this folder so Codex and Claude share the same local context.
- Keep NestJS source roots flat: `src/main.ts` and `src/app.module.ts` stay at the source root; feature code belongs in `src/modules/<domain>`.
- Prefer TypeScript, NestJS, GraphQL, Next.js, Tailwind CSS, Material Design 3, Material Design 3 Expressive, Google-style UX, and atomic design unless the app spec chooses another stack.
- Update `progress.md` or `codex-progress.md` only when the coordinator owns the progress update.
