// src/seedCustomers.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { labs } from "../output/data/process"; // Import the static list of customers

async function main() {
  if (labs.length === 0) {
    console.warn("No customer data supplied ‑ nothing to seed.");
    return;
  }

  /**
   * `prisma.$transaction` ensures that either
   * *all* documents are inserted or *none* are.
   * (Requires MongoDB 4.2+ on a replica‑set or sharded cluster.)
   */
  const created = await prisma.$transaction(async (tx) =>
    Promise.all(
      labs.map(async (data: any) => {
        const inventory = await tx.inventory.findUnique({
          where: {
            barcode: data.sampleTubeBarCode,
          },
          //   select: {
          //     id: true,
          //   },
        });

        if (!inventory) {
          console.warn(
            `Inventory with barcode ${data.sampleTubeBarCode} not found.`
          );
          return null; // Skip this entry if inventory is not found
        }

        const inward = await tx.inward.create({
          data: {
            inventoryId: inventory?.id,
            fridgeLocation: data.fridge,
            remark: data.remark,
            labInward: true,
            weight: data.weight,
            sampleTubeBarCode: data.sampleTubeBarCode,
            userId: USERID, // migration user ID
          },
        });

        const process = tx.labProcess.create({
          data: {
            createdBy: USERID, // migration user ID,
          },
        });

        return process;
      })
    )
  );

  // 3️⃣  Extract the IDs only.
  const ids = created.map((c) => c.id);

  writeFileSync(
    "./customer/created_customers.json",
    JSON.stringify(created, null, 2)
  );
  writeFileSync(
    "./customer/created_customers_id.json",
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
