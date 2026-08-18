# Compound Engineering (vendored)

The `.claude/skills/ce-*` skills and `.claude/commands/triage-prs.md` in this
repo are a **vendored copy** of the
[EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)
Claude Code plugin.

## Why they're committed here

In the Claude Code CLI, the plugin is installed at the user level
(`~/.claude/plugins`) via `/plugin install compound-engineering`, so it's
available in every local session automatically.

Claude Code **on the web / in the Claude app** runs in an ephemeral cloud
container that starts from a fresh clone of this repository. It does **not**
have your machine's `~/.claude`, and the `/plugin` command isn't available in
cloud sessions. Only content committed under this repo's `.claude/` directory
(`skills/`, `commands/`, `agents/`) is picked up automatically.

Vendoring the skills into `.claude/skills/` is what makes `/ce-setup`,
`/ce-plan`, `/ce-work`, `/ce-code-review`, and the rest work in web/app
sessions as well as the CLI.

## What was vendored

- Source: `EveryInc/compound-engineering-plugin`
- Plugin version at time of vendoring: **3.22.4**
- `skills/*` → `.claude/skills/*` (33 `ce-*` skills, self-contained: each
  carries its own `SKILL.md`, `references/`, and `scripts/`)
- `.claude/commands/triage-prs.md` → `.claude/commands/triage-prs.md`

## Refreshing to a newer plugin version

Because this is a snapshot, it does not auto-update when the upstream plugin
releases a new version. To refresh:

```bash
git clone --depth 1 https://github.com/EveryInc/compound-engineering-plugin.git /tmp/ce-plugin
rm -rf .claude/skills
cp -R /tmp/ce-plugin/skills .claude/skills
cp /tmp/ce-plugin/.claude/commands/triage-prs.md .claude/commands/triage-prs.md
# commit the result
```

Keep the CLI plugin install and this vendored copy roughly in sync so behavior
matches between local and web sessions.
