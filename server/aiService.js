/**
 * ResolveX - AI Complaint Intake Service (Member 5 Scope)
 * 
 * Secure Server-Side Module:
 * - Keeps all LLM API keys server-side (never exposed to browser)
 * - Converts unstructured student natural language to structured complaint fields:
 *     { subject, description, category }
 * - Enforces strict schema validation
 * - Enforces timeouts (8s)
 * - Provides graceful fallback to manual form when API fails or keys are missing
 */

require('dotenv').config();

const ALLOWED_CATEGORIES = [
  'Hostel',
  'Academic',
  'Infrastructure',
  'Mess',
  'IT/WiFi',
  'Transport',
  'Other'
];

/**
 * Validates the structured output against strict complaint schema
 * @param {any} data 
 * @returns {{ isValid: boolean, sanitized?: object, error?: string }}
 */
function validateComplaintSchema(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Output must be a valid JSON object' };
  }

  let { subject, description, category } = data;

  if (typeof subject !== 'string' || !subject.trim()) {
    return { isValid: false, error: 'Missing or invalid "subject" field' };
  }

  if (typeof description !== 'string' || !description.trim()) {
    return { isValid: false, error: 'Missing or invalid "description" field' };
  }

  if (typeof category !== 'string' || !category.trim()) {
    return { isValid: false, error: 'Missing or invalid "category" field' };
  }

  // Sanitize subject (truncate if absurdly long)
  subject = subject.trim().slice(0, 120);
  description = description.trim();

  // Normalize category match
  const matchedCategory = ALLOWED_CATEGORIES.find(
    c => c.toLowerCase() === category.trim().toLowerCase()
  );

  if (!matchedCategory) {
    // If category not strictly in enum, categorize to 'Other' or infer closest
    const lower = category.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet') || lower.includes('network') || lower.includes('lab pc')) {
      category = 'IT/WiFi';
    } else if (lower.includes('hostel') || lower.includes('room') || lower.includes('washroom') || lower.includes('water heater')) {
      category = 'Hostel';
    } else if (lower.includes('mess') || lower.includes('food') || lower.includes('canteen')) {
      category = 'Mess';
    } else if (lower.includes('class') || lower.includes('exam') || lower.includes('faculty') || lower.includes('attendance')) {
      category = 'Academic';
    } else if (lower.includes('bus') || lower.includes('parking') || lower.includes('transport')) {
      category = 'Transport';
    } else if (lower.includes('bench') || lower.includes('ac') || lower.includes('fan') || lower.includes('projector') || lower.includes('lift')) {
      category = 'Infrastructure';
    } else {
      category = 'Other';
    }
  } else {
    category = matchedCategory;
  }

  return {
    isValid: true,
    sanitized: {
      subject,
      description,
      category
    }
  };
}

/**
 * Deterministic Rule-Based Heuristic Parser (Resilient Offline Fallback)
 * Activated if no API key is supplied or external LLM service times out.
 * Ensures the student experience remains seamless even without live cloud credit.
 */
function heuristicParseComplaint(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const clean = text.trim();
  const lower = clean.toLowerCase();

  let category = 'Other';
  if (/wifi|internet|network|lan|router|connection|slow net|cse block/i.test(lower)) {
    category = 'IT/WiFi';
  } else if (/mess|food|canteen|dinner|lunch|breakfast|meal|catering/i.test(lower)) {
    category = 'Mess';
  } else if (/hostel|room|bed|warden|corridor|geyser|washroom|water heater/i.test(lower)) {
    category = 'Hostel';
  } else if (/professor|teacher|exam|grades|marks|class|attendance|syllabus|lecture/i.test(lower)) {
    category = 'Academic';
  } else if (/bus|shuttle|auto|transport|commute|parking/i.test(lower)) {
    category = 'Transport';
  } else if (/projector|ac|air condition|fan|bench|light|door|lift|elevator|lab/i.test(lower)) {
    category = 'Infrastructure';
  }

  // Extract a sensible subject: first sentence or first 60 characters
  let subject = '';
  const firstSentence = clean.split(/[.!?\n]/)[0].trim();
  if (firstSentence.length > 5 && firstSentence.length <= 80) {
    subject = firstSentence;
  } else if (clean.length <= 80) {
    subject = clean;
  } else {
    subject = `${category} Issue: ${clean.slice(0, 60)}...`;
  }

  return {
    subject,
    description: clean,
    category
  };
}

/**
 * Calls Gemini API with strict timeout and schema instructions
 */
async function callGeminiAPI(prompt, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const systemInstruction = `You are a helpful college complaint assistant for 'IssueHub'.
Convert the user's natural language complaint description into a strictly formatted JSON object with exactly these fields:
- "subject": A concise, clear summary (max 10 words).
- "description": The detailed explanation based on what the student described.
- "category": Must be one of ["Hostel", "Academic", "Infrastructure", "Mess", "IT/WiFi", "Transport", "Other"].

Respond with raw JSON only. Do NOT use markdown code blocks (\`\`\`json). Do NOT add extra keys.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second strict timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nStudent complaint text:\n"${prompt}"` }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response from Gemini');
    }

    return JSON.parse(candidateText.trim());
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Main AI Intake Parser Entrypoint
 * Handles external LLM call, timeout, validation, and fallback
 * 
 * @param {string} prompt 
 * @returns {Promise<{ success: boolean, data?: object, error?: string, fallbackToManual: boolean, source?: string }>}
 */
async function parseComplaintIntake(prompt) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return {
      success: false,
      error: 'Please provide a descriptive complaint text (minimum 5 characters).',
      fallbackToManual: true
    };
  }

  const cleanPrompt = prompt.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. If LLM API Key is configured, attempt LLM call
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const rawResult = await callGeminiAPI(cleanPrompt, apiKey);
      const validation = validateComplaintSchema(rawResult);

      if (validation.isValid) {
        return {
          success: true,
          data: validation.sanitized,
          source: 'gemini-llm',
          fallbackToManual: false
        };
      } else {
        console.warn('[AI Service] LLM output failed schema validation:', validation.error);
        // Fall through to heuristic fallback
      }
    } catch (err) {
      console.warn('[AI Service] LLM call failed or timed out:', err.message);
      // Fall through to heuristic fallback
    }
  }

  // 2. Resilient Rule-Based Parser Fallback
  const fallbackResult = heuristicParseComplaint(cleanPrompt);
  if (fallbackResult) {
    const val = validateComplaintSchema(fallbackResult);
    if (val.isValid) {
      return {
        success: true,
        data: val.sanitized,
        source: 'nlp-heuristic-fallback',
        fallbackToManual: false,
        notice: 'Processed using built-in NLP parser. Review and edit fields before submitting.'
      };
    }
  }

  // 3. If all fails, signal manual fallback
  return {
    success: false,
    error: 'AI parsing unavailable. Switched to manual entry form.',
    fallbackToManual: true
  };
}

module.exports = {
  parseComplaintIntake,
  validateComplaintSchema,
  heuristicParseComplaint,
  ALLOWED_CATEGORIES
};
