//import OpenAI from "openai"
//
//type Message = {
//   role: 'user' | 'assistant'
//   content: string
//
//
//const openai = new OpenAI({
//   apiKey: '',
//   dangerouslyAllowBrowser: true
//)
//
//export async function sendMessage(messages: Message[]) {
//   try {
//       const response = await openai.chat.completions.create({
//           model: 'gpt-3.5-turbo',
//           messages: messages.map(message => ( { 
//               role: message.role, 
//               content: message.content 
//           }))
//       });
//
//       return {
//           role: response.choices[0].message.role,
//           content: response.choices[0].message.content || ''
//       }
//   } catch (error) {
//       console.error("Erro ao chamar a API OpenAI:", error);
//       return { ROLE: 'assistant', content: 'Houve um erro ao processar sua solicitação.'
//       }
//   }
//
//