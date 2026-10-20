# ZYRAXON AI — Open Source Model & Provider Directory

<div align="center">
  <p><strong>An open-source database of artificial intelligence models, provider endpoints, capabilities, and live pricing.</strong></p>
  <p>Developed by <strong>onelpawarai</strong> · Based in Bangladesh, operating globally.</p>
</div>

---

## 🌐 Ecosystem & Official Links

- **Website:** [zyraxonai.lovable.app](https://zyraxonai.lovable.app)
- **Cloud Agent:** [zyraxon-pro-x.lovable.app](https://zyraxon-pro-x.lovable.app)
- **Portfolio:** [onelpawarai.lovable.app](https://onelpawarai.lovable.app)
- **Access Codes:** [ZYRAXON Group](https://zyraxon-group-x.lovable.app)
- **YouTube:** [@ZYRAXONAI](https://www.youtube.com/@ZYRAXONAI)
- **Facebook:** [onelpawarai](https://www.facebook.com/onelpawarai)
- **Email:** [sayidilxs@gmail.com](mailto:sayidilxs@gmail.com)

---

## 🚀 About the Project

**ZYRAXON AI Model Directory** is a high-performance index and catalog tracking:
- **440+ AI models** with context limits, token pricing, reasoning, structured output, and benchmark scores.
- **220+ AI providers** with API specifications, SDK packages (`npm`), documentation, and supported model lists.
- **Labs and Research Teams** powering the next frontier of intelligence.

---

## ⚡ First-party provider: ZYRAXON

Alongside the upstream catalog, this directory ships **ZYRAXON**, our own
OpenAI-compatible inference provider. It appears in the Providers list pinned
to the top with a **First-party** badge, its ten models are searchable in the
Models list under the `ZYRAXON` lab, and the logo is our own mark.

| Model ID | Name | Context | Output | Input |
| --- | --- | --- | --- | --- |
| `zyraxon-apex` | ZYRAXON Apex | 1,048,576 | 131,072 | text · image · video · pdf |
| `zyraxon-matrix` | ZYRAXON Matrix | 1,048,576 | 131,072 | text · image |
| `zyraxon-pulse` | ZYRAXON Pulse | 262,144 | 262,144 | text |
| `zyraxon-titan` | ZYRAXON Titan | 1,000,000 | 512,000 | text · image · video |
| `zyraxon-neural` | ZYRAXON Neural | 200,000 | 32,000 | text |
| `zyraxon-codex` | ZYRAXON Codex | 200,000 | 32,000 | text · image |
| `zyraxon-visionary` | ZYRAXON Visionary | 200,000 | 32,000 | text · image · video · pdf |
| `zyraxon-cyber` | ZYRAXON Cyber | 200,000 | 32,000 | text · image · audio · video |
| `zyraxon-quantum` | ZYRAXON Quantum | 1,000,000 | 131,072 | text · image |
| `zyraxon-genesis` | ZYRAXON Genesis | 200,000 | 32,000 | text · image · audio · video |

- **API endpoint:** `https://zyraxonai.lovable.app/api/public/zyraxon/v1`
- **Documentation:** [Provider guide](https://zyraxonai.lovable.app/docs/provider-overview)
- **Model catalogue:** `https://zyraxonai.lovable.app/api/public/zyraxon/v1/models`
- **Environment variable:** `ZYRAXON_API_KEY`
- **SDK package:** `@ai-sdk/openai-compatible`

```js
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://zyraxonai.lovable.app/api/public/zyraxon/v1",
  apiKey: process.env.ZYRAXON_API_KEY,
});

const stream = await client.chat.completions.create({
  model: "zyraxon-codex",
  messages: [{ role: "user", content: "Build a landing page" }],
  stream: true,
});
```

### Where it lives

The provider is stored in `src/lib/catalog/zyraxon-provider.json` and merged
into `snapshot.json`, `public/api.json`, `public/providers.json` and
`public/models.json` by `scripts/sync-catalog.mjs`. The scheduled refresh only
reads upstream, so the sync script re-merges this file on every run — the
provider can never be dropped by a catalog refresh.

## 🤝 Contributing: How to Add a Provider or Model

We welcome community contributions from AI creators, labs, and hosting platforms! All valid pull requests that match our schema are automatically merged.

### 1. Adding a New Provider

To register a new inference provider, open `src/lib/catalog/snapshot.json` and add your provider configuration under the `"providers"` object:

```json
"your-provider-id": {
  "id": "your-provider-id",
  "name": "Your Provider Name",
  "doc": "https://docs.yourprovider.com",
  "api": "https://api.yourprovider.com/v1",
  "npm": "@ai-sdk/openai-compatible",
  "env": ["YOUR_PROVIDER_API_KEY"],
  "models": {
    "model-name": {
      "id": "model-name",
      "name": "Model Display Name",
      "cost": {
        "input": 0.5,
        "output": 1.5,
        "cache_read": 0.1
      }
    }
  }
}
