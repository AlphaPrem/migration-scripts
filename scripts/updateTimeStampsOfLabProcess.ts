import { PrismaClient } from "@prisma/client";
import { exit } from "process";
import { timeStamps } from "../data/timeStamp";
import logger from "../lib/logger/logger";

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

async function updateTimestamps() {
  logger.info("🚀 Starting timestamp updates...");

  await prisma.$transaction(
    async (tx) => {
      for (const [index, data] of timeStamps.entries()) {
        try {
          logger.info(`🔄 Processing record ${index + 1}...`);

          await tx.inward.update({
            where: { id: data.inwardId },
            data: { createdAt: new Date(data.inwardCreatedAt) },
          });

          await tx.labProcess.update({
            where: { id: data.labProcessId },
            data: {
              createdAt: new Date(data.labProcessCreatedAt),
              updatedAt: new Date(data.labProcessUpdatedAt),
            },
          });

          await tx.dNA.update({
            where: { id: data.dnaId },
            data: { createdAt: new Date(data.dnaCreatedAt) },
          });

          await tx.gelElectrophoresis.update({
            where: { id: data.gelElectrophoresisId },
            data: { createdAt: new Date(data.gelElectrophoresisCreatedAt) },
          });

          await tx.libraryPreparation.update({
            where: { id: data.libraryPreparationId },
            data: { createdAt: new Date(data.libraryPreparationCreatedAt) },
          });

          await tx.libraryPooling.update({
            where: { id: data.libraryPoolingId },
            data: { createdAt: new Date(data.libraryPoolingCreatedAt) },
          });

          await tx.sequencing.update({
            where: { id: data.sequencingStartId },
            data: { createdAt: new Date(data.sequencingStartCreatedAt) },
          });

          await tx.sequencingEnd.update({
            where: { id: data.sequencingEndId },
            data: { createdAt: new Date(data.sequencingEndCreatedAt) },
          });

          await tx.dataTransferToBioinformatics.update({
            where: { id: data.dataTransferId },
            data: {
              createdAt: new Date(data.dataTransferCreatedAt),
              updatedAt: new Date(data.dataTransferUpdatedAt),
            },
          });

          logger.info(`✅ Record ${index + 1} updated`);
        } catch (error) {
          logger.error(`❌ Error updating record ${index + 1}:`, error);
        }
      }
    },
    {
      timeout: 60000, // 30 seconds timeout for the transaction
    }
  );

  logger.info("🎉 All records updated successfully.");
}

updateTimestamps()
  .catch((error) => {
    logger.error("💥 Critical failure during updates:", error.message ?? error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
