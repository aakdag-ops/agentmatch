import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const db = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const agents = await db.agent.findMany({ where: { status: "active" } });
  console.log(`Embedding ${agents.length} agents...`);
  for (const agent of agents) {
    const caps = (agent.capabilities as Array<{ text: string }> | null) ?? [];
    const weaks = (agent.weaknesses as Array<{ text: string }>) ?? [];
    const text = [
      agent.name,
      agent.vendor,
      agent.tagline,
      agent.description.slice(0, 1200),
      `Categories: ${agent.categoryTags.join(", ")}`,
      `Industries: ${agent.industryTags.join(", ")}`,
      `Capabilities: ${caps.map((c) => c.text).join("; ")}`,
      `Limitations: ${weaks.map((w) => w.text).join("; ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    const embedding = res.data[0].embedding;
    const vector = `[${embedding.join(",")}]`;
    await db.$executeRaw`
      INSERT INTO agent_embeddings (agent_id, embedding)
      VALUES (${agent.id}::uuid, ${vector}::vector)
      ON CONFLICT (agent_id) DO UPDATE SET embedding = EXCLUDED.embedding, updated_at = now()
    `;
    process.stdout.write(".");
  }
  console.log("\n✅ All embeddings generated!");
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
