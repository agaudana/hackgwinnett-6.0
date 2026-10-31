# Shared Claude plugins

This repository keeps repo-local copies of the team’s active Claude plugins so teammates can clone the repo and load the same plugin packages without depending on a personal install.

## Load a plugin for a session

From the repo root:

```powershell
claude --plugin-dir .\.claude\plugins\superpowers
```

Or for all local plugins:

```powershell
claude --plugin-dir .\.claude\plugins\superpowers --plugin-dir .\.claude\plugins\frontend-design --plugin-dir .\.claude\plugins\figma
```

## Notes

- These are local copies of the user-installed Claude plugin caches.
- This is intended for team sharing in the repo.
- If a plugin is updated upstream, re-copy the version from `~/.claude/plugins/cache/claude-plugins-official/<plugin>/<version>` into the matching folder here.
