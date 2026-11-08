# Working with Claude on this project

@AGENTS.md

## Collaboration

- Never remove TODO comments the user wrote (`//TODO: ...`), even when the code around them
  changes or the TODO looks done. Leave it and mention it instead.
- Don't commit unless asked. The repo is local only, with no remote.
- The user edits files in their editor while you work. Treat changes on disk as theirs and don't
  revert them. If one looks wrong, say so.
- After moving or renaming a file, check that the old path wasn't recreated by an editor tab that
  still has it open.
- `.env.local` holds the OMDb API key. Never print it or copy it into a committed file.
- When a request is ambiguous in a way that changes the work, ask before building.


## Definition of done

Run the `verify` skill before saying a change works. For anything visible, also run
`simulator-check`. In the report, say what was checked and what wasn't (rotation, Android, real
taps).

When a test is meant to catch a bug, prove it: break the fix, watch the test fail, restore it and
diff to confirm the restore.

## Conventions the tooling doesn't enforce

- Import order: external packages, blank line, `@/` imports sorted by path, blank line, relative
  imports. There is no sort plugin, so keep it by hand.
- Moving or renaming files: follow the `move-files` skill.
- Tests: see `.claude/rules/testing.md`.

## Gotchas

- Metro started with `CI=1` does not reload. Restart it after every edit, or the app runs old code.
- Jest may not apply React Compiler. Confirm compiler behaviour in the real bundle, fetched from
  the URL in the Expo manifest (it includes `transform.reactCompiler=true`).
- OMDb allows 1,000 requests a day, shared by everyone using the key. Keep live API checks small.
- IMDb IDs in `src/config/collections.ts` can't be checked by format. Verify changes against OMDb.
