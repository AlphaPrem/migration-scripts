import { PrismaClient } from "@prisma/client";
import { exit } from "process";
import { data } from "../scriptLog/First14Barcodes.json";

const prisma = new PrismaClient();

interface TimestampUpdateData {
  inwardId: string;
  inwardCreatedAt: string;

  labProcessId: string;
  labProcessCreatedAt: string;
  labProcessUpdatedAt: string;

  dnaId: string;
  dnaCreatedAt: string;

  gelElectrophoresisId: string;
  gelElectrophoresisCreatedAt: string;

  libraryPreparationId: string;
  libraryPreparationCreatedAt: string;

  libraryPoolingId: string;
  libraryPoolingCreatedAt: string;

  sequencingStartId: string;
  sequencingStartCreatedAt: string;

  sequencingEndId: string;
  sequencingEndCreatedAt: string;

  dataTransferId: string;
  dataTransferCreatedAt: string;
  dataTransferUpdatedAt: string;
}

const timestampData: TimestampUpdateData = {
  inwardId: "686e19710b6486d468930f7c",
  inwardCreatedAt: "2025-01-31 05:38:26",
  labProcessId: "686e19720b6486d468930f7f",
  labProcessCreatedAt: "2025-01-06 13:51:48",
  labProcessUpdatedAt: "2025-01-31 10:38:57",
  dnaId: "686e19720b6486d468930f81",
  dnaCreatedAt: "2025-01-31 05:38:47",
  gelElectrophoresisId: "686e19720b6486d468930f85",
  gelElectrophoresisCreatedAt: "2025-01-31 05:38:57",
  libraryPreparationId: "686e19730b6486d468930f8a",
  libraryPreparationCreatedAt: "2025-01-31 05:38:57",
  libraryPoolingId: "686e19740b6486d468930f90",
  libraryPoolingCreatedAt: "2025-01-31 05:38:57",
  sequencingStartId: "686e19740b6486d468930f93",
  sequencingStartCreatedAt: "2025-01-31 05:45:09",
  sequencingEndId: "686e19740b6486d468930f99",
  sequencingEndCreatedAt: "2025-01-31 05:45:16",
  dataTransferId: "686e19750b6486d468930f9e",
  dataTransferCreatedAt: "2025-01-31 05:45:29",
  dataTransferUpdatedAt: "2025-01-31 05:45:29",
};

async function updateEntity<T>(
  label: string,
  updater: () => Promise<T>
): Promise<void> {
  try {
    await updater();
    console.info(`✅ Successfully updated: ${label}`);
  } catch (error: any) {
    console.error(`❌ Error updating ${label}:`, error.message ?? error);
  }
}

async function updateTimestamps(data: TimestampUpdateData) {
  console.log("🚀 Starting timestamp updates...");

  await updateEntity("inward", () =>
    prisma.inward.update({
      where: { id: data.inwardId },
      data: {
        createdAt: new Date(data.inwardCreatedAt),
      },
    })
  );

  await updateEntity("labProcess", () =>
    prisma.labProcess.update({
      where: { id: data.labProcessId },
      data: {
        createdAt: new Date(data.labProcessCreatedAt),
        updatedAt: new Date(data.labProcessUpdatedAt),
      },
    })
  );

  await updateEntity("DNA", () =>
    prisma.dNA.update({
      where: { id: data.dnaId },
      data: {
        createdAt: new Date(data.dnaCreatedAt),
      },
    })
  );

  await updateEntity("gelElectrophoresis", () =>
    prisma.gelElectrophoresis.update({
      where: { id: data.gelElectrophoresisId },
      data: {
        createdAt: new Date(data.gelElectrophoresisCreatedAt),
      },
    })
  );

  await updateEntity("libraryPreparation", () =>
    prisma.libraryPreparation.update({
      where: { id: data.libraryPreparationId },
      data: {
        createdAt: new Date(data.libraryPreparationCreatedAt),
      },
    })
  );

  await updateEntity("libraryPooling", () =>
    prisma.libraryPooling.update({
      where: { id: data.libraryPoolingId },
      data: {
        createdAt: new Date(data.libraryPoolingCreatedAt),
      },
    })
  );

  await updateEntity("sequencing (start)", () =>
    prisma.sequencing.update({
      where: { id: data.sequencingStartId },
      data: {
        createdAt: new Date(data.sequencingStartCreatedAt),
      },
    })
  );

  await updateEntity("sequencingEnd", () =>
    prisma.sequencingEnd.update({
      where: { id: data.sequencingEndId },
      data: {
        createdAt: new Date(data.sequencingEndCreatedAt),
      },
    })
  );

  await updateEntity("dataTransferToBioinformatics", () =>
    prisma.dataTransferToBioinformatics.update({
      where: { id: data.dataTransferId },
      data: {
        createdAt: new Date(data.dataTransferCreatedAt),
        updatedAt: new Date(data.dataTransferUpdatedAt),
      },
    })
  );

  console.log("✅ All updates completed.");
}

updateTimestamps(timestampData)
  .catch((error) => {
    console.error(
      "💥 Critical failure during updates:",
      error.message ?? error
    );
    exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
