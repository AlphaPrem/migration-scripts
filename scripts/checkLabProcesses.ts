import { PrismaClient } from "@prisma/client";
import { appendFileSync, writeFileSync } from "fs";
import { barcodes } from "../barcodes"; // Import the static list of barcodes

const logFilePath = "./output/match_log.txt";
const prisma = new PrismaClient();

async function main() {
  const matchedBarcodes: any[] = [];
  const notMatchedBarcodes: string[] = [];

  let total = 0;

  for (const code of barcodes) {
    const hit = await prisma.labProcess.findUnique({
      where: {
        sampleTubeBarCode: code,
      },
      select: {
        id: true,
      },
    });

    if (hit) {
      matchedBarcodes.push(code);
      total += 1;
      const logMsg = `✅ ${code} → match #${matchedBarcodes.length}`;
      console.log(logMsg);
      appendFileSync(logFilePath, logMsg + "\n");
    } else {
      notMatchedBarcodes.push(code);
      console.log(`❌ ${code} → no match`);
    }
  }

  // const nullQuestionnaireCount = matchedBarcodes.reduce(
  //   (count, { questionnaireID }) => count + (questionnaireID == null ? 1 : 0),
  //   0
  // );
  writeFileSync(
    "./output/existing.json",
    JSON.stringify(matchedBarcodes, null, 2)
  );
  writeFileSync(
    "./output/non_existing.json",
    JSON.stringify(notMatchedBarcodes, null, 2)
  );
  console.log(
    `📄 existing_barcodes.json written with ${total} matches., not filled questionnaires}`
  );
}

main()
  .catch((err) => {
    console.error("❌ Error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
