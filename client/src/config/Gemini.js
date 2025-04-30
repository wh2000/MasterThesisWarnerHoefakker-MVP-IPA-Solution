
import axios from 'axios';

async function runChat(prompt) {
  let LLM = JSON.parse(sessionStorage.getItem("LLM"));
  if (LLM.gemini == true) {
    try {
      // 
      const promise = axios.post('http://localhost:4000/api/v1/result', {
        'prompt': prompt
      })
      const dataPromise = promise.then((response) => response.data)
      return dataPromise
      
    } catch (error) {
      let message = 'Error. The server may be offline or you don\'t have internet.'
      if (error.response) {
        message = error.response.data
      }
      return error.response
    }
  } else if (LLM.chatgpt == true) {
    try {
      const promise = axios.post('http://localhost:4000/api/v1/models/chatgpt', {
        'prompt': prompt
      })
      const dataPromise = promise.then((response) => response.data)
      return dataPromise
      
    } catch (error) {
      let message = 'Error. The server may be offline or you don\'t have internet.'
      if (error.response) {
        message = error.response.data
      }
      return error.response
    }
  }
    
}

 export default runChat;