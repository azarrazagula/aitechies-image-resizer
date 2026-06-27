# Custom Rules for this Workspace

- **DO NOT** use the `browser_subagent` tool unless the user explicitly requests it. This helps prevent unnecessary token usage and keeps the interaction fast and efficient. Always rely on local code verification (e.g. `npx tsc --noEmit`) and user feedback for visual testing.
