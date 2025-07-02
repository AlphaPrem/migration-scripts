// src/seedCustomers.ts
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { customers } from "../data/customers"; // Import the static list of customers

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
    Promise.all(
      customers.map((data) =>
        tx.customer.create({
          data: {
            name: data.Patient_Name__c,
            gender: data.Shopify_Gender__c,
            createdAt: new Date(data.CreatedDate),
            updatedAt: new Date(data.LastModifiedDate),
            dob: data.Shopify_DOB__c
              ? new Date(data.Shopify_DOB__c).toISOString()
              : "N/A",
            email: data.Shopify_Email__c || "N/A",
            verification: true,
            phone: data.Shopify_Phone__c || null,
          },
        })
      )
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
