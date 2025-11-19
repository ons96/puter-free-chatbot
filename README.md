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

### 3. Send Chat Message (Coming Soon)

**Endpoint:** `POST /api/chat`

**Description:** Send a message to Puter's AI and get a response.

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "model": "gpt-4o-mini",
  "stream": false
}
```

**Parameters:**
- `message` (string, required): The message to send
- `model` (string, optional): Model to use (default: "gpt-4o-mini")
- `stream` (boolean, optional): Whether to stream the response (default: false)

**Response:**
```json
{
  "response": "I'm doing well, thank you for asking!",
  "model": "gpt-4o-mini",
  "tokens": 15
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

## Environment Variables (Optional)

If you want to add authentication, add to your Vercel project:

```
PUTER_API_KEY=your_key_here
```

Then update the API endpoints to check for authorization header.

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
