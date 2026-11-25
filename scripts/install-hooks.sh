#!/bin/sh
set -eu
git config --local hook.crivo-biome.command 'pnpm exec lint-staged'
git config --local hook.crivo-biome.event pre-commit
git config --local hook.crivo-message.command 'pnpm exec commitlint --edit'
git config --local hook.crivo-message.event commit-msg
