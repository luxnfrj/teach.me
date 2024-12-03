import { GoogleGenerativeAI } from "@google/generative-ai";

// Define o tipo para mensagens
type Message = {
    role: 'user' | 'model' | 'function' | 'system';
    content: string;
};

// Inicializa o Google Generative AI com a chave da API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

// Função para enviar uma mensagem para a IA e obter uma resposta
export async function sendMessage(messages: Message[]) {
    try {
        // Obtém o modelo generativo
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Inicia um chat com o histórico de mensagens fornecido
        const chat = model.startChat({
            history: messages.map(message => ({
                role: message.role,
                parts: [{ text: message.content }],
            })),
            generationConfig: {
                maxOutputTokens: 100,
            },
        });

        // Envia a última mensagem e obtém a resposta
        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = await response.text();

        // Retorna a resposta como uma mensagem
        return {
            role: 'model',
            content: text,
        };
    } catch (error) {
        // Lida com erros e retorna mensagens apropriadas
        if (error instanceof Error && error.message.includes('503')) {
            console.error("Serviço indisponível. Tente novamente mais tarde.");
            return { role: 'model', content: 'O serviço está temporariamente indisponível. Por favor, tente novamente mais tarde.' };
        }
        console.error("Erro ao chamar a API Google Gemini:", error);
        return { role: 'model', content: 'Houve um erro ao processar sua solicitação.' };
    }
}
