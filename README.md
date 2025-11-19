# Puter Free AI API - Public Endpoints

This project exposes Puter's free AI models through a public API hosted on Vercel. Use these endpoints to integrate Puter's models into your own applications.

**Base URL:** `https://your-vercel-domain.vercel.app`

---

## Endpoints

### 1. Get Available Models

**Endpoint:** `GET /api/models`

**Description:** Returns the complete list of available models from Puter.

**Response:**
```json
{
  "models": [
    "gpt-4o",
    "gpt-4o-mini",
    "claude-sonnet-4-5",
    ...
  ]
}
```

**Example:**
```bash
curl https://your-vercel-domain.vercel.app/api/models
```

---

### 2. Get Models with Categories

**Endpoint:** `GET /api/models-details`

**Description:** Returns models organized by provider (OpenAI, Anthropic, Google, etc.)

**Response:**
```json
{
  "total": 450,
  "categorized": {
    "openai": ["gpt-4o", "gpt-4o-mini", "o1", ...],
    "anthropic": ["claude-sonnet-4-5", "claude-opus-4-1", ...],
    "google": ["gemini-2.0-flash-exp", ...],
    "meta": ["llama-3.3-70B-Instruct-Turbo", ...],
    "deepseek": ["deepseek-chat", ...],
    "mistral": ["mistral-large", ...],
    "xai": ["grok-beta", ...],
    "other": [...]
  },
  "raw": [...]
}
```

**Example:**
```bash
curl https://your-vercel-domain.vercel.app/api/models-details
```

---

### 3. Send Chat Message

**Endpoint:** `POST /api/chat`

**Description:** Send a message to Puter's AI and get a response. **No authentication required!**

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "model": "gpt-4o-mini"
}
```

**Parameters:**
- `message` (string, required): The message to send
- `model` (string, optional): Model to use (default: "gpt-4o-mini")

**Response:**
```json
{
  "id": "chatcmpl-xxx",
  "object": "text_completion",
  "created": 1699000000,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you for asking!"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}
```

**Example:**
```bash
curl -X POST https://your-vercel-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is 2+2?",
    "model": "gpt-4o-mini"
  }'
```

---

## Using This with AI Coding Tools

### GitHub Copilot Alternative (Local LLM Tools)

You can use these endpoints with tools like:
- **Ollama** - Set custom API endpoint
- **LM Studio** - Custom API
- **Continue.dev** - Custom provider
- **Cursor Editor** - Custom API
- **VSCode extensions** - Proxy through this API

**Example Configuration for Continue.dev:**
```json
{
  "models": [
    {
      "title": "Puter GPT-4o",
      "provider": "custom",
      "apiBase": "https://your-vercel-domain.vercel.app/api",
      "model": "gpt-4o"
    }
  ]
}
```

---

## CORS & Rate Limiting

- **CORS:** Enabled for all origins (`*`)
- **Rate Limiting:** None currently (but may add in future)
- **Authentication:** Optional (can add API key protection later)

---

## Authentication

**No API key required!** This API is completely free and public. You can call any endpoint without authentication.

If you want to add authentication later, you can update the endpoints to check for API keys.

---

## Limitations

- Puter's free tier has rate limits per user
- No built-in request caching (yet)
- All requests go through Puter's official API

---

## Integration Examples

### JavaScript/Node.js
```javascript
const response = await fetch('https://your-vercel-domain.vercel.app/api/models');
const models = await response.json();
console.log(models);
```

### Python
```python
import requests

response = requests.get('https://your-vercel-domain.vercel.app/api/models')
models = response.json()
print(models)
```

### cURL
```bash
curl https://your-vercel-domain.vercel.app/api/models
```

---

## Support

For issues with the API wrapper, check GitHub issues.
For issues with Puter itself, visit [puter.com](https://puter.com)
