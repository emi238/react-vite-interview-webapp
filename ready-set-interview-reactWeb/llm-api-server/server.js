import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const app = express();
// allow the Vite dev origin
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// Define the schema for interview questions
const QuestionSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    difficulty: z.enum(["Easy", "Intermediate", "Advanced"])
  })).nonempty(),
});

// Choose model by provider
function getModel() {
  const provider = process.env.AI_PROVIDER;
  if (provider === "openai") {
    // Uses OPENAI_API_KEY
    return new ChatOpenAI({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
    });
  }
  throw new Error(`Unsupported AI provider: ${provider}`);
}

const baseModel = getModel();

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a recruiter. Generate 10 interview questions (three Easy, three Intermediate, four Advanced) based on the provided role description. Return only a JSON array of questions with 'question' and 'difficulty' fields.",
  ],
  [
    "human",
    "Role Description: {roledescription}\nGenerate 10 interview questions with varying difficulty levels.",
  ],
]);

app.all("/api/generate-question", async (req, res) => {
  try {
    const roledescription =
      req.method === "GET" ? req.query.job_role : req.body?.job_role;

    if (!roledescription || typeof roledescription !== "string") {
      return res.status(400).json({ error: "Role Description is required" });
    }

    // Ask model to emit exactly the schema (JS object already parsed)
    const modelWithSchema = baseModel.withStructuredOutput(QuestionSchema, {
      name: "extracted_questions",
      strict: true,
    });

    const chain = prompt.pipe(modelWithSchema);
    const result = await chain.invoke({ roledescription });

    const parsed = QuestionSchema.safeParse(result);
    if (!parsed.success) {
      return res.status(502).json({
        error: "Model returned invalid schema",
        details: parsed.error.flatten(),
      });
    }

    res.json(parsed.data);
  } catch (err) {
    console.error("Error generating interview questions:", err);
    res.status(500).json({ error: "Failed to generate interview questions, ensure role description and interview is added first." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));