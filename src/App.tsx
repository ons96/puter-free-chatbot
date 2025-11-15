import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

function App() {
  const [messages, setMessages] = useState<Message[]>(() => JSON.parse(localStorage.getItem('chatHistory') || '[]'))
  const [input, setInput] = useState('')
  const [model, setModel] = useState('gpt-4o-mini') // Default; Puter fetches more
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages))
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim() || !window.puter) return
    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await window.puter.ai.chat(input, { model, stream: true })
      let assistantMsg: Message = { role: 'assistant', content: '', timestamp: Date.now() }
      setMessages(prev => [...prev, assistantMsg])

      for await (const chunk of response) {
        assistantMsg.content += chunk
        setMessages(prev => prev.map(m => m.timestamp === assistantMsg.timestamp ? { ...m, content: assistantMsg.content } : m))
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Check console.', timestamp: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  // Fetch models (Puter auto-provides)
  const [models, setModels] = useState<string[]>(['gpt-4o-mini', 'claude-3.5-sonnet', 'llama-3.1-405b'])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Puter Chat MVP</h1>
      <select value={model} onChange={e => setModel(e.target.value)} className="mb-4 p-2 bg-gray-800 rounded">
        {models.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <div className="border border-gray-700 rounded p-4 h-96 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className="inline-block bg-blue-600/20 p-2 rounded">{msg.role.toUpperCase()}: {new Date(msg.timestamp).toLocaleString()}</div>
            <p className="mt-1">{msg.content}</p>
          </div>
        ))}
        {loading && <div className="text-gray-500">AI typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2 bg-gray-800 rounded-l"
          placeholder="Type message..."
        />
        <button onClick={handleSend} disabled={loading} className="bg-blue-600 px-4 py-2 rounded-r">
          Send
        </button>
      </div>
    </div>
  )
}

export default App
