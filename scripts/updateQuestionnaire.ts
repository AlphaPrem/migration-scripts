// src/seedCustomers.ts
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { questionnaires } from "../data/questionnaire"; // Import the static list of customers
import logger from "../lib/logger/logger";

const prisma = new PrismaClient();

async function main() {
  const IDS: string[] = [];

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
    ({ dob, createdAt, updatedAt, Id, ...rest }: any) => {
      return {
        ...rest,
        DOB: new Date(dob).toISOString(),
        createdAt: new Date(createdAt),
        version: "3",
        // updatedAt: new Date(updatedAt),
      };
    }
  );

  logger.info(
    "Data to be inserted:",
    processedQuestionnaires.length,
    "records."
  );

  //   console.log(processedQuestionnaires);

  const created = await prisma.$transaction(
    async (tx) => {
      const results = [];

      for (const data of processedQuestionnaires) {
        logger.info(`Processing questionnaire for barcode: ${data.kitCode}`);
        const updatedRecord = await tx.sampleCollectionData.update({
          where:{
            kitCode:data.kitCode
          },
          data:{
            version:"3"
          }
        });

        results.push(updatedRecord);

        logger.info("✅ Questionnaire updated:", );
        IDS.push(updatedRecord.id);
      }

      return results;
    },
    {
      timeout: 60000 * 2, // 120 seconds timeout
    }
  );

  // 3️⃣  Extract the IDs only.
  const ids = created.map((c: any) => c.id);

  writeFileSync(
    "./modified/questionnaire/updated_questionnaires.json",
    JSON.stringify(created, null, 2)
  );
  writeFileSync(
    "./modified/questionnaire/updated_questionnaires_id.json",
    JSON.stringify(ids, null, 2)
  );
  writeFileSync(
    "./modified/questionnaire/ids_updated_backup.json",
    JSON.stringify(IDS, null, 2)
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
