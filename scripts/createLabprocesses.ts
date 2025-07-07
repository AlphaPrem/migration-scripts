// src/seedCustomers.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { labProcessData as labs } from "../data/lab";
import { createLabInward } from "../src/mutations/createLabInward";
import { ILabInwardInput } from "../src/types/labInward";
import { ILabProcessInput } from "../src/types/labProcess";
import { createLabProcess } from "../src/mutations/createLabProcess";
import { createDNA, updateDNA } from "../src/mutations/DNA";
import { IDNAInput } from "../src/types/dna";
import { createGelElectrophoresis } from "../src/mutations/gelElectrophoresis";
import {
  IcreateLibraryPreparationInput,
  ILibraryPreparationUpdateInput,
} from "../src/types/libraryPreparation";
import {
  createLibraryPreparation,
  updateLibraryPreparation,
} from "../src/mutations/libraryPreparation";

const prisma = new PrismaClient();

// 1️⃣  Use a constant for the migration user ID
export const USERID = "63f0b8c3d4e2f5a1b2c3d4e5"; // Replace with the actual user ID

async function main() {
  const createdLabProcessIds: string[] = [];

  if (labs.length === 0) {
    console.warn("No customer data supplied ‑ nothing to seed.");
    return;
  }

  /**
   * `prisma.$transaction` ensures that either
   * *all* documents are inserted or *none* are.
   * (Requires MongoDB 4.2+ on a replica‑set or sharded cluster.)
   */
  // 3️⃣  Extract the IDs only.
  for (const lab of labs) {
    try {
      // step - 0: data gathering
      const questionnaire = await prisma.sampleCollectionData.findFirst({
        where: {
          kitCode: lab.Kit_ID_text__c,
        },
        select: {
          id: true,
        },
      });

      if (!questionnaire) {
        console.warn(
          `⚠️ No questionnaire found for kit code ${lab.Kit_ID_text__c}. Skipping lab ${lab.Lab_Name}.`
        );
        continue; // Skip to the next lab if no questionnaire is found
      }

      // Step - 1: Create the lab inward data
      const inwardData: ILabInwardInput = {
        fridgeLocation: lab.Fridge_Location__c,
        inventoryId: lab.Sample_Tube_Barcode_Text__c,
        labInward: true,
        remark: lab.Lab_Process_Remark__c || "",
        sampleTubeBarCode: lab.Sample_Tube_Barcode_Text__c,
        userId: USERID, // Use the constant defined above
        weight: lab.Weight__c.toString(), // Convert weight to string
      };

      const inward = await createLabInward(inwardData);

      // step - 2": create lab process
      const labProcessData: ILabProcessInput = {
        createdById: USERID, // Use the constant defined above
        status: lab.Current_Status__c,
        sampleCollectionId: questionnaire?.id, // Use the ID from the created inward
        remark: lab.Lab_Process_Remark__c || "",
      };

      const labProcess = await createLabProcess(labProcessData);

      // step - 3: Update inward with lab process ID
      const dnaInput: IDNAInput = {
        qcStatus: lab.DNA_Status__c,
        employeeId: USERID, // Use the constant defined above
        statusLog: [],
        kitName: lab.Extraction_Kit_Name__c,
        customerId: "", //used to send email notification
      };

      const dna = await createDNA(dnaInput, labProcess.id);

      const updateDNAInput = {
        qcStatus: lab.DNA_Status__c,
        labId: lab.DNA_Name,
        statusLog: [
          {
            status: lab.DNA_Status__c,
            remark: lab.DNA_Remark__c || "",
            date: new Date().toISOString(), // Use current date
            concentration: lab.Concentration__c.toString(), // Convert concentration to string
            firstRatio: lab.X1st_Ratio_260_280__c,
            secondRatio: lab.X2nd_Ratio_260_230__c,
            extractionLabID: lab.DNA_Name,
          },
        ],
      };

      const updateDna = await updateDNA(updateDNAInput, dna.id);

      // step - 4: gel electrophoresis

      const gelElectrophoresisInput = {
        remark: lab.GEL_Remark__c,
        score: lab.Score__c,
        status: lab.GEL_Status1__c,
        employeeId: USERID, // Use the constant defined above
        customerId: "", //used to send email notification
      };

      const gelElectrophoresis = await createGelElectrophoresis(
        gelElectrophoresisInput,
        labProcess.id
      );

      // There is update gel electrophoresis function, but it is not used in this script.

      // step - 5: library preparation
      const libPrepInput: IcreateLibraryPreparationInput = {
        kitName: lab.LibPrep_Name,
        flowCellID: lab.LibPrep_Id,
        labKitPreparationName: lab.LibPrep_Name,
        employeeId: USERID, // Use the constant defined above
        libraryPreparationBarcode: lab.Sample_Tube_Barcode_Text__c,
      };

      const libraryPreparation = await createLibraryPreparation(
        libPrepInput,
        labProcess.id
      );

      const updateLibraryPreparationInput: ILibraryPreparationUpdateInput = {
        volumeOfDna: [
          {
            reading: parseFloat(lab.Volume_of_DNA__c),
            processId: libraryPreparation.id,
          },
        ],
        initialQubitReading: [
          {
            reading: parseFloat(lab.Initial_Sample_Qubit__c),
            processId: libraryPreparation.id,
          },
        ],
        postProcessQubitReading: [
          {
            reading: lab.After_End_Prep_Sample_Qubit__c,
            processId: libraryPreparation.id,
          },
        ],
        afterBarcodeLigationQubitReading: [
          {
            reading: lab.After_Barcode_Sample_Qubit__c,
            processId: libraryPreparation.id,
          },
        ],
        status: lab.LibPrep_Status__c,
      };

      const updatedLibraryPreparation = await updateLibraryPreparation(
        updateLibraryPreparationInput,
        libraryPreparation.id
      );

      // step - 6: library pooling

      return inward;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          `❌ Error creating lab inward for ${lab.Lab_Name}:`,
          error.message
        );
      }
      console.error(`❌ Error creating lab inward for ${lab.Lab_Name}:`, error);
      continue; // Skip to the next lab if an error occurs
    }
  }

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
