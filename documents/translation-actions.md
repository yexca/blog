# Translation Actions

The repository has a translation workflow for Hugo multilingual content.

## Workflow Chain

```text
push to main
  -> Translate Content
  -> commit translated Markdown when source hashes changed
  -> Translate Content success
  -> Build and Deploy Hugo Blog
```

`Build and Deploy Hugo Blog` runs on normal pushes unless the pushed files are
translation inputs. In that case it waits for `Translate Content` to finish
successfully, then deploys the latest `main` commit. Manual deployment is still
available through `workflow_dispatch`.

Automatic translation commits use this subject:

```text
chore(post): update translated content
```

Workflows use this exact subject to avoid starting another translation/deployment
loop from the pushed translation commit.

The translation workflow commits back to this repository with the default
`GITHUB_TOKEN` and `contents: write` permission. `PERSONAL_TOKEN` is only needed
by the deployment workflow when publishing to the external `yexca/blog-web`
repository.

The deployment workflow uses a lightweight decision job. It skips pushes that
change translation inputs, such as `content/zh-cn/posts/**`,
`translation/translate.config.json`, `scripts/translate/**`, or the translation
workflow itself. Other pushes, such as theme, style, Hugo config, or static
assets, deploy immediately. Translated commits pushed with `GITHUB_TOKEN` do not
start push workflows, so deployment after translation is driven by
`workflow_run`.

## Files

- `.github/workflows/translate.yml`
  Runs the translation script and commits translated content.
- `.github/workflows/deploy.yml`
  Builds Hugo and publishes `public/` to `yexca/blog-web`.
- `translation/translate.config.json`
  Public translation rules: language directories, target locales, prompts, and
  manifest path.
- `translation/translation-manifest.json`
  Hash baseline for source posts and target translations.
- `scripts/translate/translate.mjs`
  Translation runner with provider fallback.

## Secret

Create a GitHub Actions secret named:

```text
LLM_TRANSLATE_CONFIG
```

Example:

```json
{
  "providers": [
    {
      "name": "openai-main",
      "type": "openai",
      "base_url": "https://api.openai.com/v1",
      "api_key": "sk-xxx",
      "model": "gpt-4.1-mini",
      "priority": 10,
      "enabled": true
    },
    {
      "name": "gemini-fallback",
      "type": "gemini",
      "base_url": "https://generativelanguage.googleapis.com/v1beta",
      "api_key": "xxx",
      "model": "gemini-2.5-flash",
      "priority": 20,
      "enabled": true
    },
    {
      "name": "deepseek-fallback",
      "type": "openai_compatible",
      "base_url": "https://api.deepseek.com/v1",
      "api_key": "xxx",
      "model": "deepseek-chat",
      "priority": 30,
      "enabled": true
    }
  ]
}
```

Lower `priority` numbers run first. If one provider fails, the script tries the
next enabled provider.

Supported provider types:

- `openai`
- `openai_compatible`
- `deepseek`
- `gemini`

`openai`, `openai_compatible`, and `deepseek` use the OpenAI-compatible
`/chat/completions` API.

## Local Checks

Create or refresh the current baseline:

```bash
node scripts/translate/translate.mjs --init-manifest
```

Check whether any target translations are stale:

```bash
node scripts/translate/translate.mjs --check
```

Run translation locally with the same secret JSON:

```bash
LLM_TRANSLATE_CONFIG="$(cat private-llm-config.json)" node scripts/translate/translate.mjs
```
