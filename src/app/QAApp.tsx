'use client'

import { useState, useEffect, useRef } from 'react'

const Message = ({ content, isUser }) => {
  return (
    <li className={`relative max-w-[80%] p-4 my-4 rounded-2xl 
      ${isUser ? 
        'ml-auto bg-blue-600 text-white' : 
        'mr-auto bg-gray-200 text-gray-800 font-semibold'
      }`}>
      <div className={`absolute top-1/2 -translate-y-1/2
        ${isUser ?
          '-right-2 border-l-[10px] border-l-blue-600' :
          '-left-2 border-r-[10px] border-r-gray-200'
        } border-y-[10px] border-y-transparent`}>
      </div>
      {content}
    </li>
  )
}

export default function QAApp() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef(null)
  const inputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return

    const question = inputRef.current.value.trim()
    if (!question) return

    setMessages(prev => [...prev, { content: question, isUser: true }])
    setIsLoading(true)
    setError('')

    try {
      const answer = await fetchAnswer(question)
      setMessages(prev => [...prev, { content: answer, isUser: false }])
    } catch (error) {
      setError('エラーが発生しました。もう一度お試しください。')
      console.error('Error:', error)
    }

    formRef.current.reset()
    setIsLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const fetchAnswer = async (question) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-pro-exp-02-05:free',

        messages: [
          {"role": "system",
           "content": "あなたはONE PIECEのルフィです。"},
          {
            role: 'user',
            content: question
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    console.log(data);
    return data.choices[0].message.content;
  }

  return (
    <div className="container max-w-3xl mx-auto p-5">
      <ul className="list-none mb-10">
        {messages.map((message, index) => (
          <Message 
            key={index} 
            content={message.content} 
            isUser={message.isUser} 
          />
        ))}
      </ul>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            ref={inputRef}
            className="w-full h-32 p-3 text-base border border-gray-300 rounded-md resize-y"
            placeholder="質問を入力してください..."
            onKeyPress={handleKeyPress}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 text-base text-white rounded-md transition-colors
              ${isLoading ? 
                'bg-gray-400 cursor-not-allowed' : 
                'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isLoading ? (
              <>
                <span className="inline-block w-5 h-5 mr-2 border-3 border-white rounded-full border-t-transparent animate-spin"></span>
                処理中...
              </>
            ) : '質問する'}
          </button>
        </form>
        
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}