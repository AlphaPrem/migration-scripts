// src/seedCustomers.ts
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { outwards } from "../data/outward";
import logger from "../lib/logger/logger";

const prisma = new PrismaClient();

interface OutwardDataFormat {
  Shopify_Kit_Id__c: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

async function main() {
  if (outwards.length === 0) {
    console.warn("No customer data supplied ‑ nothing to seed.");
    return;
  }

  let validate: boolean = true;

  outwards.forEach((data: OutwardDataFormat) => {
    if (
      !data.Shopify_Kit_Id__c ||
      data.CreatedDate === undefined ||
      data.LastModifiedDate === undefined
    ) {
      logger.error("Missing BARCODE__c in data:", data);
      validate = false;
    }
  });

  if (!validate) {
    logger.error(
      "Validation failed: Some data is missing BARCODE__c, createdAt, or updatedAt."
    );
    return;
  }

  /**
   * `prisma.$transaction` ensures that either
   * *all* documents are inserted or *none* are.
   * (Requires MongoDB 4.2+ on a replica‑set or sharded cluster.)
   */
  const created = await prisma.$transaction(async (tx) =>
    Promise.all(
      outwards.map(async (data: OutwardDataFormat) => {
        const inventory = await tx.inventory.findUnique({
          where: { barcode: data.Shopify_Kit_Id__c },
          select: {
            id: true,
          },
        });

        if (!inventory) {
          logger.warn(
            `No inventory found for barcode: ${data.Shopify_Kit_Id__c}`
          );
          return null; // Skip if no inventory found
        }

        logger.info(
          `Processing outward for inventory: ${inventory.id} with barcode: ${data.Shopify_Kit_Id__c}`
        );

        const updatedInventory = await tx.outward.updateMany({
          where: { inventoryId: inventory.id },
          data: {
            createdAt: new Date(data.CreatedDate),
            updatedAt: new Date(data.LastModifiedDate),
          },
        });

        logger.info(
          `Updated outward for inventory: ${inventory.id} with barcode: ${data.Shopify_Kit_Id__c}`
        );

        return updatedInventory;
      })
    )
  );

  // 3️⃣  Extract the IDs only.
  const ids = created.map((c: any) => c.id);

  writeFileSync(
    "./modified/modified_outward.json",
    JSON.stringify(created, null, 2)
  );
  writeFileSync(
    "./modified/modified_outward_id.json",
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
