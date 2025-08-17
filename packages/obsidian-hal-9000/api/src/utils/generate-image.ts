import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function generateImage(prompt: string): Promise<string> {
  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    quality: 'high',
    size: '1536x1024',
    n: 1,
  })

  const base64Str = result.data?.[0]?.b64_json;

  if (!base64Str) {
    throw new Error("No image generated");
  }

  return base64Str;
}
