const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');
const mongoose = require('mongoose');
router.post('/ask', async (req, res) => {
  try {
     // Logging the body of the request for debugging purposes
    console.log("Claude /ask endpoint called with body:", JSON.stringify(req.body, null, 2));
    
    const { prompt, maxTokens, temperature, model, system } = req.body;
      // Validation: Checking if the prompt is provided in the request
    if (!prompt) {
      console.log("No prompt provided in request");
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    console.log(`Processing prompt: "${prompt.substring(0, 30)}..."`);
     // Calling the Claude service to generate a response based on the prompt and optional parameters
    const result = await claudeService.generateResponse(prompt, {
      maxTokens, // Limit the number of tokens in the response
      temperature,// Adjust the model's creativity (higher values result in more randomness)
      model,  // Specify the model to use (if needed)
      system    // Define system-level parameters (if any)
    });

    console.log("Claude service returned result:", result.success ? "Success" : "Failure");
    
    if (!result.success) {
      console.log("Error from Claude service:", result.error);
      return res.status(500).json(result);
    }

    console.log("Sending successful response to client");
    res.json(result);
  } catch (error) {
    console.error('Error in Claude ask endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});
// Handles a multi-message chat session with Claude AI.
router.post('/chat', async (req, res) => {
  try {
    console.log("Claude /chat endpoint called");
        // Extract relevant parameters from the request body
    const { messages, maxTokens, temperature, model, system } = req.body;
        // Validate that messages is a non-empty array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log("Invalid messages array in request");
      return res.status(400).json({
        success: false,
        error: 'Valid messages array is required'
      });
    }

    console.log(`Processing chat with ${messages.length} messages`);
        // Call the Claude service to get a chat response

    const result = await claudeService.chat(messages, {
      maxTokens,
      temperature,
      model,
      system
    });
       // Log whether the Claude service call was successful
    console.log("Claude chat service returned result:", result.success ? "Success" : "Failure");
      // If Claude service failed, log and return error
    if (!result.success) {
      console.log("Error from Claude chat service:", result.error);
      return res.status(500).json(result);
    }
       // Send the successful chat result back to the client
    console.log("Sending successful chat response to client");
    res.json(result);
  } catch (error) {
    // Log and handle unexpected errors
    console.error('Error in Claude chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});
// Generates a short educational scenario and open-ended question using Claude AI.
router.post('/generate-situation', async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log("Claude /generate-situation endpoint called with body:", JSON.stringify(req.body, null, 2));
     // Extract topic, maxWords, and previousSituations from the request
    const { topic, maxWords = 50, previousSituations = 0 } = req.body;
    const lang = req.body.language || req.get('X-Teacher-Lang') || 'he';
const languageNote = lang === 'he' ? 'Answer fully in Hebrew.' : 'Answer fully in English.';

      // Validate that a topic was provided
    if (!topic) {
      console.log("No topic provided in request");
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }
       // Log the topic for which a situation is being generated
    console.log(`Generating situation for topic: "${topic}"`);
    
    // Create the message array for Claude's prompt
    const messages = [
      {
        role: 'user',
        content: `Create a short, engaging scenario or situation related to the topic of "${topic}" that would be suitable for assessing social-emotional skills according to the CASEL 5 framework.

        Requirements:
        1. The scenario should be EXACTLY ${maxWords} words long - no more, no less.
        2. It should be followed by a single open-ended question that promotes critical thinking and social-emotional reflection.
        3. The scenario and question should be appropriate for college students.
        4. The scenario should be realistic and relatable.
        5. Make it different from any previous scenarios (this is request #${previousSituations + 1} for this topic).
        
        Response format:
        {
          "situation": "your ${maxWords}-word scenario here",
          "question": "your open-ended question here"
        }
        
        Only provide the JSON response, nothing else.
        ${languageNote}`
      }
    ];

    // Call Claude service to generate the scenario and question
    const result = await claudeService.chat(messages, {
      maxTokens: 800,
      temperature: 0.7
    });
        // Log whether Claude returned a successful result
    console.log("Claude service returned result for situation generation:", result.success ? "Success" : "Failure");
    // Handle error from Claude service
    if (!result.success) {
      console.log("Error from Claude service:", result.error);
      return res.status(500).json({ 
        success: false, 
        error: result.error || 'Failed to generate situation' 
      });
    }

      // Extract the AI's response text
    const aiResponse = result.data.content[0].text;
    
    // Try to parse the JSON from the AI's response
    let parsedResponse;
    try {
      // Try to find JSON in response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, try to extract situation and question using regex
        const situationMatch = aiResponse.match(/situation[:\s]+"([^"]+)"/i);
        const questionMatch = aiResponse.match(/question[:\s]+"([^"]+)"/i);
        
        parsedResponse = {
          situation: situationMatch ? situationMatch[1] : 'Could not generate a situation.',
          question: questionMatch ? questionMatch[1] : 'Could not generate a question.'
        };
      }
    } catch (error) {
         // Log parsing error and raw AI response
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', aiResponse);
      
        // If parsing fails, try to extract lines manually
      const lines = aiResponse.split('\n');
      const situation = lines.find(line => line.includes('situation'))?.replace(/.*situation.*:/i, '').trim() || 'Could not generate a situation.';
      const question = lines.find(line => line.includes('question'))?.replace(/.*question.*:/i, '').trim() || 'Could not generate a question.';
      
      parsedResponse = { situation, question };
    }
    // Log and send the successful response to the client
    console.log("Sending successful situation generation response to client");
    res.json({
      success: true,
      situation: parsedResponse.situation,
      question: parsedResponse.question,
      chatHistory: messages.concat([{
        role: 'assistant',
        content: aiResponse
      }])
    });
  } catch (error) {
      // Log and handle unexpected errors
    console.error('Error in Claude generate-situation endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Analyzes a student's response to a scenario using the CASEL 5 framework via Claude AI.
router.post('/analyze-response', async (req, res) => {
  try {
      // Log that the analyze-response endpoint was called
    console.log("Claude /analyze-response endpoint called");
      // Extract relevant fields from the request body
    const { situation, question, studentResponse, studentName } = req.body;
      // Validate that all required fields are present
    if (!situation || !question || !studentResponse) {
      console.log("Missing required data for analysis");
      return res.status(400).json({ 
        success: false, 
        error: 'Situation, question, and student response are all required' 
      });
    }

    console.log(`Analyzing response for student: ${studentName || 'Unknown'}`);
    
  // Create the prompt message for Claude to analyze the student response
    const messages = [
      {
        role: 'user',
        content: `Analyze the following student response to a social-emotional learning situation according to the CASEL 5 framework.
        
        Situation: "${situation}"
        
        Question: "${question}"
        
        Student Response: "${studentResponse}"
        
        Analyze the student's response across all five CASEL competencies:
        1. Self-awareness
        2. Self-management
        3. Social awareness
        4. Relationship skills
        5. Responsible decision-making
        
        For each competency, provide:
        - Score (1-5 scale)
        - Brief feedback (2-3 sentences)
        - Observed strengths (bullet points)
        - Areas for improvement (bullet points)
        
        Also provide an overall score (1-5) and general feedback.
        
        Format your response as a JSON object.`
      }
    ];

    
    // Call the Claude service to get the analysis
    const result = await claudeService.chat(messages, {
      maxTokens: 1500,
      temperature: 0.3
    });

    console.log("Claude service returned result for response analysis:", result.success ? "Success" : "Failure");
    
    if (!result.success) {
      console.log("Error from Claude service:", result.error);
      return res.status(500).json(result);
    }

      // Extract the AI's response text
    const aiResponse = result.data.content[0].text;
    
      // Try to parse the JSON analysis from the AI's response
    let parsedAnalysis;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      parsedAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      
      if (!parsedAnalysis) {
        throw new Error('Could not extract valid analysis from AI response');
      }
    } catch (error) {
        // Log parsing error and raw AI response
      console.error('Error parsing AI analysis:', error);
      console.log('Raw AI response:', aiResponse);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to parse analysis results' 
      });
    }
     // Log and send the successful analysis response to the client
    console.log("Sending successful analysis response to client");
    res.json({
      success: true,
      analysis: parsedAnalysis,
      chatHistory: messages.concat([{
        role: 'assistant',
        content: aiResponse
      }])
    });
  } catch (error) {
      // Log and handle unexpected errors
    console.error('Error in Claude analyze-response endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});
const ClassModel = require('../models/ClassSchema');
const StudentModel = require('../models/StudentSchema');
const TeacherModel = require('../models/TeacherSchema');

// Provides a teacher with insights about their classes and students using Claude AI.
router.post('/chat-insight', async (req, res) => {
  try {
      // Extract teacherId and messages from the request body
    const { teacherId, messages } = req.body;
      // Validate input parameters
    if (!teacherId || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing teacherId or messages array' });
    }
   
    // Fetch teacher information from the database
    const teacher = await TeacherModel.findOne({ id: teacherId }).lean();
    if (!teacher || (!teacher.fullName && !teacher.username)) {
      return res.status(404).json({ success: false, error: 'Teacher not found or missing name' });
    }
     // Get the teacher's name
    const teacherName = teacher.fullName || teacher.username;
      // Fetch all classes created by the teacher
    const classes = await ClassModel.find({ createdBy: teacherId }).lean();
      // Fetch all students from the database
    const allStudents = await StudentModel.find().lean();
      // Create a mapping from student ID to username
    const studentMap = {};
    allStudents.forEach(s => {
      studentMap[s.id] = s.username || "Unknown";
    });
      // Collect all student answers and IDs from the teacher's classes
    const studentAnswers = [];
    const studentIdsInClasses = new Set();

    classes.forEach(cls => {
      (cls.students || []).forEach(ans => {
        studentIdsInClasses.add(ans.studentId);
        studentAnswers.push({
          classCode: cls.classCode,
          className: cls.className,
          studentId: ans.studentId,
          fullName: studentMap[ans.studentId] || "Unknown",
          answerText: ans.answerText || "",
          overallScore: ans.analysisResult?.overallScore,
          submittedAt: ans.submittedAt
        });
      });
    });
     // Filter students who are in the teacher's classes
    const filteredStudents = allStudents
      .filter(s => studentIdsInClasses.has(s.id))
      .map(s => ({ id: s.id, username: s.username }));
 // Prepare a summary of each class for Claude's context
    const classSummaries = classes.map(cls => ({
      classCode: cls.classCode,
      className: cls.className,
      subject: cls.subject,
      numStudents: cls.students?.length || 0
    }));

  // Build the system prompt for Claude's context
    const systemPrompt = `
You are a helpful teaching assistant AI for the teacher "${teacherName}".
Use the following data to assist with their questions about their classes and students.

📚 Classes:
${JSON.stringify(classSummaries, null, 2)}

👥 Student Answers:
${JSON.stringify(studentAnswers, null, 2)}

🧑‍🎓 Students:
${JSON.stringify(filteredStudents, null, 2)}
    `.trim();
  // Call Claude service with the teacher's messages and system prompt
    const result = await claudeService.chat(messages, {
      maxTokens: 1800,
      temperature: 0.5,
      system: systemPrompt 
    });
    // Handle errors from Claude service
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
  // Extract and send the AI's reply to the client
    const reply = result.data.content[0].text;
    res.json({ success: true, response: reply });

  } catch (err) {
      // Log and handle unexpected errors
    console.error("Error in /chat-insight:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/student-chat-insight', async (req, res) => {
  try {
    // Extract parameters from the request body
    const { studentId, messages } = req.body;

    // Validate input
    if (!studentId || !Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing studentId or messages array' });
    }

    // Fetch the student record
    const student = await StudentModel.findOne({ id: studentId }).lean();
    if (!student || !student.username) {
      return res
        .status(404)
        .json({ success: false, error: 'Student not found or missing name' });
    }
    const studentName = student.username;

    // Fetch all classes in which the student is enrolled
    const simulationClasses = await ClassModel.find({
      students: { $elemMatch: { studentId } }
    }).lean();

    // Fetch all teachers (for a concise list of names)
    const allTeachers = await TeacherModel.find().lean();
    const teacherNames = allTeachers.map(t => t.username || 'Unknown');

    // Collect the student’s simulation scores
    const studentAnswers = [];
    simulationClasses.forEach(cls => {
      (cls.students || [])
        .filter(ans => ans.studentId === studentId)
        .forEach(ans => {
          studentAnswers.push({
            classCode: cls.classCode,
            className: cls.className,
            score: ans.analysisResult?.overallScore ?? 'N/A'
          });
        });
    });

    // Create concise class summaries
    const classSummaries = simulationClasses.map(cls => ({
      classCode: cls.classCode,
      className: cls.className,
      subject: cls.subject
    }));

    // Build a compact prompt for Claude
    const systemPrompt = `
You are a friendly teaching assistant AI helping the student "${studentName}" understand their progress.

Classes:
${classSummaries
  .map(c => `• ${c.classCode} – ${c.className} (${c.subject})`)
  .join('\n')}

Simulation Scores:
${studentAnswers.map(a => `• ${a.classCode}: ${a.score}`).join('\n')}

Teachers:
${teacherNames.join(', ')}

Please answer the student’s questions clearly and kindly.
`.trim();

    // Call Claude
    const result = await claudeService.chat(messages, {
      maxTokens: 1200,
      temperature: 0.5,
      system: systemPrompt
    });

    // Handle possible Claude errors
    if (!result.success) {
      console.error('Claude error:', result.error);
      return res.status(500).json({ success: false, error: result.error });
    }

    // Send Claude’s reply back to the client
    const reply =
      result.data?.content?.[0]?.text || 'I could not generate a response.';
    res.json({ success: true, response: reply });
  } catch (err) {
    console.error('Error in /student-chat-insight:', err);
    res
      .status(500)
      .json({ success: false, error: err.message || 'Internal server error' });
  }
});



module.exports = router;
