import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const MODELS = [
  'gpt-5-nano',
  'gpt-4o',
  'gpt-4o-mini',
  'claude-sonnet-4',
  'gemini-2.5-flash',
  'llama-3.3-70b',
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0]);
  const [tavilyKey, setTavilyKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse chat history:', e);
      }
    }

    const checkPuter = setInterval(() => {
      if (window.puter?.ai) {
        setPuterReady(true);
        console.log('Puter.js ready!');
        clearInterval(checkPuter);
      }
    }, 100);

    return () => clearInterval(checkPuter);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const webSearch = async (query: string): Promise<string> => {
    if (!tavilyKey) return 'Web search disabled (no Tavily API key)';
    
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          max_results: 3,
        }),
      });
      const data = await response.json();
      return data.results?.map((r: any) => `${r.title}: ${r.content}`).join('

') || 'No results';
    } catch (error) {
      console.error('Tavily search error:', error);
      return `Search error: ${error}`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !puterReady) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      console.log('Sending to model:', model);

      const tools = tavilyKey
        ? [
            {
              type: 'function',
              function: {
                name: 'web_search',
                description: 'Search the web for current information',
                parameters: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', description: 'Search query' },
                  },
                  required: ['query'],
                },
              },
            },
          ]
        : undefined;

      const response = await window.puter.ai.chat(userMessage.content, {
        model,
        stream: true,
        tools,
      });

      for await (const part of response) {
        if (part?.text) {
          assistantMessage.content += part.text;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMessage };
            return updated;
          });
        }

        if (part?.tool_calls) {
          for (const toolCall of part.tool_calls) {
            if (toolCall.function?.name === 'web_search') {
              const args = JSON.parse(toolCall.function.arguments);
              const searchResult = await webSearch(args.query);
              assistantMessage.content += `

[Search: ${args.query}]
${searchResult}`;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...assistantMessage };
                return updated;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      assistantMessage.content = `Error: ${error instanceof Error ? error.message : String(error)}`;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...assistantMessage };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Puter Free Chat MVP</h1>

        {!puterReady && (
          <div style={{ padding: '12px', background: '#ffa500', color: '#000', borderRadius: '8px', marginBottom: '16px' }}>
            Loading Puter.js...
          </div>
        )}

        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ padding: '8px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', flex: '1 1 300px' }}
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tavily API key (optional)"
            value={tavilyKey}
            onChange={(e) => setTavilyKey(e.target.value)}
            style={{ padding: '8px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', flex: '1 1 200px' }}
          />
        </div>

        <div style={{ height: '500px', overflowY: 'auto', background: '#1a1a1a', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          {messages.length === 0 && (
            <div style={{ color: '#666', textAlign: 'center', paddingTop: '100px' }}>
              Type "test" to start chatting with {model}
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: msg.role === 'user' ? 'rgba(59, 130, 246, 0.2)' : '#2a2a2a',
                textAlign: msg.role === 'user' ? 'right' : 'left',
              }}
            >
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                {msg.role === 'user' ? 'You' : model} · {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content || '...'}</div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={puterReady ? 'Type a message...' : 'Waiting for Puter...'}
            disabled={!puterReady || isLoading}
            style={{ flex: 1, padding: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px', fontSize: '16px' }}
          />
          <button
            onClick={handleSend}
            disabled={!puterReady || isLoading || !input.trim()}
            style={{
              padding: '12px 24px',
              background: isLoading ? '#555' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'wait' : 'pointer',
              fontSize: '16px',
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div style={{ marginTop: '16px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
          Powered by Puter.js · Free AI models · No backend
        </div>
      </div>
    </div>
  );
}

export default App;
