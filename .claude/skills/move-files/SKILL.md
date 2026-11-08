---
name: move-files
description: Move, rename or regroup source files and folders in this project without breaking imports, docs or the user's open editor. Use for any restructuring of src/.
---

1. **Back up first:** `cp -R src <scratchpad>/src-before-<change>`. Nothing is committed, so
   this is the only way back.
2. **Check the target fits the structure in `AGENTS.md`:** one folder per screen, components and
   hooks used by one screen live inside it, and only real types go in `types/`. If the user asks
   for a new top-level folder, add it to the folder list in `AGENTS.md` and the README tree.
3. **Move with `mv`,** tests alongside their files.
4. **Update imports:** replace old `@/` paths across `src/`, and change relative imports that now
   cross folders to `@/` paths. Then re-sort each file's `@/` import block by path.
5. **Update docs:** grep the old path in `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/` and
   `todo.md`, and in code comments (for example the one in `src/services/omdbDto.ts`).
6. **Check for leftovers:** list the old folder. If an old file reappears, an editor tab probably
   saved it. Delete it only if it's identical to the moved file or nothing imports it, and tell
   the user to close that tab.
7. **Keep what the user changed:** don't undo edits that happened during the move, and keep
   their TODO comments.
8. **Run the `verify` skill.**

If a requested move would break something (for example, a barrel that loads React Navigation into
tests that mock it), say so and propose the alternative before moving.
