import axios from 'axios';
import { z } from 'zod';
import { OpenAI } from 'openai';

const analysisSchema = z.object({
  overview: z.string(),
  issues: z.array(z.object({
    severity: z.enum(['critical', 'major', 'minor']),
    description: z.string(),
    recommendation: z.string(),
  })),
  recommendations: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof analysisSchema>;

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch website content: ${error.message}`);
    }
    throw new Error('Failed to fetch website content: Unknown error occurred');
  }
}

export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  try {
    const content = await fetchWebsiteContent(url);
    
    const openai = new OpenAI({
      apiKey: process.env.NEXT_OPENAI_API_KEY,
    });
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a UX expert analyzing websites. Provide detailed analysis focusing on usability, accessibility, and conversion optimization."
        },
        {
          role: "user",
          content: `Analyze this website content and provide UX recommendations. Respond in valid JSON format matching this structure:
                    {
                      "overview": "string",
                      "issues": [{"severity": "critical|major|minor", "description": "string", "recommendation": "string"}],
                      "recommendations": ["string"]
                    }
                    
                    Website content: ${content}`
        }
      ],
      temperature: 0.7,
    });

    const analysis = analysisSchema.parse(JSON.parse(completion.choices[0].message.content!));
    return analysis;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
    throw new Error('Analysis failed: Unknown error occurred');
  }
}