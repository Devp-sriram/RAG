import { Mistral } from "@mistralai/mistralai";
import {RecursiveCharacterTextSplitter} from '@langchain/textsplitters';
import fs from "node:fs";
import path from "node:path";
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js'
dotenv.config();

 
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY)

const dir = path.join('/home/devp-sriram/scrimba/mistral-ai/rag/','data.txt') 

// const dir ='performance or creating an intimidating, hostile, humiliating, or offensive working\n' +
//   'environment.'


const mistral = new Mistral({
  apiKey:process.env.MISTRAL_API_KEY_3,
});


async function run() {
  const result = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      {
        content:
          "Who is the best French painter? Answer in one short sentence.",
        role: "user",
      },
      ],
  });

  // Handle the result
  console.log(result);
}

async function splitDoc(dir){
  const data = fs.readFileSync(dir, 'utf8');

  const spliter = new RecursiveCharacterTextSplitter({
    chunkSize :60,
    chunkOverlap :20,
  })

    const output = await spliter.createDocuments([data]);
    const textArr = output.map(chunk => chunk.pageContent);
    return textArr;
}

{/*
const exampleChunk = ['hour days.  Ordinarily, work hours are from 9:00 a.m. ‐ 5:00 p.m., Monday through Friday,\n' +
    'including one hour (unpaid) for lunch.  Employees may request the opportunity to vary their'];
// console.log(await splitDoc());
//
  */}



const contentArr = await splitDoc(dir);

async function createEmberddings(input){
    
    const embedCode = await mistral.embeddings.create({
          inputs: input,
          model: "mistral-embed",
    });
    const data = input.map((chunck,i)=>{
    return {
      chunck : chunck,
      embeddings : embedCode.data[i].embedding
    }
  });
  return data
}

const data = await createEmberddings(contentArr);
// console.log(data);
try{
await supabase.from('handbook_docs').insert(data);
console.log('success');
}catch(err){
  console.log(err)
}
//console.log(await embedArr('sajfbauwofbajdf'));
//console.log(await splitDoc(dir));

