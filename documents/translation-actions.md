# Translation Actions

The repository has a translation workflow for Hugo multilingual content.

## Workflow Chain

```text
push to main
  -> Translate Content
  -> commit translated Markdown when source hashes changed
  -> Build and Deploy Hugo Blog
```

`Build and Deploy Hugo Blog` is triggered by `workflow_run` after `Translate Content`
finishes successfully. Manual deployment is still available through
`workflow_dispatch`.

Automatic translation commits use this subject:

```text
chore(post): update translated content
```

Workflows use this exact subject to avoid starting another translation/deployment
loop from the pushed translation commit.

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
