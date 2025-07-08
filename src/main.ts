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
import {
  createGelElectrophoresis,
  updateGelElectrophoresis,
} from "../src/mutations/gelElectrophoresis";
import {
  IcreateLibraryPreparationInput,
  ILibraryPreparationUpdateInput,
} from "../src/types/libraryPreparation";
import {
  createLibraryPreparation,
  updateLibraryPreparation,
} from "../src/mutations/libraryPreparation";
import {
  IcreateLibraryPoolingInput,
  ILibraryPoolingUpdateInput,
} from "../src/types/libraryPooling";
import {
  createLibraryPooling,
  updateLibraryPooling,
} from "../src/mutations/libraryPooling";
import {
  ISequencingCreateInput,
  ISequencingUpdateInput,
} from "../src/types/startSequencing";
import {
  connectSequencing,
  createSequencing,
  updateSequencing,
} from "../src/mutations/startSequencing";
import {
  IcreateSequencingEndInput,
  ISequencingEndUpdateInput,
} from "../src/types/endSequencing";
import {
  connectSequencingEnd,
  createENDSequencing,
  updateENDSequencing,
} from "../src/mutations/endSequencing";
import { IDataTransferToBioinformaticsInput } from "../src/types/dataTransferToBioinformatics";
import { createDataTransferToBioinformatics } from "./mutations/dataTransferToBioinformatics";
import {
  IBioInfoQCInput,
  IBioInfoQcStatusInput,
} from "./types/bioInformaticsQC";
import {
  startBioInformaticsQC,
  updateBioInformaticsQC,
} from "./mutations/bioInformaticsQC";
import logger from "../lib/logger/logger";
import { UpdateSampleCollectionInward } from "./mutations/updateSampleCollectionInward";
import { IUpdateGelElectrophoresisUpdateInput } from "./types/gelElectrophoresis";

const prisma = new PrismaClient();

const status = {
  libPrep: "accepted",
  libPool: "accepted",
  seqStart: "accepted",
  seqEnd: "accepted",
};

const machine = {
  a9QIU000000fyCI2AY: "65436bc97d66af58a5027cf6",
  a9QIU000000fyCa2AI: "65436bd17d66af58a5027cf7",
};

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
      const questionnaire = await prisma.sampleCollectionData.findUnique({
        where: {
          kitCode: lab.Sample_Tube_Barcode_Text__c,
        },
        select: {
          id: true,
        },
      });

      const inventory = await prisma.inventory.findUnique({
        where: {
          barcode: lab.Sample_Tube_Barcode_Text__c,
        },
        select: { id: true },
      });

      if (!questionnaire || !inventory) {
        logger.warn(
          `⚠️ No questionnaire found for kit code ${lab.Kit_ID_text__c}. Skipping lab ${lab.Lab_Name}.`
        );
        continue; // Skip to the next lab if no questionnaire is found
      }

      // Step - 1: Create the lab inward data
      const inwardData: ILabInwardInput = {
        fridgeLocation: lab.Fridge_Location__c,
        inventoryId: inventory?.id,
        labInward: true,
        remark: "",
        sampleTubeBarCode: lab.Sample_Tube_Barcode_Text__c,
        userId: USERID, // Use the constant defined above
        weight: lab.Weight__c.toString(), // Convert weight to string
      };

      const inward = await createLabInward(inwardData);

      const updateRef = await UpdateSampleCollectionInward(
        questionnaire.id,
        inward.id
      );

      // step - 2": create lab process
      const labProcessData: ILabProcessInput = {
        createdById: USERID, // Use the constant defined above
        status: "sampleEntryProcess",
        sampleCollectionId: questionnaire.id, // Use the ID from the created inward
        remark: lab.Lab_Process_Remark__c || "",
      };

      const labProcess = await createLabProcess(labProcessData);

      // step - 3: Update inward with lab process ID
      const dnaInput: IDNAInput = {
        qcStatus: "pending",
        employeeId: USERID, // Use the constant defined above
        statusLog: [],
        kitName: lab.Extraction_Kit_Name__c, // TOBE CHANGED
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
        remark: lab.GEL_Remark__c || "",
        score: 0,
        status: "inProcess",
        employeeId: USERID, // Use the constant defined above
        customerId: "", //used to send email notification
      };

      const gelElectrophoresis = await createGelElectrophoresis(
        gelElectrophoresisInput,
        labProcess.id
      );

      const updateGelElectrophoresisInput: IUpdateGelElectrophoresisUpdateInput =
        {
          status: lab.GEL_Status1__c === "Approved" ? "accepted" : "rejected",
          remark: lab.GEL_Remark__c || "",
          score: lab.Score__c,
          statusLog: [
            {
              remark: lab.GEL_Remark__c || "",
              status:
                lab.GEL_Status1__c === "Approved" ? "approved" : "rejected",
              score: lab.Score__c.toString(), // Convert score to string
              createdAt: new Date().toISOString(), // Use current date
            },
          ],
        };

      const updatedGelElectrophoresis = await updateGelElectrophoresis(
        updateGelElectrophoresisInput,
        gelElectrophoresis.id
      );

      // step - 5: library preparation
      const libPrepInput: IcreateLibraryPreparationInput = {
        kitName: lab.LibPrep_Name, // TOBE CHANGED
        flowCellID: "Other",
        labKitPreparationName: "",
        employeeId: USERID, // Use the constant defined above
        libraryPreparationBarcode: `NB${lab.NB__c}`,
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
        status: status.libPrep, // Use the constant defined above
      };

      const updatedLibraryPreparation = await updateLibraryPreparation(
        updateLibraryPreparationInput,
        libraryPreparation.id
      );

      // step - 6: library pooling

      const libPoolInput: IcreateLibraryPoolingInput = {
        employeeId: USERID, // Use the constant defined above
      };

      const libraryPooling = await createLibraryPooling(
        libPoolInput,
        labProcess.id
      );

      const libPoolUpdateInput: ILibraryPoolingUpdateInput = {
        adapterLigation: lab.Adapter_Ligation__c.toString(), // Convert to string
        finalQubitReadings: lab.Final_Qubit__c.toString(), // Convert to string
        status: status.libPool,
      };

      const updatedLibraryPooling = await updateLibraryPooling(
        libPoolUpdateInput,
        libraryPooling.id
      );

      // step - 7: sequencing start

      if (!(lab.Sequence_Machine_Name__c in machine)) {
        logger.error(
          `Machine id is not defined in machine array constant object. ID: ${lab.Sequence_Machine_Name__c}`
        );
        return; // or handle the error as appropriate
      }

      const seqStartInput: ISequencingCreateInput = {
        employeeId: USERID, // Use the constant defined above
        cellId: "Other",
        sequencingMasterId:
          machine[lab.Sequence_Machine_Name__c as keyof typeof machine] || "", // Use the constant defined above
      };

      const sequencingStart = await createSequencing(
        seqStartInput,
        labProcess.id
      );

      await connectSequencing(labProcess.id, sequencingStart.id);

      const updateSequencingStartInput: ISequencingUpdateInput = {
        numberOfActiveSpores: lab.Number_Of_Active_Pores_sequencing_start__c,
        status: status.seqStart,
        remarks: lab.Remarks_sequencing_start__c || "",
      };

      const updatedSequencingStart = await updateSequencing(
        updateSequencingStartInput,
        sequencingStart.id
      );

      // step - 8: sequencing end

      const seqEndInput: IcreateSequencingEndInput = {
        employeeId: USERID, // Use the constant defined above
      };

      const sequencingEnd = await createENDSequencing(
        seqEndInput,
        labProcess.id
      );

      await connectSequencingEnd(labProcess.id, sequencingEnd.id);

      const updateSequencingEndInput: ISequencingEndUpdateInput = {
        numberOfActiveSpores: lab.Number_Of_Active_Pores__c,
        numberOfPassedReads: lab.Number_Of_Passed_Bases__c,
        numberOfFailedReads: lab.Number_Of_Failed_Bases__c,
        N50: lab.N50__c,
        status: status.seqEnd,
        remarks: lab.SeqEnd_Remark__c || "",
        totalDataGenerate: lab.Total_Data_Generated__c.toString(), // Convert to string
      };

      const updatedSequencingEnd = await updateENDSequencing(
        updateSequencingEndInput,
        sequencingEnd.id
      );

      //step - 9: data transfer to bioinformatics
      const dataTransferInput: IDataTransferToBioinformaticsInput = {
        employeeId: USERID, // Use the constant defined above
        modeOfDataTransfer: lab.Mode_of_Data_Transfer__c,
        remarks: lab.Remarks_Data_Transfer__c || "",
        barcode: lab.Kit_ID_text__c,
        extractionDate: new Date(lab.DataTrans_CreatedDate).toISOString(),
        firstRatio: lab.X1st_Ratio_260_280__c,
        secondRatio: lab.X2nd_Ratio_260_230__c,
        kitName: lab.Extraction_Kit_Name__c,
        nanoDropConcentration: lab.Concentration__c.toString(), // Convert to string
        qubitConcentration: lab.Final_Qubit__c,
        quantity: lab.Weight__c.toString(), // lab weight is quantity
        repeatNo: 0,
      };

      const dataTransfer = await createDataTransferToBioinformatics(
        dataTransferInput,
        labProcess.id
      );

      // step - 10: start sequencing
      const startBioInformaticsQCInput: IBioInfoQCInput = {
        id: questionnaire.id,
        userID: USERID, // Use the constant defined above
        noOfBases: lab.Number_of_Bases__c.toString(), // Convert to string
        noOfReads: lab.Number_of_Reads__c.toString(), // Convert to string
        meanReadLength: lab.Mean_Read_Length__c.toString(), // Convert to string
        dataSize: lab.Data_Size__c.toString(), // Convert to string
      };

      const bioInformaticsQC = await startBioInformaticsQC(
        startBioInformaticsQCInput
      );

      const updateBioInformaticsQCInput: IBioInfoQcStatusInput = {
        id: questionnaire.id,
        QCstatus: lab.QC_Status__c === "Approved" ? "Approve" : "rejected",
      };

      const updatedBioInformaticsQC = await updateBioInformaticsQC(
        updateBioInformaticsQCInput
      );

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
