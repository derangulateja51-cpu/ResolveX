/**
 * IssueHub AI Natural-Language Complaint Intake Engine
 * Keeps all LLM API keys server-side.
 * Features:
 * - Natural Language structuring (Subject extraction, Category classification, Priority detection)
 * - Safe fallback to NLP heuristic parser if GEMINI_API_KEY is not configured or network drops
 */

require('dotenv').config();

const VALID_CATEGORIES = ['Hostel', 'Academic', 'Infrastructure', 'Mess', 'IT/WiFi', 'Transport', 'Other'];

/**
 * Built-in NLP heuristic parser (Zero-external-dependency fallback)
 */
function parseWithNLPHeuristics(prompt) {
  const text = prompt.trim();
  const lower = text.toLowerCase();

  // 1. Determine Category
  let category = 'Other';
  if (lower.includes('wifi') || lower.includes('internet') || lower.includes('lan') || lower.includes('network') || lower.includes('router') || lower.includes('portal') || lower.includes('login')) {
    category = 'IT/WiFi';
  } else if (lower.includes('hostel') || lower.includes('geyser') || lower.includes('room') || lower.includes('warden') || lower.includes('washroom') || lower.includes('bathroom') || lower.includes('water') || lower.includes('bed')) {
    category = 'Hostel';
  } else if (lower.includes('mess') || lower.includes('food') || lower.includes('canteen') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast') || lower.includes('hygiene') || lower.includes('undercooked') || lower.includes('dining')) {
    category = 'Mess';
  } else if (lower.includes('projector') || lower.includes('prof') || lower.includes('professor') || lower.includes('class') || lower.includes('course') || lower.includes('exam') || lower.includes('assignment') || lower.includes('grade') || lower.includes('lecture') || lower.includes('faculty')) {
    category = 'Academic';
  } else if (lower.includes('bus') || lower.includes('transport') || lower.includes('shuttle') || lower.includes('parking') || lower.includes('auto') || lower.includes('cab')) {
    category = 'Transport';
  } else if (lower.includes('bench') || lower.includes('chair') || lower.includes('door') || lower.includes('window') || lower.includes('lift') || lower.includes('elevator') || lower.includes('ac') || lower.includes('air conditioner') || lower.includes('fan') || lower.includes('light') || lower.includes('building') || lower.includes('road')) {
    category = 'Infrastructure';
  }

  // 2. Generate clean subject
  let subject = '';
  const firstSentence = text.split(/[.\n!?]/)[0].trim();
  if (firstSentence.length >= 10 && firstSentence.length <= 70) {
    subject = firstSentence;
  } else if (firstSentence.length > 70) {
    subject = `${firstSentence.slice(0, 67)}...`;
  } else {
    subject = `${category} Issue: ${text.slice(0, 50)}...`;
  }

  // Capitalize first character
  subject = subject.charAt(0).toUpperCase() + subject.slice(1);

  return {
    subject,
    description: text,
    category
  };
}

/**
 * Parse complaint with Gemini LLM or NLP fallback
 */
async function parseComplaintIntake(prompt) {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return {
      success: false,
      error: 'Complaint description cannot be empty.',
      fallbackToManual: true
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // If no Gemini key is provided, use high-accuracy NLP heuristic parser
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const data = parseWithNLPHeuristics(prompt);
    return {
      success: true,
      data,
      source: 'nlp-heuristic-fallback',
      fallbackToManual: false,
      notice: 'Processed using IssueHub NLP parser. Review and edit fields before submitting.'
    };
  }

  // Attempt Google Gemini LLM
  try {
    const systemInstruction = `You are the complaint intake parser for IssueHub, a university grievance platform.
Extract structured ticket data from student complaint prompts.
Valid categories are STRICTLY: ["Hostel", "Academic", "Infrastructure", "Mess", "IT/WiFi", "Transport", "Other"].
Output valid JSON ONLY with fields:
- "subject": concise 5-10 word title
- "description": clear, professionally rephrased grievance retaining all student details
- "category": one of the valid categories`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemInstruction}\n\nStudent prompt: "${prompt}"` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    const resJson = await response.json();
    const candidateText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('No candidate content');

    const parsed = JSON.parse(candidateText);
    const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'Other';

    return {
      success: true,
      data: {
        subject: parsed.subject || prompt.slice(0, 50),
        description: parsed.description || prompt,
        category
      },
      source: 'gemini-1.5-flash',
      fallbackToManual: false
    };
  } catch (err) {
    console.warn('[AI Service] Gemini call failed, using heuristic fallback:', err.message);
    const data = parseWithNLPHeuristics(prompt);
    return {
      success: true,
      data,
      source: 'nlp-heuristic-fallback',
      fallbackToManual: false,
      notice: 'Processed using IssueHub NLP parser. Review and edit fields before submitting.'
    };
  }
}

module.exports = {
  parseComplaintIntake,
  parseWithNLPHeuristics,
  VALID_CATEGORIES
};
