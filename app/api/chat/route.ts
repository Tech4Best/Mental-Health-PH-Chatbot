import { NextResponse } from "next/server";
import { getCrisisResponse } from "@/lib/crisis";
import { getProviders } from "@/lib/sheets";
import { extractIntent, generateResponse } from "@/lib/groq";
import { searchProviders } from "@/lib/providers";
import type { ChatRequest, ChatResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const message = body.message.trim();
    const history = Array.isArray(body.history) ? body.history : [];

    // 1. Fetch providers from cache
    const allProviders = await getProviders();

    console.log("Providers:", allProviders.length)

    // 2. Extract intent via Groq LLM (includes crisis detection)
    const intent = await extractIntent(message, history);

    console.log("Intent:", intent)

    // 3. Check for crisis — if detected, return crisis response immediately
    if (intent.isCrisis) {
      const response: ChatResponse = {
        message: getCrisisResponse(),
        providers: [],
        isCrisis: true,
      };
      return NextResponse.json(response);
    }

    // 4. Search providers if the intent is to find one
    const matchedProviders =
      intent.intent === "find_provider"
        ? searchProviders(allProviders, intent)
        : [];

    console.log("Matched Providers:", matchedProviders.length)

    // 5. Generate conversational response via Groq LLM
    const responseMessage = await generateResponse(
      intent,
      matchedProviders,
      message,
      history
    );

    const response: ChatResponse = {
      message: responseMessage,
      providers: matchedProviders,
      isCrisis: false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message:
          "I'm sorry, I encountered an issue processing your request. Please try again in a moment.",
        providers: [],
        isCrisis: false,
      } satisfies ChatResponse,
      { status: 500 }
    );
  }
}
