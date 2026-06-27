#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const initManifest = args.has('--init-manifest');
const checkOnly = args.has('--check');

const configPath = getArgValue('--config') ?? 'translation/translate.config.json';
const providerEnvName = getArgValue('--provider-env') ?? 'LLM_TRANSLATE_CONFIG';

const config = await readJson(configPath);
const manifestPath = path.resolve(root, config.manifestPath);
const manifest = await readJsonIfExists(manifestPath, {
  version: 1,
  generatedBy: 'scripts/translate/translate.mjs',
  promptVersion: config.promptVersion,
  sources: {}
});

const baseLocale = config.baseLocale;
const baseLocaleConfig = config.locales[baseLocale];
if (!baseLocaleConfig) {
  throw new Error(`Missing base locale config for ${baseLocale}`);
}

const sourceRoot = path.resolve(root, baseLocaleConfig.contentDir);
const sourceFiles = await collectSourceFiles(sourceRoot, config.sourceGlobs, config.excludeGlobs);
const changedTargets = [];
const skippedTargets = [];
const failedTargets = [];
let providers;

for (const sourceFile of sourceFiles) {
  const relativePath = slash(path.relative(sourceRoot, sourceFile));
  const sourceContent = await fs.readFile(sourceFile, 'utf8');
  const sourceHash = contentHash(sourceContent, config.promptVersion);
  const sourceEntry = manifest.sources[relativePath] ?? { translations: {} };
  sourceEntry.sourceHash = sourceHash;
  sourceEntry.promptVersion = config.promptVersion;

  for (const targetLocale of config.targetLocales) {
    const targetLocaleConfig = config.locales[targetLocale];
    if (!targetLocaleConfig) {
      throw new Error(`Missing target locale config for ${targetLocale}`);
    }

    const targetFile = path.resolve(root, targetLocaleConfig.contentDir, relativePath);
    const targetExists = await exists(targetFile);
    const previous = sourceEntry.translations[targetLocale];

    if (initManifest) {
      sourceEntry.translations[targetLocale] = {
        sourceHash,
        status: targetExists ? 'current' : 'missing',
        updatedAt: new Date().toISOString()
      };
      continue;
    }

    const current = previous?.sourceHash === sourceHash && targetExists;
    if (current) {
      skippedTargets.push(`${targetLocale}:${relativePath}`);
      continue;
    }

    if (checkOnly) {
      changedTargets.push(`${targetLocale}:${relativePath}`);
      continue;
    }

    try {
      providers ??= loadProviders(providerEnvName);
      const translated = await translateWithFallback({
        providers,
        sourceContent,
        sourceLanguage: baseLocaleConfig.label,
        targetLanguage: targetLocaleConfig.label
      });
      const output = withNotice(
        translated.content,
        resolveNoticeTemplate(config.noticeTemplate, targetLocale),
        translated.provider.model
      );
      if (!dryRun) {
        await fs.mkdir(path.dirname(targetFile), { recursive: true });
        await fs.writeFile(targetFile, output, 'utf8');
      }
      sourceEntry.translations[targetLocale] = {
        sourceHash,
        status: 'current',
        provider: translated.provider.name,
        model: translated.provider.model,
        updatedAt: new Date().toISOString()
      };
      changedTargets.push(`${targetLocale}:${relativePath}`);
    } catch (error) {
      failedTargets.push(`${targetLocale}:${relativePath}: ${error.message}`);
      sourceEntry.translations[targetLocale] = {
        sourceHash: previous?.sourceHash,
        status: 'failed',
        error: error.message,
        updatedAt: new Date().toISOString()
      };
    }
  }

  manifest.sources[relativePath] = sourceEntry;
}

manifest.promptVersion = config.promptVersion;
manifest.updatedAt = new Date().toISOString();

if (!checkOnly && !dryRun) {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(sortManifest(manifest), null, 2)}\n`, 'utf8');
}

console.log(`translate: sources=${sourceFiles.length} changed=${changedTargets.length} skipped=${skippedTargets.length} failed=${failedTargets.length}`);
if (changedTargets.length > 0) {
  console.log('changed targets:');
  for (const item of changedTargets) console.log(`- ${item}`);
}
if (failedTargets.length > 0) {
  console.error('failed targets:');
  for (const item of failedTargets) console.error(`- ${item}`);
  process.exitCode = 1;
}

function getArgValue(name) {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

async function readJson(file) {
  const content = await fs.readFile(path.resolve(root, file), 'utf8');
  return JSON.parse(content);
}

async function readJsonIfExists(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function parseProviderConfig(envName) {
  const raw = process.env[envName];
  if (!raw) throw new Error(`Missing ${envName} secret`);
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.providers)) {
    throw new Error(`${envName} must contain a providers array`);
  }
  return parsed;
}

function loadProviders(envName) {
  const providerConfig = parseProviderConfig(envName);
  maskProviderSecrets(providerConfig);
  const loadedProviders = (providerConfig.providers ?? [])
    .filter((provider) => provider.enabled !== false)
    .sort((a, b) => Number(a.priority ?? 1000) - Number(b.priority ?? 1000));
  if (loadedProviders.length === 0) {
    throw new Error(`No enabled providers found in ${envName}`);
  }
  return loadedProviders;
}

function maskProviderSecrets(providerConfig) {
  for (const provider of providerConfig.providers ?? []) {
    for (const key of ['api_key', 'apiKey', 'token']) {
      if (provider[key]) console.log(`::add-mask::${provider[key]}`);
    }
  }
}

async function collectSourceFiles(sourceRoot, includeGlobs, excludeGlobs) {
  const allFiles = await walk(sourceRoot);
  return allFiles
    .filter((file) => file.endsWith('.md'))
    .filter((file) => matchesAny(slash(path.relative(sourceRoot, file)), includeGlobs))
    .filter((file) => !matchesAny(slash(path.relative(sourceRoot, file)), excludeGlobs ?? []))
    .sort();
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function matchesAny(file, globs) {
  return globs.some((glob) => globToRegExp(glob).test(file));
}

function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLE_STAR::/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function contentHash(content, promptVersion) {
  return `sha256:${createHash('sha256')
    .update(`promptVersion:${promptVersion}\n`)
    .update(normalizeNewlines(content))
    .digest('hex')}`;
}

async function translateWithFallback({ providers, sourceContent, sourceLanguage, targetLanguage }) {
  const errors = [];
  for (const provider of providers) {
    try {
      const content = await translate(provider, sourceContent, sourceLanguage, targetLanguage);
      return { content, provider };
    } catch (error) {
      errors.push(`${provider.name}: ${error.message}`);
      console.warn(`provider failed: ${provider.name}: ${error.message}`);
    }
  }
  throw new Error(`All providers failed: ${errors.join('; ')}`);
}

async function translate(provider, sourceContent, sourceLanguage, targetLanguage) {
  const type = provider.type ?? 'openai_compatible';
  if (type === 'gemini') {
    return translateGemini(provider, sourceContent, sourceLanguage, targetLanguage);
  }
  return translateOpenAICompatible(provider, sourceContent, sourceLanguage, targetLanguage);
}

async function translateOpenAICompatible(provider, sourceContent, sourceLanguage, targetLanguage) {
  const baseUrl = (provider.base_url ?? provider.baseUrl ?? 'https://api.openai.com/v1').replace(/\/$/, '');
  const response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${provider.api_key ?? provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: provider.temperature ?? 0.2,
      messages: [
        { role: 'system', content: config.prompt.system },
        { role: 'user', content: renderPrompt(sourceContent, sourceLanguage, targetLanguage) }
      ]
    })
  }, provider.timeout_ms ?? provider.timeoutMs ?? 120000);

  const json = await parseJsonResponse(response);
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('No translated content in chat completion response');
  return stripMarkdownFence(content.trim());
}

async function translateGemini(provider, sourceContent, sourceLanguage, targetLanguage) {
  const baseUrl = (provider.base_url ?? provider.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
  const apiKey = provider.api_key ?? provider.apiKey;
  const response = await fetchWithTimeout(`${baseUrl}/models/${provider.model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      generationConfig: {
        temperature: provider.temperature ?? 0.2
      },
      contents: [{
        role: 'user',
        parts: [{
          text: `${config.prompt.system}\n\n${renderPrompt(sourceContent, sourceLanguage, targetLanguage)}`
        }]
      }]
    })
  }, provider.timeout_ms ?? provider.timeoutMs ?? 120000);

  const json = await parseJsonResponse(response);
  const content = json.candidates?.[0]?.content?.parts?.map((part) => part.text).join('');
  if (!content) throw new Error('No translated content in Gemini response');
  return stripMarkdownFence(content.trim());
}

function renderPrompt(sourceContent, sourceLanguage, targetLanguage) {
  return config.prompt.user
    .replaceAll('{sourceLanguage}', sourceLanguage)
    .replaceAll('{targetLanguage}', targetLanguage)
    .replaceAll('{content}', sourceContent);
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  return JSON.parse(text);
}

function withNotice(content, template, model) {
  if (!template) return content;
  const notice = template.replaceAll('{model}', model);
  const normalized = normalizeNewlines(content).trimStart();
  if (normalized.includes(notice)) return normalized;
  const frontMatterMatch = normalized.match(/^---\n[\s\S]*?\n---\n?/);
  if (!frontMatterMatch) return `${notice}\n\n${normalized}`;
  const frontMatter = frontMatterMatch[0].trimEnd();
  const body = normalized.slice(frontMatterMatch[0].length).trimStart();
  const bodyWithoutOldNotice = body.replace(/^{{< notice >}}.*?(?:translated|翻譯|翻訳).*?{{< \/notice >}}\n\n/s, '');
  return `${frontMatter}\n\n${notice}\n\n${bodyWithoutOldNotice}`;
}

function resolveNoticeTemplate(templateConfig, targetLocale) {
  if (!templateConfig || typeof templateConfig === 'string') return templateConfig;
  return templateConfig[targetLocale] ?? templateConfig.default;
}

function stripMarkdownFence(content) {
  const match = content.match(/^```(?:markdown|md)?\n([\s\S]*?)\n```$/i);
  return match ? match[1].trim() : content;
}

function normalizeNewlines(content) {
  return content.replace(/\r\n/g, '\n');
}

function slash(value) {
  return value.split(path.sep).join('/');
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function sortManifest(value) {
  return {
    ...value,
    sources: Object.fromEntries(
      Object.entries(value.sources)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [
          key,
          {
            ...entry,
            translations: Object.fromEntries(Object.entries(entry.translations ?? {}).sort(([a], [b]) => a.localeCompare(b)))
          }
        ])
    )
  };
}
