// src/seedCustomers.ts
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";

const customers = [
  {
    BARCODE__c: "000038985",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-01-18 08:30:11",
  },
  {
    BARCODE__c: "000039242",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:26",
  },
  {
    BARCODE__c: "000039289",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:27",
  },
  {
    BARCODE__c: "000039535",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:26",
  },
  {
    BARCODE__c: "000039342",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:26",
  },
  {
    BARCODE__c: "000039252",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:27",
  },
  {
    BARCODE__c: "000039370",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:26",
  },
  {
    BARCODE__c: "000039101",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:26",
  },
  {
    BARCODE__c: "000039294",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:27",
  },
  {
    BARCODE__c: "000039646",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:27",
  },
  {
    BARCODE__c: "000039088",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:28",
  },
  {
    BARCODE__c: "000039432",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:28",
  },
  {
    BARCODE__c: "000039020",
    CreatedDate: "2024-12-13 11:42:54",
    LastModifiedDate: "2025-03-24 05:59:29",
  },
  {
    BARCODE__c: "000251751",
    CreatedDate: "2024-12-21 08:10:17",
    LastModifiedDate: "2025-03-24 05:59:27",
  },
];
// Import the static list of customers

const prisma = new PrismaClient();

async function main() {
  if (customers.length === 0) {
    console.warn("No customer data supplied ‑ nothing to seed.");
    return;
  }

  /**
   * `prisma.$transaction` ensures that either
   * *all* documents are inserted or *none* are.
   * (Requires MongoDB 4.2+ on a replica‑set or sharded cluster.)
   */
  const created = await prisma.$transaction(async (tx) =>
    customers.map(async (data) => {
      const updatedInventory = await tx.inventory.update({
        where: { barcode: data.BARCODE__c },
        data: {
          createdAt: new Date(data.CreatedDate),
          updatedAt: new Date(data.LastModifiedDate),
        },
      });

      // 2️⃣  Update every inward row that points to that inventory
      await tx.inward.updateMany({
        where: { inventoryId: updatedInventory.id },
        data: {
          createdAt: new Date(data.CreatedDate),
          updatedAt: new Date(data.LastModifiedDate),
        },
      });

      return updatedInventory;
    })
  );

  // 3️⃣  Extract the IDs only.
  const ids = created.map((c: any) => c.id);

  writeFileSync(
    "./output/created_customers.json",
    JSON.stringify(created, null, 2)
  );
  writeFileSync(
    "./output/created_customers_id.json",
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
