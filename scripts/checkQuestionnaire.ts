import { PrismaClient } from "@prisma/client";
import { appendFileSync, writeFileSync } from "fs";
import { barcodes, existing_quesitonnaire_barcodes } from "../barcodes"; // Import the static list of barcodes

const logFilePath = "./output/match_log.txt";
const prisma = new PrismaClient();

async function main() {
  const matchedBarcodes: any[] = [];
  const notMatchedBarcodes: string[] = [];

  let total = 0;

  let labFlag: boolean = false;

  for (const code of existing_quesitonnaire_barcodes) {
    // const questionnaire = await prisma.sampleCollectionData.findFirst({
    //   where: {
    //     kitCode: code,
    //   },
    //   select: {
    //     id: true,
    //   },
    // });

    labFlag = true;
    const labProcesses = await prisma.labProcess.findFirst({
      where: {
        sampleCollectionData: {
          kitCode: code,
        },
      },
    });

    if (labProcesses) {
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

  const nullQuestionnaireCount = matchedBarcodes.reduce(
    (count, { questionnaireID }) => count + (questionnaireID == null ? 1 : 0),
    0
  );

  if (labFlag) {
    writeFileSync("./lab/found.json", JSON.stringify(matchedBarcodes, null, 2));
    writeFileSync(
      "./lab/not_found.json",
      JSON.stringify(notMatchedBarcodes, null, 2)
    );
  } else {
    writeFileSync(
      "./questionnaire/found.json",
      JSON.stringify(matchedBarcodes, null, 2)
    );
    writeFileSync(
      "./questionnaire/not_found.json",
      JSON.stringify(notMatchedBarcodes, null, 2)
    );
  }
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
