---
name: verify
description: Run this project's full check routine (typecheck, lint, tests repeated, bundles, expo-doctor) and report results honestly. Use before saying any code change is done.
---

Run each step, read the real exit code (`cmd; echo $?`, not after a pipe), and stop to fix
failures before moving on.

1. `npx tsc --noEmit`
2. `npx expo lint`
3. `npm test`, at least twice. Each run must exit 0 with no `not wrapped in act`, `torn down`,
   `failed to exit` or `did not exit` in the output. Wrap it in a time limit
   (`perl -e 'alarm 60; exec @ARGV' npm test`) so a hang shows up as a failure.
4. Bundles: `npx expo export --platform ios --platform android --output-dir <scratchpad>/export`.
   Write the output to the scratchpad, never into the repo.
5. `npx expo-doctor`, after any change to `app.json` or dependencies.
6. Stale references: grep for any file, function or path you renamed or removed, including in
   `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/` and `todo.md`.
7. Confirm user TODO comments are still present (`grep -rn TODO src`).

Report:

- Each check and its result, with test counts.
- What wasn't verified (for example: not run on the simulator, Android, real rotation).
- Anything that looked wrong but wasn't part of the task, without fixing it.

For UI changes, continue with the `simulator-check` skill.
