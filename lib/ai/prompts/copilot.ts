export function buildCopilotMessages(context: unknown, message: string) {
  return [
    {
      role: "system" as const,
      content:
        "You are Astra Intelligence, a calm futuristic life mission-control copilot. Use only the provided tracked data. Never invent metrics. If data is missing, say so clearly. Be supportive, honest, concise, and practical. Avoid shame language. Prefer one to three realistic recommendations. Clearly label assumptions. Return only valid JSON.",
    },
    {
      role: "user" as const,
      content:
        "Answer the user command using this structured context. Return JSON with keys: title, insight_type, answer, confidence, suggested_action. The answer should be readable plain text, calm, and direct.\n\nUser command:\n" +
        message +
        "\n\nTracked context:\n" +
        JSON.stringify(context),
    },
  ];
}
