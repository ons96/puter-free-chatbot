import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// Web Search Tool (Free Tavily Integration)
async function webSearch(query: string, apiKey?: string): Promise<string> {
  if (!apiKey) return 'Web search unavailable (add TAVILY_API_KEY).';
  try {
    const res = await fetch(`https://api.tavily.com/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&search_depth=3`);
    const data = await res.json();
    return data.results.map((r: any) => `${r.content} [Source: ${r.url}]`).join('\n');
  } catch {
    return 'Search failed—try again.';
  }
}

// Tool Definition for Model Invocation
const tools = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for up-to-date info when needed.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query']
      }
    }
  }
];

function App() {
  const [messages, setMessages] = useState<Message[]>(() => JSON.parse(localStorage.getItem('chatHistory') || '[]'))
  const [input, setInput] = useState('')
  const [model, setModel] = useState('openrouter/anthropic/claude-3.5-sonnet') // Paid model default
  const [loading, setLoading] = useState(false)
  const [tavilyKey, setTavilyKey] = useState('') // Add your key here or via env
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages))
    scrollToBottom()
    // Set Tavily key (paste once; persists)
    if (!tavilyKey) setTavilyKey(localStorage.getItem('tavily_key') || '')
  }, [messages, tavilyKey])

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }

  const handleSend = async () => {
    if (!input.trim() || !window.puter) return
    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Save key if entered
      if (tavilyKey) localStorage.setItem('tavily_key', tavilyKey)

      const response = await window.puter.ai.chat(input, { 
        model, 
        stream: true,
        tools: input.includes('search') ? tools : undefined // Invoke on search prompts
      })

      let assistantMsg: Message = { role: 'assistant', content: '', timestamp: Date.now() }
      setMessages(prev => [...prev, assistantMsg])

      for await (const chunk of response) {
        // Handle tool calls (simplified: If tool invoked, run search)
        if (chunk.tool_calls?.length && chunk.tool_calls[0].function.name === 'web_search') {
          const toolQuery = chunk.tool_calls[0].function.arguments.query
          const searchResult = await webSearch(toolQuery, tavilyKey)
          // Feed back to model (Puter handles chaining)
          const followUp = await window.puter.ai.chat(`Search results: ${searchResult}. Now respond to original query.`, { model })
          assistantMsg.content += followUp.choices[0].message.content
        } else {
          assistantMsg.content += chunk.content || ''
        }
        setMessages(prev => prev.map(m => m.timestamp === assistantMsg.timestamp ? { ...m, content: assistantMsg.content } : m))
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}. Limits? Try lighter use.`, timestamp: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  const models = ['openrouter/openai/gpt-4o', 'openrouter/anthropic/claude-3.5-sonnet', 'openrouter/meta-llama/llama-3.1-405b', 'openrouter/mistralai/mixtral-8x22b'] // Paid ones

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Puter Paid Chat MVP</h1>
      <input
        type="text"
        placeholder="Paste Tavily key for web search (optional)"
        value={tavilyKey}
        onChange={e => setTavilyKey(e.target.value)}
        className="w-full p-2 bg-gray-800 rounded mb-2"
      />
      <select value={model} onChange={e => setModel(e.target.value)} className="mb-4 p-2 bg-gray-800 rounded w-full">
        {models.map(m => <option key={m} value={m}>{m.replace('openrouter/', '')}</option>)}
      </select>
      <div className="border border-gray-700 rounded p-4 h-96 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-600/20 text-right' : 'bg-gray-800'}`}>
            <div className="text-xs opacity-70">{msg.role.toUpperCase()}: {new Date(msg.timestamp).toLocaleString()}</div>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <div className="text-gray-500">AI thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2 bg-gray-800 rounded-l"
          placeholder="Type message (e.g., 'Search latest AI news')..."
        />
        <button onClick={handleSend} disabled={loading} className="bg-blue-600 px-4 py-2 rounded-r">
          Send
        </button>
      </div>
    </div>
  )
}

export default App
