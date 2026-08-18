# GitHub Copilot Instructions

This repository is a DeepSeek Harness Web client plugin called `dsh-turn-nav`.

## Project rules

- The source of truth lives in `src/client/`.
- `lib/client.js` is the browser bundle and must stay in sync with `src/client/`.
- Do not edit DeepSeek Harness upstream source; the plugin mounts through the `conversation.composer.dock` slot.
- Keep the plugin loader id and style tag id as `dsh-turn-nav`.
- Update `README.md`, `README.zh.md`, and `CHANGELOG.md` when user-facing behavior changes.
- Do not commit `node_modules/`, `*.tgz`, `demo-frames/`, or `demo.gif`.
- Prefer Chinese replies when chatting with the maintainer; keep public docs bilingual.
