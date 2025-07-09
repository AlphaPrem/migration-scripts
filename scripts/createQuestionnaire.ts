// src/seedCustomers.ts
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { questionnaires } from "../data/questionnaire"; // Import the static list of customers

const prisma = new PrismaClient();

async function main() {
  if (questionnaires.length === 0) {
    console.warn("No customer data supplied ‑ nothing to seed.");
    return;
  }

  /**
   * `prisma.$transaction` ensures that either
   * *all* documents are inserted or *none* are.
   * (Requires MongoDB 4.2+ on a replica‑set or sharded cluster.)
   */

  const processedQuestionnaires = questionnaires.map(
    ({ dob, createdAt, ...rest }: any) => {
      return {
        ...rest,
        DOB: new Date(dob).toISOString(),
        createdAt: new Date(createdAt),
      };
    }
  );

  //   console.log(processedQuestionnaires);

  const created = await prisma.$transaction(async (tx) =>
    Promise.all(
      processedQuestionnaires.map((data: any) =>
        tx.sampleCollectionData.create({
          data: data,
        })
      )
    )
  );

  // 3️⃣  Extract the IDs only.
  const ids = created.map((c: any) => c.id);

  writeFileSync(
    "./questionnaire/created_questionnaires.json",
    JSON.stringify(created, null, 2)
  );
  writeFileSync(
    "./questionnaire/created_questionnaires_id.json",
    JSON.stringify(ids, null, 2)
  );
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
