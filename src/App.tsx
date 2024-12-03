import { useEffect, useRef, useState } from 'react'
import { ItemSuggestion } from './components/ItemSuggestion'
import { getHistoric, setHistoric } from './storage/historic'
import { sendMessage } from './api/genai'
import './index.css'
import { ThreeDots } from 'react-loader-spinner'

// Define os tipos para o progresso e mensagens de chat
type ProgressType = 'pending' | 'started' | 'done'

type ChatMessage = {
  role: 'user' | 'model' | 'system' | 'function'
  content: string
  subject?: string
}

// Componente principal App
function App() {
  // Variáveis de estado
  const [progress, setProgress] = useState<ProgressType>('pending')
  const [textarea, setTextarea] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([])
  const resetButtonRef = useRef<HTMLButtonElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Função para resetar o chat
  function resetChat() {
    setProgress('pending')
    setChat([])
  }

  // Função para lidar com o envio do chat
  async function handleSubmitChat() {
    if (!textarea) {
      return
    }

    const message = textarea
    setTextarea('')

    if (progress === 'pending') {
      setHistoric(message)
      setProgress('started')
      const prompt = `gere uma pergunta onde simule uma entrevista de emprego
      sobre ${message}, após gerar a pergunta, enviarei a resposta e você me dará um feedback.
      O feedback precisa ser simples, objetivo e corresponder fielmente a resposta enviada. 
      Após o feedback não existirá mais interação.`
      const messageGPT: ChatMessage = {
        role: 'user',
        content: prompt,
        subject: message
      }
      setChat(text => [...text, messageGPT])

      setLoading(true)
      let questionGPT
      do {
        questionGPT = await sendMessage([messageGPT])
      } while (previousQuestions.includes(questionGPT.content))
      setLoading(false)
      setPreviousQuestions(prev => [...prev, questionGPT.content])
      setChat(text => [...text, { role: 'model', content: questionGPT.content }])
      return
    }

    const responseUser: ChatMessage = {
      role: 'user',
      content: message
    }

    setChat(text => [...text, responseUser])
    setLoading(true)
    const feedbackGPT = await sendMessage([...chat, responseUser])
    setChat(text => [...text, { role: 'model', content: feedbackGPT.content }])
    setLoading(false)
    setProgress('done')
  }

  // Função para lidar com eventos de pressionamento de tecla
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLButtonElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()

      if (progress === 'pending' || progress === 'started') {
        handleSubmitChat()
      } else if (progress === 'done') {
        resetChat()
      }
    }
  }

  // Efeito para focar o botão de reset quando o progresso estiver concluído
  useEffect(() => {
    if (progress === 'done' && resetButtonRef.current) {
      resetButtonRef.current?.focus()
    }
  }, [progress])

  // Efeito para focar a textarea quando o progresso não estiver concluído
  useEffect(() => {
    if (progress !== 'done' && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    }
  }, [progress])

  // Função para lidar com o clique em uma sugestão
  function handleSuggestionClick(topic: string) {
    setTextarea(topic)
    textareaRef.current?.focus()
  }

  // Função para limpar o histórico
  function clearHistoric() {
    localStorage.removeItem('historics')
    window.location.reload()
  }

  // Renderiza o componente
  return (
    <div className="container">
      <div className="sidebar">
        <details open className="suggestions">
          <summary>Tópicos sugeridos</summary>
          <ItemSuggestion title='HTML' onClick={() => handleSuggestionClick('HTML')} />
          <ItemSuggestion title='CSS' onClick={() => handleSuggestionClick('CSS')} />
          <ItemSuggestion title='Python' onClick={() => handleSuggestionClick('Python')} />
          <ItemSuggestion title='Javascript' onClick={() => handleSuggestionClick('Javascript')} />
        </details>

        <details open className="historic">
          <summary>Histórico</summary>
          {
            getHistoric()?.length > 0 ? getHistoric().map(item => (
              <ItemSuggestion key={item} title={item} onClick={() => handleSuggestionClick(item)} />
            )) : ''
          }

          <button className="clear-historic" onClick={clearHistoric}>
            🗑 Limpar histórico
          </button>
        </details>
      </div>

      <div className="content">
        {
          progress === 'pending' && (
            <div className="box-home">
              <span>olá, eu sou o</span>
              <h1>teach<span>.me</span></h1>
              <p>
                Estou aqui para te ajudar nos seus estudos.
                Selecione um dos tópicos sugeridos ao lado ou
                digite um tópico que deseja estudar para
                começarmos.
              </p>
            </div>
          )}

        {
          progress !== 'pending' && (
            <div className="box-chat">
              {chat[0] && (
                <h1>Você está estudando sobre <span>{chat[0].subject}</span></h1>
              )}

              {chat[1] && (
                <div className="question">
                  <h2>Pergunta</h2>
                  <p>
                    {chat[1].content}
                  </p>
                </div>
              )}

              {chat[2] && (
                <div className="answer">
                  <h2>Sua resposta</h2>
                  <p>
                    {chat[2].content}
                  </p>
                </div>
              )}

              {chat[3] && (
                <div className="feedback">
                  <h2>feedback teach<span>.me</span></h2>
                  <p>
                    {chat[3].content}
                  </p>
                  <div className="action">
                    <button
                      ref={resetButtonRef}
                      onClick={resetChat}
                      onKeyDown={handleKeyDown}
                    >
                      Estudar novo tópico
                    </button>
                  </div>
                </div>
              )}

              {
                loading && (
                  <ThreeDots
                    visible={true}
                    height="30"
                    width="40"
                    color="#d6409f"
                    radius="9"
                    ariaLabel='three-dots-loading'
                    wrapperStyle={{ margin: '30px auto' }}
                  />
                )
              }
            </div>
          )
        }

        {progress !== 'done' && (
          <div className="box-input">
            <textarea
              ref={textareaRef}
              value={textarea}
              onChange={element => setTextarea(element.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={progress === 'started' ? "Insira a sua resposta" : "Insira o tema que deseja estudar..."}
            />
            <button 
              onClick={handleSubmitChat} 
              className="clickable-button"
            >
              {progress === 'pending' ? 'Enviar pergunta' : 'Enviar resposta'}
            </button>
          </div>
        )}

        <div className="box-footer">
          <p>teach<span>.me</span></p>
        </div>
      </div>
    </div>
  )
}

export default App