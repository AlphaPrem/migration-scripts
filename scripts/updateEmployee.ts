// src/seedCustomers.ts
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import logger from "../lib/logger/logger";
import { failedLabs } from "../data/lab";

const prisma = new PrismaClient();

interface OutwardDataFormat {
  Shopify_Kit_Id__c: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

const oldUserID = "63f0b8c3d4e2f5a1b2c3d4e5";
const newUserID = "686518760b6486d468930a2e";

async function main() {
  if (failedLabs.length === 0) {
    console.warn("No customer data supplied ‑ nothing to seed.");
    return;
  }

  const ids: string[] = [];

  let validate: boolean = true;

  /**
   * `prisma.$transaction` ensures that either
   * *all* documents are inserted or *none* are.
   * (Requires MongoDB 4.2+ on a replica‑set or sharded cluster.)
   */
  const created = await prisma.$transaction(async (tx) => {
    for (const code of failedLabs) {
      try {
        //   await tx.sampleCollectionData.updateMany({
        //     where: { createdBy: oldUserID },
        //     data: {
        //       createdBy: newUserID,
        //     },
        //   });

        //   await tx.dNA.updateMany({
        //     where: { employeeId: oldUserID },
        //     data: {
        //       employeeId: newUserID,
        //     },
        //   });

        //   await tx.gelElectrophoresis.updateMany({
        //     where: { employeeId: oldUserID },
        //     data: {
        //       employeeId: newUserID,
        //     },
        //   });

        //   await tx.libraryPreparation.updateMany({
        //     where: { employeeId: oldUserID },
        //     data: {
        //       employeeId: newUserID,
        //     },
        //   });

        //   await tx.libraryPooling.updateMany({
        //     where: { employeeId: oldUserID },
        //     data: {
        //       employeeId: newUserID,
        //     },
        //   });

        //   await tx.sequencing.updateMany({
        //     where: { employeeId: oldUserID },
        //     data: {
        //       employeeId: newUserID,
        //     },
        //   });

        //   await tx.sequencingEnd.updateMany({
        //     where: { employeeId: oldUserID },
        //     data: {
        //       employeeId: newUserID,
        //     },
        //   });

        //   await tx.dataTransferToBioinformatics.updateMany({
        //     where: { employeeId: oldUserID },
        //     data: {
        //       employeeId: newUserID,
        //     },
        //   });

        //   await tx.sampleCollectionData.updateMany({
        //     where: { pic: oldUserID },
        //     data: {
        //       createdById: newUserID,
        //     },
        //   });

        const inward = await tx.inward.findFirst({
          where: {
            inventory: {
              barcode: code.Sample_Tube_Barcode_Text__c,
            },
          },
          select: {
            inventoryId: true,
            createdAt: true,
          },
        });

        if (!inward || typeof inward.inventoryId !== "string") {
          logger.error(
            "No inward found for: ",
            code.Sample_Tube_Barcode_Text__c
          );
          continue;
        }

        await tx.outward.updateMany({
          where: {
            inventoryId: inward?.inventoryId,
          },
          data: {
            createdAt: inward?.createdAt,
          },
        });

        logger.info(
          `Updated outward successfully for: `,
          code.Sample_Tube_Barcode_Text__c
        );
      } catch (error) {
        logger.error(`❌ Error updating record`, error);
      }
    }
  });

  //   writeFileSync(
  //     "./modified/modified_outward.json",
  //     JSON.stringify(created, null, 2)
  //   );
  //   writeFileSync(
  //     "./modified/modified_outward_id.json",
  //     JSON.stringify(ids, null, 2)
  //   );
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
