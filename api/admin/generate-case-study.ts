import Anthropic from "@anthropic-ai/sdk";
import { verifyAdminCookie } from "../lib-js/adminAuth.js";

type ReqWithBody = {
  method?: string;
  headers?: { cookie?: string };
  body?: {
    title?: string;
    category?: string;
    role?: string;
    summary?: string;
    description?: string;
    tags?: string[];
  };
};

const CASE_STUDY_SCHEMA = {
  type: "object",
  properties: {
    problem: {
      type: "string",
      description: "The user or business problem the project solves, 2-4 sentences, first person",
    },
    process: {
      type: "string",
      description:
        "How the design was approached, 1-2 short paragraphs separated by a blank line, first person",
    },
    keyDecisions: {
      type: "array",
      items: { type: "string" },
      description:
        "3-4 design decisions, each formatted as 'Decision title — reasoning behind it' using an em dash",
    },
    outcome: {
      type: "string",
      description: "The result of the project, 1-3 sentences, honest and concrete",
    },
  },
  required: ["problem", "process", "keyDecisions", "outcome"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You write portfolio case studies for Mirireoluwa, a product designer who also builds what she designs. You draft the four case study sections (problem, process, key decisions, outcome) from a project's existing title, summary, and description.

Voice rules — match these exactly:
- First person ("I started...", "I wanted..."), casual and direct, like talking to another designer
- Contractions everywhere. Short sentences mixed with longer ones. The occasional sentence fragment is fine.
- Honest, not salesy. No buzzwords ("delightful", "seamless", "innovative", "leverage"). No "in today's fast-paced world" framing.
- Concrete over abstract: name the actual friction, the actual tradeoff, the actual choice made
- Don't invent metrics, user counts, or research that isn't implied by the source material. If the outcome is just "it shipped and I use it", say that plainly.

Here is an example of the voice, from an existing case study on the site:

problem: "Most task tools either don't have enough structure — basic to-do lists you outgrow in a week — or have so much that you spend more time configuring than actually working. I wanted something in the middle."

keyDecisions example item: "Status as the primary axis — three clear states (pending, in progress, done) front and center. That's the thing I actually needed to see at a glance."

Ground everything in the provided project details. Where the details are thin, keep the section short rather than padding it with generic filler.`;

export default async function handler(
  req: ReqWithBody,
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return res.status(503).json({ ok: false, message: "ADMIN_PASSWORD is not set" });
  }
  if (!verifyAdminCookie(req.headers?.cookie, password)) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      ok: false,
      message: "ANTHROPIC_API_KEY is not set. Add it in Vercel → project → Settings → Environment Variables.",
    });
  }

  const { title, category, role, summary, description, tags } = req.body ?? {};
  if (!title?.trim() || !summary?.trim()) {
    return res.status(400).json({
      ok: false,
      message: "Fill in at least the title and summary first — the AI grounds the case study in them.",
    });
  }

  const projectBrief = [
    `Title: ${title.trim()}`,
    category ? `Category: ${category}` : null,
    role ? `Role: ${role}` : null,
    tags?.length ? `Tags: ${tags.join(", ")}` : null,
    `Summary:\n${summary.trim()}`,
    description?.trim() ? `Description:\n${description.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      output_config: {
        format: { type: "json_schema", schema: CASE_STUDY_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `Write the case study sections for this project:\n\n${projectBrief}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return res.status(502).json({ ok: false, message: "Model returned no usable output. Try again." });
    }

    const caseStudy = JSON.parse(textBlock.text) as {
      problem: string;
      process: string;
      keyDecisions: string[];
      outcome: string;
    };
    return res.status(200).json({ ok: true, caseStudy });
  } catch (e) {
    console.error("case study generation error:", e);
    if (e instanceof Anthropic.AuthenticationError) {
      return res.status(502).json({ ok: false, message: "Anthropic API key is invalid. Check ANTHROPIC_API_KEY in Vercel." });
    }
    if (e instanceof Anthropic.RateLimitError) {
      return res.status(502).json({ ok: false, message: "Rate limited by the Anthropic API — wait a moment and try again." });
    }
    if (e instanceof Anthropic.APIError) {
      return res.status(502).json({ ok: false, message: `Anthropic API error (${e.status}): ${e.message.slice(0, 160)}` });
    }
    return res.status(500).json({ ok: false, message: "Generation failed. Try again." });
  }
}
