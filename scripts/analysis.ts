import { PrismaClient } from "@prisma/client";
import { appendFileSync, writeFileSync } from "fs";
import { barcodes } from "../barcodes"; // Import the static list of barcodes

const logFilePath = "./output/match_log.txt";
const prisma = new PrismaClient();

async function main() {
  const matchedBarcodes: any[] = [];
  const notMatchedBarcodes: string[] = [];
  const data: any[] = [];
  let total = 0;

  for (const code of barcodes) {
    const questionnaire = await prisma.sampleCollectionData.findUnique({
      where: {
        kitCode: code,
      },
    });

    const hit = await prisma.labProcess.findUnique({
      where: {
        sampleTubeBarCode: code,
      },
      select: {
        id: true,
      },
    });

    const outward = await prisma.outward.findFirst({
      where: {
        inventory: {
          barcode: code,
        },
      },
    });

    data.push({
      barcode: code,
      lab: hit ? true : false,
      qus: questionnaire ? true : false,
      outward: outward ? true : false,
    });
    
    if (hit || questionnaire || outward) {
      const obj = {
        barcode: code,
        questionnaire: questionnaire ? true : false,
        outward: outward ? true : false,
        lab: hit ? true : false,
      };
      matchedBarcodes.push(obj);
      total += 1;
      const logMsg = `✅ ${code} → match #${matchedBarcodes.length}`;
      console.log(logMsg);
      appendFileSync(logFilePath, logMsg + "\n");
    } else {
      notMatchedBarcodes.push(code);
      console.log(`❌ ${code} → no match`);
    }
  }

  writeFileSync(
    "./output/analysis/dataLokesh.json",
    JSON.stringify(data, null, 2)
  );

  const counts = matchedBarcodes.reduce(
    (acc, { questionnaire, lab, outward }) => {
      if (questionnaire) acc.questionnaire += 1;
      if (lab) acc.lab += 1;
      if (outward) acc.outward += 1;
      return acc;
    },
    { questionnaire: 0, lab: 0, outward: 0 }
  );

  console.log(counts);

  writeFileSync(
    "./output/analysis/existing.json",
    JSON.stringify(matchedBarcodes, null, 2)
  );
  writeFileSync(
    "./output/analysis/non_existing.json",
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
