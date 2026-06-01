import "server-only";

type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GenerateJsonOptions = {
  messages: AiMessage[];
  temperature?: number;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function generateJsonCompletion({ messages, temperature = 0.1 }: GenerateJsonOptions) {
  const provider = process.env.AI_PROVIDER || "openai";

  if (provider !== "openai" && provider !== "openai-compatible") {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      response_format: { type: "json_object" },
    }),
  });

  const data = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "AI provider request failed.");
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI provider returned an empty response.");
  }

  return JSON.parse(content) as unknown;
}
