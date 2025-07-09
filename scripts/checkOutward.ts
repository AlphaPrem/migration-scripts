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
    const hit = await prisma.outward.findFirst({
      where: {
        inventory: {
          barcode: code,
        },
      },
      select: {
        id: true,
        inventoryId: true,
        inwardId: true,
      },
    });

    // const inward = await prisma.inward.findFirst({
    //   where: {
    //     inventory: {
    //       barcode: {
    //         endsWith: code,
    //         mode: "insensitive", // drop this line for case-sensitive search
    //       },
    //     },
    //   },
    //   select: {
    //     id: true,
    //   },
    // });

    // const questionnaire = await prisma.sampleCollectionData.findFirst({
    //   where: {
    //     kitCode: {
    //       endsWith: code,
    //       mode: "insensitive", // drop this line for case-sensitive search
    //     },
    //   },
    //   select: {
    //     id: true,
    //   },
    // });

    if (hit) {
      const obj = {
        inventoryID: hit.inventoryId || null,
        outwardID: hit.id || null,
        // inwardID: inward?.id || null,
        // questionnaireID: questionnaire?.id || null,
        barcode: code,
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

  // const nullQuestionnaireCount = matchedBarcodes.reduce(
  //   (count, { questionnaireID }) => count + (questionnaireID == null ? 1 : 0),
  //   0
  // );
  writeFileSync(
    "./output/outward/outwarded_barcodes.json",
    JSON.stringify(matchedBarcodes, null, 2)
  );
  writeFileSync(
    "./output/outward/non_outwarded_barcodes.json",
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
