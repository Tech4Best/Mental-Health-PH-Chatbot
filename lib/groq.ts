import Groq from "groq-sdk";
import type { ChatMessage, LLMIntentResult, Provider } from "./types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function trimHistory(
  history: ChatMessage[],
  maxMessages: number
): { role: "user" | "assistant"; content: string }[] {
  return history.slice(-maxMessages).map((m) => ({
    role: m.role === "system" ? ("assistant" as const) : m.role,
    content: m.content,
  }));
}

export async function extractIntent(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<LLMIntentResult> {
  const systemPrompt = `You are an intent parser for a Philippine mental health provider directory. Your job is to understand what the user is looking for and extract structured search parameters.

You MUST respond with valid JSON only. No explanation, no markdown — just a JSON object with these fields:
- "intent": one of "find_provider", "general_question", "greeting", "clarification_needed", "out_of_scope"
- "specializations": array of mental health specializations the user needs (e.g., ["anxiety", "depression", "trauma"])
- "services": array of services the user is looking for (e.g., ["counseling", "psychiatric evaluation", "therapy"])
- "region": the Philippine region, province, or city mentioned (or null)
- "modeOfDelivery": "online", "in-person", or null
- "modeOfPayment": payment preference if mentioned (e.g., "free", "insurance", "HMO") or null
- "inclusivityPreferences": array of inclusivity needs if mentioned (e.g., ["LGBTQ+", "PWD-friendly"]) or empty array
- "searchTerms": array of other relevant keywords from the message

Examples:
- "I need a therapist for anxiety in Manila" → {"intent":"find_provider","specializations":["anxiety"],"services":["therapy"],"region":"Manila","modeOfDelivery":null,"modeOfPayment":null,"inclusivityPreferences":[],"searchTerms":["therapist","manila"]}
- "Hello!" → {"intent":"greeting","specializations":[],"services":[],"region":null,"modeOfDelivery":null,"modeOfPayment":null,"inclusivityPreferences":[],"searchTerms":[]}
- "What is depression?" → {"intent":"general_question","specializations":["depression"],"services":[],"region":null,"modeOfDelivery":null,"modeOfPayment":null,"inclusivityPreferences":[],"searchTerms":["depression"]}`;

  try {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...trimHistory(conversationHistory, 6),
      { role: "user", content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty LLM response");

    const parsed = JSON.parse(raw);

    return {
      intent: parsed.intent || "clarification_needed",
      specializations: parsed.specializations || [],
      services: parsed.services || [],
      region: parsed.region || undefined,
      modeOfDelivery: parsed.modeOfDelivery || undefined,
      modeOfPayment: parsed.modeOfPayment || undefined,
      inclusivityPreferences: parsed.inclusivityPreferences || [],
      searchTerms: parsed.searchTerms || [],
    };
  } catch (error) {
    console.error("Intent extraction failed, falling back to keyword extraction:", error);
    return fallbackIntentExtraction(userMessage);
  }
}

function fallbackIntentExtraction(message: string): LLMIntentResult {
  const lower = message.toLowerCase();
  const tokens = lower.split(/\s+/).filter((t) => t.length > 2);

  const knownSpecializations = [
    "anxiety", "depression", "trauma", "ptsd", "ocd", "adhd", "bipolar",
    "schizophrenia", "eating disorder", "addiction", "grief", "stress",
    "anger", "phobia", "insomnia", "personality disorder", "autism",
  ];
  const knownServices = [
    "therapy", "counseling", "psychiatric", "evaluation", "assessment",
    "rehabilitation", "support group", "crisis intervention", "medication",
    "psychotherapy",
  ];

  const specializations = knownSpecializations.filter((s) => lower.includes(s));
  const services = knownServices.filter((s) => lower.includes(s));

  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(lower);

  return {
    intent:
      specializations.length > 0 || services.length > 0
        ? "find_provider"
        : isGreeting
          ? "greeting"
          : "general_question",
    specializations,
    services,
    searchTerms: tokens,
  };
}

export async function generateResponse(
  intent: LLMIntentResult,
  providers: Provider[],
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const systemPrompt = `You are a compassionate and helpful directory assistant for Philippine mental health service providers. Your name is MHPH Directory Assistant.

IMPORTANT RULES:
- NEVER diagnose conditions or prescribe treatments
- NEVER claim to be a therapist, counselor, or medical professional
- ALWAYS clarify you are a directory tool helping users find providers
- Be warm, empathetic, and professional
- Keep responses concise (2-4 sentences before listing providers)
- If providers were found, briefly introduce them and explain why they might be relevant
- If no providers matched, suggest the user broaden their search terms, try a different region, or describe their needs differently
- For general questions about mental health, give a brief informational answer and gently guide the user to search for a provider
- For greetings, respond warmly and remind them how you can help
- For out-of-scope questions, politely redirect to your directory purpose`;

  let userContext = userMessage;

  if (providers.length > 0) {
    const providerSummary = providers
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} (${p.region}${p.province ? ", " + p.province : ""}) — Specializations: ${p.specializations.join(", ") || "N/A"} | Services: ${p.servicesOffered.join(", ") || "N/A"} | Delivery: ${p.modeOfDelivery.join(", ") || "N/A"} | Contact: ${p.phone || p.email || "See details"}`
      )
      .join("\n");

    userContext = `User message: "${userMessage}"

Intent: ${intent.intent}
Search parameters: specializations=${intent.specializations.join(", ")}, services=${intent.services.join(", ")}, region=${intent.region || "any"}

I found ${providers.length} matching provider(s):
${providerSummary}

Please introduce these providers conversationally. The provider cards with full details will be shown separately in the UI, so just give a brief summary and mention why they might be a good fit. Do not list detailed contact info — that will be in the cards.`;
  } else if (intent.intent === "find_provider") {
    userContext = `User message: "${userMessage}"

Intent: find_provider
Search parameters: specializations=${intent.specializations.join(", ")}, services=${intent.services.join(", ")}, region=${intent.region || "any"}

No matching providers were found. Please let the user know and suggest they broaden their search — try different terms, remove the region filter, or describe their needs differently.`;
  } else {
    userContext = `User message: "${userMessage}"
Intent: ${intent.intent}

Please respond appropriately based on the intent.`;
  }

  try {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...trimHistory(conversationHistory, 6),
      { role: "user", content: userContext },
    ];

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || fallbackResponse(intent, providers);
  } catch (error) {
    console.error("Response generation failed, using fallback:", error);
    return fallbackResponse(intent, providers);
  }
}

function fallbackResponse(intent: LLMIntentResult, providers: Provider[]): string {
  if (intent.intent === "greeting") {
    return "Hello! I'm the MHPH Directory Assistant. I can help you find mental health service providers across the Philippines. What kind of support are you looking for?";
  }

  if (providers.length > 0) {
    return `I found ${providers.length} provider(s) that may match your needs. Here are the results:`;
  }

  if (intent.intent === "find_provider") {
    return "I wasn't able to find providers matching your specific criteria. Try broadening your search — for example, remove the location filter or use different terms to describe what you're looking for.";
  }

  return "I'm a directory assistant for mental health providers in the Philippines. I can help you find therapists, counselors, and other mental health professionals. Could you describe what kind of support you're looking for?";
}
