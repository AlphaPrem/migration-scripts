import { PrismaClient } from "@prisma/client";
import { appendFileSync, writeFileSync } from "fs";
import { customers } from "../data/customers"; // Import the static list of barcodes

const logFilePath = "./output/match_log.txt";

const prisma = new PrismaClient();

async function main() {
  const matchedBarcodes: any[] = [];
  const notMatchedBarcodes: string[] = [];

  for (const code of customers) {
    const hit = await prisma.customer.findUnique({
      where: {
        email: code.Shopify_Email__c || "N/A", // Use email as the unique identifier
      },
      select: { id: true, email: true },
    });

    if (hit) {
      matchedBarcodes.push({ id: hit.id, email: hit.email });
      const logMsg = `✅ ${code.Shopify_Email__c} → match #${matchedBarcodes.length}`;
      console.log(logMsg);
      appendFileSync(logFilePath, logMsg + "\n");
    } else {
      notMatchedBarcodes.push(code.Shopify_Email__c || "N/A");
      console.log(`❌ ${code.Shopify_Email__c} → no match`);
    }
  }

  writeFileSync(
    "./customer/existing_customers.json",
    JSON.stringify(matchedBarcodes, null, 2)
  );
  writeFileSync(
    "./customer/non_existing_customers.json",
    JSON.stringify(notMatchedBarcodes, null, 2)
  );
  console.log(
    `📄 existing_barcodes.json written with ${matchedBarcodes.length} matches, not matching barcodes: ${notMatchedBarcodes.length}`
  );
}

main()
  .catch((err) => {
    console.error("❌ Error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
