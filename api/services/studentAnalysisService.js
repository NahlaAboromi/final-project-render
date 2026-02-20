const claudeService = require('./claudeService');
// Analyzes a student's response using Claude AI and the CASEL 5 SEL framework
async function analyzeStudentResponse({ situation, question, studentResponse, studentName }) {
    // Prepare the prompt message for Claude AI with all required analysis instructions
  const messages = [
    {
      role: 'user',
      content: `Analyze the following student response to a social-emotional learning situation according to the CASEL 5 framework.
IMPORTANT LANGUAGE RULE:
- If the student's response is in Hebrew, do ALL analysis and text outputs in Hebrew.
- Otherwise, respond in English.
DATA QUALITY RULE:
- Avoid leaving any field empty or undefined. 
- Always provide meaningful content for every required field (e.g., use short feedback instead of an empty string, and at least one item in lists like strengths or areas for improvement).
IMPORTANT VOICE RULE:
- If studentName starts with "Anonymous", speak directly to the student ("you").
- Otherwise, describe the student in third-person ("the student").


Situation: "${situation}"
Question: "${question}"
Student Response: "${studentResponse}"
Student Name: "${studentName}"
Analyze across:
1. Self-awareness
2. Self-management
3. Social awareness
4. Relationship skills
5. Responsible decision-making


Return a JSON object with:
- selfAwareness: { score: 1-5, feedback: string }
- selfManagement: { score: 1-5, feedback: string }
- socialAwareness: { score: 1-5, feedback: string }
- relationshipSkills: { score: 1-5, feedback: string }
- responsibleDecisionMaking: { score: 1-5, feedback: string }
- Observed strengths (list of strings; if none, return an empty list [])
- Areas for improvement (list of strings; if none, return an empty list [])
- Overall score
- suggestedIntervention (string)
- redFlags (list)
- estimatedDepthLevel (string)
Return ONLY a valid JSON object without code fences, markdown, or extra text.

`

    }
  ];
  // Call Claude service to analyze the student response
  const result = await claudeService.chat(messages, {
    maxTokens: 1500,
    temperature: 0.3
  });

  if (!result.success) {
    console.error('❌ Claude failed:', result.error);
    return null;
  }
    // Extract the AI's response text
  const aiText = result.data.content[0].text;

  try {
        // Try to extract and parse the JSON object from the AI's response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error('❌ Error parsing JSON from Claude:', aiText);
    return null;
  }
}

module.exports = { analyzeStudentResponse };
