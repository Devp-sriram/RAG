import { Mistral } from "@mistralai/mistralai";
import {RecursiveCharacterTextSplitter} from '@langchain/textsplitters';
import fs from "node:fs";
import path from "node:path";
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });


const dir = path.join('/home/devp-sriram/scrimba/mistral-ai/rag/','data.txt') 
const mistral = new Mistral({
  apiKey: '',
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
    chunkSize :150,
    chunkOverlap : 30,
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
 
const result = await mistral.embeddings.create({
    inputs: exampleChunk,
    model: "mistral-embed",
  });

const embedCode = result.data[0]
console.log(embedCode); */}

async function createEmberddings(dir){
  const contentArr = splitDoc(dir);
  contentArr.map(async (content) => {
    return [{
      content : content,
      embedding : await mistral.embeddings.create({
        inputs : [content],
        model : 'mistral-embed',
      })
    }]
  });
}

console.table(createEmberddings(dir))
