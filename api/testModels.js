const axios = require('axios');

require('dotenv').config();

const API_KEY = process.env.ANTHROPIC_API_KEY;

console.log("API KEY:", API_KEY ? "Loaded" : "Missing");


async function testModel(model) {

  try {

    const res = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: model,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Say hello'
          }
        ]
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    console.log(`✅ ${model} WORKS`);

  } catch (err) {

    console.log(`❌ ${model} FAILED`);
    console.log(err.response?.data);

  }

}


async function run() {

  await testModel('claude-sonnet-4-6');

  await testModel('claude-3-7-sonnet-20250219');

}

run();
