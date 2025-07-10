// src/seedCustomers.ts
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { existing_quesitonnaire_barcodes } from "../data/barcodes";
import logger from "../lib/logger/logger";

const prisma = new PrismaClient();

async function main() {
  const IDS: string[] = [];

  if (existing_quesitonnaire_barcodes.length === 0) {
    console.warn("No customer data supplied ‑ nothing to seed.");
    return;
  }

  //   console.log(processedQuestionnaires);

  const created = await prisma.$transaction(
    async (tx) => {
      const results: any[] = [];

      for (const data of existing_quesitonnaire_barcodes) {
        logger.info(`Processing questionnaire for barcode: ${data}`);
        const updatedRecord = await tx.sampleCollectionData.update({
          where: {
            id: data,
          },
          data: {
            version: "3",
          },
        });

        results.push(updatedRecord);

        logger.info("✅ Questionnaire updated: ", data);
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

  // writeFileSync(
  //   "./modified/questionnaire/updated_questionnaires.json",
  //   JSON.stringify(created, null, 2)
  // );
  // writeFileSync(
  //   "./modified/questionnaire/updated_questionnaires_id.json",
  //   JSON.stringify(ids, null, 2)
  // );
  // writeFileSync(
  //   "./modified/questionnaire/ids_updated_backup.json",
  //   JSON.stringify(IDS, null, 2)
  // );
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
