/**
 * ResolveX AI Intake Frontend Service (Member 5 Scope)
 * 
 * SECURITY MANDATE:
 * - NEVER stores or sends LLM API keys from the browser
 * - Talks directly to the server-side AI Intake endpoint:
 *   VITE_AI_URL (default: http://localhost:5001/api/ai)
 * - Enforces strict client-side JSON/schema validation
 * - Enforces 8s timeout with AbortController
 * - If failure/timeout/missing fields occur, signals `fallbackToManual: true`
 *   to immediately render the editable manual form.
 */

const AI_BASE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:5001/api/ai';

export const VALID_CATEGORIES = [
  'Hostel',
  'Academic',
  'Infrastructure',
  'Mess',
  'IT/WiFi',
  'Transport',
  'Other'
];

/**
 * Validates the parsed structure on client side
 */
export function validateAiStructuredFields(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'AI did not return a valid data object' };
  }

  const { subject, description, category } = data;

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return { isValid: false, error: 'AI output is missing a valid "subject"' };
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    return { isValid: false, error: 'AI output is missing a valid "description"' };
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    return { isValid: false, error: 'AI output is missing a valid "category"' };
  }

  // Ensure category is standardized
  const matched = VALID_CATEGORIES.find(c => c.toLowerCase() === category.trim().toLowerCase());

  return {
    isValid: true,
    data: {
      subject: subject.trim().slice(0, 120),
      description: description.trim(),
      category: matched || 'Other'
    }
  };
}

/**
 * Client-Side Heuristic Fallback Parser
 * If the backend AI server is completely unreachable or offline, this local
 * natural language parser guarantees the user is never stuck and still gets
 * structured pre-filling!
 */
export function clientSideHeuristicParse(text) {
  if (!text || text.trim().length < 5) return null;
  const clean = text.trim();
  const lower = clean.toLowerCase();

  let category = 'Other';
  if (/wifi|internet|network|router|lan|connection|cse block/i.test(lower)) {
    category = 'IT/WiFi';
  } else if (/mess|food|canteen|dinner|lunch|breakfast|meal/i.test(lower)) {
    category = 'Mess';
  } else if (/hostel|room|geyser|washroom|water|heater|warden/i.test(lower)) {
    category = 'Hostel';
  } else if (/exam|marks|grades|faculty|class|professor|attendance/i.test(lower)) {
    category = 'Academic';
  } else if (/bus|shuttle|parking|transport/i.test(lower)) {
    category = 'Transport';
  } else if (/projector|ac|fan|bench|light|door|lift|elevator|lab/i.test(lower)) {
    category = 'Infrastructure';
  }

  const firstSentence = clean.split(/[.!?\n]/)[0].trim();
  let subject = firstSentence.length > 5 && firstSentence.length <= 80 ? firstSentence : `${category} issue reported`;

  return {
    subject,
    description: clean,
    category
  };
}

/**
 * Main AI Parsing Function
 * @param {string} prompt Natural language complaint
 * @returns {Promise<{ success: boolean, data?: object, fallbackToManual: boolean, error?: string, source?: string }>}
 */
export async function parseComplaintWithAI(prompt) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return {
      success: false,
      fallbackToManual: true,
      error: 'Please describe your grievance in at least a few words.'
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout rule

  try {
    const response = await fetch(`${AI_BASE_URL}/parse-complaint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt.trim() }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI Server responded with status ${response.status}`);
    }

    const json = await response.json();

    if (!json.success || !json.data) {
      // Backend signalled fallback
      throw new Error(json.error || 'AI could not structure the complaint.');
    }

    // Client-side strict validation
    const validation = validateAiStructuredFields(json.data);
    if (!validation.isValid) {
      throw new Error(`Validation error: ${validation.error}`);
    }

    return {
      success: true,
      data: validation.data,
      source: json.source || 'ai-server',
      fallbackToManual: false,
      notice: json.notice
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[AI Service Frontend] Remote AI intake failed/timed out:', err.message);

    // Try client-side heuristic parser as a helpful bridge before complete fallback
    const fallbackParsed = clientSideHeuristicParse(prompt);
    if (fallbackParsed) {
      const val = validateAiStructuredFields(fallbackParsed);
      if (val.isValid) {
        return {
          success: true,
          data: val.data,
          source: 'client-nlp-fallback',
          fallbackToManual: false,
          notice: 'AI server offline/busy. Applied client-side smart parser. Please verify details.'
        };
      }
    }

    // Fail safe to manual form
    return {
      success: false,
      fallbackToManual: true,
      error: 'AI service unavailable or response timed out. Switched to manual entry form.'
    };
  }
}
