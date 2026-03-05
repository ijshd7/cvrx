import OpenAI from "openai";
import { config } from "../config";

const client = new OpenAI({
  apiKey: config.OPENROUTER_API_KEY,
  baseURL: config.OPENROUTER_BASE_URL,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/cvrx",
    "X-Title": "CVRX",
  },
});

export interface ModelInfo {
  id: string;
  name: string;
  context_length: number;
}

let modelsCache: { data: ModelInfo[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchModels(): Promise<ModelInfo[]> {
  if (modelsCache && Date.now() - modelsCache.timestamp < CACHE_TTL) {
    return modelsCache.data;
  }

  const response = await fetch(`${config.OPENROUTER_BASE_URL}/models`, {
    headers: {
      Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  const json = (await response.json()) as {
    data: Array<{
      id: string;
      name: string;
      context_length: number;
    }>;
  };

  const models: ModelInfo[] = json.data
    .filter((m) => m.context_length > 0)
    .map((m) => ({
      id: m.id,
      name: m.name,
      context_length: m.context_length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  modelsCache = { data: models, timestamp: Date.now() };
  return models;
}

export async function generateContent(
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from the model.");
  }

  return content;
}
