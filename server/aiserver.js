import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 8787;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.post('/api/ai/hazard-suggestions', async (req, res) => {
  try {
    const { majorProcess = '', subProcess = '' } = req.body ?? {};

    if (!majorProcess.trim() && !subProcess.trim()) {
      return res.status(400).json({
        error: 'majorProcess or subProcess is required.',
      });
    }

    const prompt = `
You are helping a student complete a healthcare FMEA hazard analysis.

Return ONLY valid JSON in this exact shape:
{
  "failureModes": ["", "", ""],
  "failureCauses": ["", "", ""],
  "failureEffects": ["", "", ""],
  "actions": ["", "", ""]
}

Rules:
- Focus on realistic healthcare workflow risk analysis.
- Keep each suggestion short and specific.
- Do not include markdown.
- Do not include explanations outside JSON.
- Suggestions must be appropriate for an educational FMEA/RCA tool.

Major Process: ${majorProcess}
Subprocess / Task: ${subProcess}
`;

    const response = await client.responses.create({
      model: 'gpt-5.4',
      reasoning: { effort: 'low' },
      instructions:
        'You generate concise healthcare safety risk suggestions for FMEA hazard analysis.',
      input: prompt,
    });

    const text = response.output_text?.trim();

    if (!text) {
      return res.status(502).json({ error: 'Empty AI response.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: 'AI response was not valid JSON.',
        raw: text,
      });
    }

    const safe = {
      failureModes: Array.isArray(parsed.failureModes) ? parsed.failureModes.slice(0, 3) : [],
      failureCauses: Array.isArray(parsed.failureCauses) ? parsed.failureCauses.slice(0, 3) : [],
      failureEffects: Array.isArray(parsed.failureEffects) ? parsed.failureEffects.slice(0, 3) : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3) : [],
    };

    return res.json(safe);
  } catch (error) {
    console.error('AI hazard suggestion error:', error);
    return res.status(500).json({
      error: 'Failed to generate AI suggestions.',
    });
  }
});

app.listen(port, () => {
  console.log(`AI server running on http://localhost:${port}`);
});