import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  parseAdvisorApiRequest,
  type AdvisorApiResponse,
} from "@/lib/advisor-api";

export const runtime = "nodejs";

function buildAdvisorInstructions() {
  return [
    "You are Finovo's financial planning assistant.",
    "Answer only from the financial context supplied by Finovo and general educational financial principles.",
    "Never invent balances, dates, returns, transactions, goals, or other user-specific facts.",
    "Treat all monetary values ending in Minor as euro cents. Convert them to euros before discussing them.",
    "Clearly distinguish facts from estimates and assumptions.",
    "Do not promise investment returns or present uncertain outcomes as guaranteed.",
    "Do not tell the user to buy or sell a specific security.",
    "When the available context is insufficient, say what additional information would be needed.",
    "Keep answers concise, practical, and easy to understand.",
    "The answer is informational financial planning support, not regulated personal financial advice.",
  ].join("\n");
}

export async function POST(
  request: Request
) {
  try {
    const body: unknown =
      await request.json();

    const parsed =
      parseAdvisorApiRequest(body);

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      const response: AdvisorApiResponse = {
        ok: false,
        error:
          "The AI Advisor is not configured yet. Add OPENAI_API_KEY to .env.local and restart the development server.",
      };

      return NextResponse.json(
        response,
        { status: 503 }
      );
    }

    const client = new OpenAI({
      apiKey,
    });

    const aiResponse =
      await client.responses.create({
        model:
          process.env.OPENAI_ADVISOR_MODEL ??
          "gpt-5-mini",
        instructions:
          buildAdvisorInstructions(),
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  `Question: ${parsed.question}`,
                  "",
                  "Finovo financial context:",
                  JSON.stringify(
                    parsed.context,
                    null,
                    2
                  ),
                ].join("\n"),
              },
            ],
          },
        ],
      });

    const answer =
      aiResponse.output_text.trim();

    if (!answer) {
      const response: AdvisorApiResponse = {
        ok: false,
        error:
          "The AI Advisor returned an empty response.",
      };

      return NextResponse.json(
        response,
        { status: 502 }
      );
    }

    const response: AdvisorApiResponse = {
      ok: true,
      answer,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      error instanceof TypeError
    ) {
      const response: AdvisorApiResponse = {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid advisor request",
      };

      return NextResponse.json(
        response,
        { status: 400 }
      );
    }

    console.error(
      "Advisor API request failed",
      error
    );

    const response: AdvisorApiResponse = {
      ok: false,
      error:
        "The AI Advisor is temporarily unavailable.",
    };

    return NextResponse.json(
      response,
      { status: 500 }
    );
  }
}
