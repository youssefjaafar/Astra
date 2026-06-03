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

export class AiProviderError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AiProviderError";
    this.status = status;
  }
}

export async function generateJsonCompletion({ messages, temperature = 0.1 }: GenerateJsonOptions) {
  const provider = process.env.AI_PROVIDER || "openai";

  if (provider !== "openai" && provider !== "openai-compatible") {
    throw new AiProviderError("AI provider is not configured correctly.", 503);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new AiProviderError("AI provider is not configured.", 503);
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

  let data: ChatCompletionResponse;

  try {
    data = (await response.json()) as ChatCompletionResponse;
  } catch {
    throw new AiProviderError("AI provider returned an unreadable response.", 502);
  }

  if (!response.ok) {
    throw new AiProviderError(data.error?.message ?? "AI provider request failed.", response.status || 502);
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new AiProviderError("AI provider returned an empty response.", 502);
  }

  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new AiProviderError("AI provider returned malformed JSON.", 502);
  }
}
