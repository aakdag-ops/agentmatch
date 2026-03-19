import { PrismaClient } from "@prisma/client";
import { VoyageAIClient } from "voyageai";

const db = new PrismaClient();
const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY! });

// Free tier: 3 RPM / 10K TPM. Batches of 5 agents (~2K tokens) every 22s stays safe.
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 22_000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const agents = await db.agent.findMany({ where: { status: "active" } });
  console.log(`Embedding ${agents.length} agents in batches of ${BATCH_SIZE}...`);

  for (let start = 0; start < agents.length; start += BATCH_SIZE) {
    const batch = agents.slice(start, start + BATCH_SIZE);
    const texts = batch.map((agent) => {
      const caps = (agent.capabilities as Array<{ text: string }> | null) ?? [];
      const weaks = (agent.weaknesses as Array<{ text: string }>) ?? [];
      return [
        agent.name, agent.vendor, agent.tagline,
        agent.description.slice(0, 600),
        `Categories: ${agent.categoryTags.join(", ")}`,
        `Capabilities: ${caps.map((c) => c.text).slice(0, 3).join("; ")}`,
        `Limitations: ${weaks.map((w) => w.text).slice(0, 2).join("; ")}`,
      ].filter(Boolean).join("\n");
    });

    const res = await voyage.embed({
      model: "voyage-3-lite",
      input: texts,
      inputType: "document",
    });

    for (let i = 0; i < batch.length; i++) {
      const agent = batch[i];
      const embedding = res.data?.[i]?.embedding as number[] | undefined;
      if (!embedding) throw new Error(`No embedding at batch index ${i}`);
      const vector = `[${embedding.join(",")}]`;
      await db.$executeRaw`
        INSERT INTO agent_embeddings (id, "agentId", embedding, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${agent.id}::uuid, ${vector}::vector, now(), now())
        ON CONFLICT ("agentId") DO UPDATE SET embedding = EXCLUDED.embedding, "updatedAt" = now()
      `;
      process.stdout.write(".");
    }

    const done = Math.min(start + BATCH_SIZE, agents.length);
    console.log(` [${done}/${agents.length}]`);

    if (done < agents.length) {
      process.stdout.write(`  waiting ${BATCH_DELAY_MS / 1000}s for rate limit... `);
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`\n✅ All ${agents.length} embeddings generated with Voyage AI!`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
