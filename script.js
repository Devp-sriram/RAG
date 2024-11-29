import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config();



const mistral = new Mistral({
  apiKey:process.env.MISTRAL_API_KEY,
});
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

// 1. Getting the user input
const input = "how to get general guidelines about Ambrics policies what is  Ambricsʹs policy of voluntary at‐will employment.";

// 2. Creating an embedding of the input
const embedding = await createEmbedding(input);
// console.log(embedding)

// 3. Retrieving similar embeddings / text chunks (aka "context")
const context = await retrieveMatches(embedding);
//console.log(context);

// 4. Combining the input and the context in a prompt 
// and using the chat API to generate a response 
const response = await generateChatResponse(context, input);
console.log(response);

async function createEmbedding(input) {
  const embeddingResponse = await mistral.embeddings.create({
      inputs: [input],
      model: 'mistral-embed',
  });
  return embeddingResponse.data[0].embedding;
}

async function retrieveMatches(embedding) {
  const { data } = await supabase.rpc('match_handbook_docs', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 10
    });
  
  return data.map((info) => info.content).join('---');
}


async function generateChatResponse(context, query) {
  const result = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      {
        content: `hey you a general manager in a company called ambrics ,the emplooies ask you questions about company the details of the questions are in  context: ${context} - this a data from a rag system seperated with --- understant the details in the context and answer accordingly`,
        role: "system",
      },
      {
        content: query,
        role: "user",
      },
      ],
  });

  // Handle the result
  return result.choices[0].message
}

