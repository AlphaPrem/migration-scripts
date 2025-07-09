import { Prisma, PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { labProcessData as labs } from "../data/lab";
import { createLabInward } from "./mutations/createLabInward";
import { ILabInwardInput } from "./types/labInward";
import { ILabProcessInput } from "./types/labProcess";
import { createLabProcess } from "./mutations/createLabProcess";
import { createDNA, updateDNA } from "./mutations/DNA";
import { IDNAInput } from "./types/dna";
import {
  createGelElectrophoresis,
  updateGelElectrophoresis,
} from "./mutations/gelElectrophoresis";
import {
  IcreateLibraryPreparationInput,
  ILibraryPreparationUpdateInput,
} from "./types/libraryPreparation";
import {
  createLibraryPreparation,
  updateLibraryPreparation,
} from "./mutations/libraryPreparation";
import {
  IcreateLibraryPoolingInput,
  ILibraryPoolingUpdateInput,
} from "./types/libraryPooling";
import {
  createLibraryPooling,
  updateLibraryPooling,
} from "./mutations/libraryPooling";
import {
  ISequencingCreateInput,
  ISequencingUpdateInput,
} from "./types/startSequencing";
import {
  connectSequencing,
  createSequencing,
  updateSequencing,
} from "./mutations/startSequencing";
import {
  IcreateSequencingEndInput,
  ISequencingEndUpdateInput,
} from "./types/endSequencing";
import {
  connectSequencingEnd,
  createENDSequencing,
  updateENDSequencing,
} from "./mutations/endSequencing";
import { IDataTransferToBioinformaticsInput } from "./types/dataTransferToBioinformatics";
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
  a9QIU000000fyCI2AY: "686cf7ec518f421bbf5a6f86",
  a9QIU000000fyCa2AI: "686cf7f4518f421bbf5a6f88",
};

// 1️⃣  Use a constant for the migration user ID
export const USERID = "654b266eeb0f33d6abaecdf2"; // Replace with the actual user ID

async function main() {
  const final = [];

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
      const ids = [];
      const timeStamps = {
        Lab_CreatedDate: lab.Lab_CreatedDate,
        Lab_LastModifiedDate: lab.Lab_LastModifiedDate,
        Lab_Inward_Time__c: lab,
        DNA_CreatedDate: lab.DNA_CreatedDate,
        DNA_LastModifiedDate: lab.DNA_LastModifiedDate,
        GEL_CreatedDate: lab.GEL_CreatedDate,
        GEL_LastModifiedDate: lab.GEL_LastModifiedDate,
        LibPrep_CreatedDate: lab.LibPrep_CreatedDate,
        LibPrep_LastModifiedDate: lab.LibPrep_LastModifiedDate,
        LibPool_CreatedDate: lab.LibPool_CreatedDate,
        LibPool_LastModifiedDate: lab.LibPool_LastModifiedDate,
        PoolBatch_CreatedDate: lab.PoolBatch_CreatedDate,
        PoolBatch_LastModifiedDate: lab.PoolBatch_LastModifiedDate,
        SeqStart_CreatedDate: lab.SeqStart_CreatedDate,
        SeqStart_LastModifiedDate: lab.SeqStart_LastModifiedDate,
        SeqEnd_CreatedDate: lab.SeqEnd_CreatedDate,
        SeqEnd_LastModifiedDate: lab.SeqEnd_LastModifiedDate,
        DataTrans_CreatedDate: lab.DataTrans_CreatedDate,
        DataTrans_LastModifiedDate: lab.DataTrans_LastModifiedDate,
        QC_CreatedDate: lab.QC_CreatedDate,
        QC_LastModifiedDate: lab.QC_LastModifiedDate,
      };

      const questionnaire = await prisma.sampleCollectionData.findFirst({
        where: {
          kitCode: lab.Sample_Tube_Barcode_Text__c,
        },
        select: {
          id: true,
        },
      });

      if (questionnaire) {
        ids.push({ sampleCollectionDataID: questionnaire.id });
      }

      logger.info(
        `Searching for sample collection data using kit code: ${lab.Sample_Tube_Barcode_Text__c}`
      );

      const inventory = await prisma.inventory.findUnique({
        where: {
          barcode: lab.Sample_Tube_Barcode_Text__c,
        },
        select: { id: true },
      });

      if (inventory) {
        logger.info(`[SUCCESS] Inventory record found. ID: ${inventory.id}`);
        ids.push({ inventoryID: inventory.id });
      }

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

      if (inward) {
        ids.push({ labInwardID: inward.id });
      }

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

      if (labProcess) {
        ids.push({ labProcessID: labProcess.id });
      }

      // step - 3: Update inward with lab process ID
      const dnaInput: IDNAInput = {
        qcStatus: "pending",
        employeeId: USERID, // Use the constant defined above
        statusLog: [],
        kitName: lab.Extraction_Kit_Name__c, // TOBE CHANGED
        customerId: "", //used to send email notification
      };

      const dna = await createDNA(dnaInput, labProcess.id);

      if (dna) {
        ids.push({ dnaID: dna.id });
      }

      const updateDNAInput = {
        qcStatus: lab.DNA_Status__c === "Approved" ? "approved" : "rejected",
        labId: lab.DNA_Name,
        statusLog: [
          {
            status: lab.DNA_Status__c === "Approved" ? "approved" : "rejected",
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

      if (gelElectrophoresis) {
        ids.push({ gelElectrophoresisID: gelElectrophoresis.id });
      }

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

      if (libraryPreparation) {
        ids.push({ libraryPreparationID: libraryPreparation.id });
      }

      const updateLibraryPreparationInput: ILibraryPreparationUpdateInput = {
        volumeOfDna: [
          {
            reading: parseInt(lab.Volume_of_DNA__c),
            processId: libraryPreparation.id,
          },
        ],
        initialQubitReading: [
          {
            reading: parseInt(lab.Initial_Sample_Qubit__c),
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

      if (libraryPooling) {
        ids.push({ libraryPoolingID: libraryPooling.id });
      }

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

      if (sequencingStart) {
        ids.push({ sequencingStartID: sequencingStart.id });
      }

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

      if (sequencingEnd) {
        ids.push({ sequencingEndID: sequencingEnd.id });
      }

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

      if (dataTransfer) {
        ids.push({ dataTransferID: dataTransfer.id });
      }

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
        QCstatus: lab.QC_Status__c === "Approved" ? "Approve" : "Reject",
      };

      const updatedBioInformaticsQC = await updateBioInformaticsQC(
        updateBioInformaticsQCInput
      );

      final.push({
        inwardId: inward.id,
        inwardCreatedAt: lab.Lab_Inward_Time__c,
        labProcessId: labProcess.id,
        labProcessCreatedAt: lab.Lab_CreatedDate,
        labProcessUpdatedAt: lab.Lab_LastModifiedDate,
      });

      writeFileSync(
        `./scriptLog/${lab.Kit_ID_text__c}.json`,
        JSON.stringify({ ...ids, ...timeStamps }, null, 2)
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

  writeFileSync("./scriptLog/final.json", JSON.stringify(final, null, 2));
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
