# Using Claude Code with Gemini (Vertex AI) Proxy

This project is configured to use Claude Code via a local proxy that translates requests to Google Vertex AI.

## 1. Start the Proxy Server

Open a separate terminal and start the proxy server:

```powershell
cd C:\Users\lenovo\claude-code-proxy
uv run uvicorn server:app --host 0.0.0.0 --port 8082
```

## 2. Run Claude Code

In your working directory, set the base URL to point to the local proxy, then launch Claude Code:

```powershell
$env:ANTHROPIC_BASE_URL="http://localhost:8082"
claude
```

_(Tip: You can also use `claude -m sonnet` or `claude -m haiku` to explicitly pick a model tier)._

## Model Mappings

When the proxy is running, it intercepts requests and routes them to Vertex AI:

- **`haiku`** ➔ `gemini-3-flash-preview`
- **`sonnet` / `opus`** ➔ `gemini-3.1-pro-preview`
