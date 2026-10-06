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
