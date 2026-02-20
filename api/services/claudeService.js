//C:\Users\n0502\OneDrive\שולחן העבודה\final_project-main\final_project-main\api\services\claudeService.js
const axios = require('axios');
const path = require('path');

// Loads environment variables from a .env file using an explicit path.
const dotenvPath = path.resolve(process.cwd(), '.env');
console.log("Looking for .env file at:", dotenvPath);
require('dotenv').config({ path: dotenvPath });

//Service for interacting with the Claude AI API.
 //Handles both single-prompt and multi-message chat requests.
 
class ClaudeService {
  constructor() {
     // Try to load the API key from environment variables
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    
    console.log("DEBUG - API Key in claudeService:", this.apiKey ? 
      `Loaded (starts with ${this.apiKey.substring(0, 15)}...)` : 
      "Not loaded - API key is undefined!");
    
   // If the API key is not loaded, use a hardcoded fallback key
    if (!this.apiKey) {
      console.log("WARNING: API key not loaded from .env");
       throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
       // Set the Claude API endpoint and default model
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
this.defaultModel = 'claude-sonnet-4-6';

  }
  // Sends a single prompt to Claude and returns the response.
  async generateResponse(prompt, options = {}) {
    try {
      const { 
        maxTokens = 1000, 
        model = this.defaultModel,
        temperature = 0.7,
        system = '' // Optional system prompt
      } = options;
      // Log the prompt and API key (partially)
      console.log(`Sending request to Claude API with prompt: "${prompt.substring(0, 30)}..."`);
      console.log("Using API key:", this.apiKey ? `${this.apiKey.substring(0, 10)}...` : "undefined");
      // Build the request body for the Claude API
      const requestBody = {
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [{ role: 'user', content: prompt }]
      };

           // Add the system prompt if provided
      if (system && system.trim()) {
        requestBody.system = system;
      }

      console.log("Request body:", JSON.stringify(requestBody, null, 2));
       // Make the API request to Claude
      const response = await axios.post(this.apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
          'anthropic-version': '2023-06-01'
        }
      });
        // Log success and return the API response
      console.log("Claude API response received successfully");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
          // Log and handle errors from the API call
      console.error('Error calling Claude API:', error.response?.data || error.message);
      console.error('Full error object:', error);
      return {
        success: false,
        error: error.response?.data || { error: error.message }
      };
    }
  }

   // Sends a multi-message chat (conversation history) to Claude and returns the response.
  async chat(messages, options = {}) {
    try {
      const { 
        maxTokens = 1000, 
        model = this.defaultModel,
        temperature = 0.7,
        system = ''
      } = options;

      console.log(`Sending chat request to Claude API with ${messages.length} messages`);
      console.log("Using API key:", this.apiKey ? `${this.apiKey.substring(0, 10)}...` : "undefined");
      // Build the request body for the Claude API
      const requestBody = {
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: messages
      };
     // Add the system prompt if provided
      if (system && system.trim()) {
        requestBody.system = system;
      }
     
      console.log("Chat request body:", JSON.stringify(requestBody, null, 2));
      // Make the API request to Claude 
      const response = await axios.post(this.apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
          'anthropic-version': '2023-06-01'
        }
      });

      console.log("Claude API chat response received successfully");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error in Claude chat:', error.response?.data || error.message);
      console.error('Full error object:', error);
      return {
        success: false,
        error: error.response?.data || { error: error.message }
      };
    }
  }
}

module.exports = new ClaudeService();