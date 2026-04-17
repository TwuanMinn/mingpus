import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export interface GeneratedSentence {
  sentence: string;
  pinyin: string;
  translation: string;
}

/**
 * Generate 2 example sentences for a Chinese character using Claude.
 * Sentences are level-appropriate (HSK 1-2 vocabulary) and pedagogically useful.
 */
export async function generateExampleSentences(
  character: string,
  meaning: string,
  hskLevel?: number | null,
): Promise<GeneratedSentence[]> {
  const level = hskLevel ?? 2;
  const prompt = `Generate exactly 2 short, natural example sentences in Chinese for the character "${character}" (meaning: ${meaning}).

Requirements:
- Each sentence should be 6-12 characters long
- Use HSK ${level} level vocabulary where possible
- The character "${character}" must appear in each sentence
- Sentences should feel natural and useful for language learners

Respond with ONLY valid JSON in this exact format, no other text:
[
  {"sentence": "Chinese sentence 1", "pinyin": "pīnyīn with tones 1", "translation": "English translation 1"},
  {"sentence": "Chinese sentence 2", "pinyin": "pīnyīn with tones 2", "translation": "English translation 2"}
]`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(cleaned) as GeneratedSentence[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Invalid response format from AI');
  }

  return parsed.slice(0, 2);
}
