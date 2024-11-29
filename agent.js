import { Mistral } from "@mistralai/mistralai";
import dotenv from 'dotenv';
import { tools , getPaymentStatus, getPaymentDate} from "./tools.js";
dotenv.config();

const mistral = new Mistral({
  apiKey:process.env.MISTRAL_API_KEY_3,
});


const availableFunction = {
     getPaymentStatus,
     getPaymentDate
}

async function agent(query) {
    
    const message = [{
         content : query,
         role :'user'
    }]

   

  for(let i=0;i<5;i++){

      const result = await mistral.chat.complete({
            model: "mistral-large-2407",
            messages: message,
            tools :tools
      });

       message.push(result.choices[0].message)
      if(result.choices[0].finishReason === 'stop'){
         return result.choices[0].message.content; 
      }else if(result.choices[0].finishReason === 'tool_calls'){

      const functionName = result.choices[0].message.toolCalls[0].function.name;
      const functionArgs = JSON.parse(result.choices[0].message.toolCalls[0].function.arguments); 


      const funcResponce = availableFunction[functionName](functionArgs);

      message.push({
        toolCallId : result.choices[0].message.toolCalls[0].id,
        role : 'tool',
        name : functionName,
        content : funcResponce,
      })
      }
  }
 }

const response = await agent('Is the transaction T1001 paid?')
console.log(response)
