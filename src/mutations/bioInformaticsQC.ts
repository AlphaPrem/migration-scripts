import axios from "axios";
import { isAxiosError } from "axios";
import logger from "../../lib/logger/logger";
import {
  IBioInfoQCInput,
  IBioInfoQcStatusInput,
} from "../types/bioInformaticsQC";

async function startBioInformaticsQC(
  startBioInformaticsQCInput: IBioInfoQCInput
): Promise<any> {
  try {
    logger.info(
      `[BIO_INFO-QC START] Creating bio informatics qc for questionnaire ID: ${startBioInformaticsQCInput.id}`
    );

    const data = JSON.stringify({
      operationName: "StartBioInformaticsQC",
      query: `mutation StartBioInformaticsQC($input: QCInput!) {
        startBioInformaticsQC(input: $input)
      }`,
      variables: {
        input: startBioInformaticsQCInput,
      },
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.GRAPHQL_ENDPOINT_URL,
      headers: {
        "x-admin-token": process.env.GRAPHQL_TOKEN,
        "Content-Type": "application/json",
        Authorization: process.env.AUTH_TOKEN,
      },
      data: data,
    };

    const response = await axios.request(config);

    if (!response.data.data || !response.data.data.startBioInformaticsQC) {
      throw new Error(response.data.errors[0].message);
    }

    logger.info(
      `[BIO_INFO-QC UPDATE] success bio informatics qc for questionnaire ID: ${startBioInformaticsQCInput.id}`
    );

    return response.data.data.startBioInformaticsQC;
  } catch (error: unknown) {
    console.log(error);
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while creating BioInformaticsQC: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while creating BioInformaticsQC: ${error?.response?.data?.errors?.[0]?.message}`
      );
    }
    if (error instanceof Error) {
      logger.error(error.message);
      throw new Error(error.message);
    }
    logger.error(error);
    throw new Error(`${error}`);
  }
}

async function updateBioInformaticsQC(
  updateBioInformaticsQCInput: IBioInfoQcStatusInput
): Promise<any> {
  try {
    logger.info(
      `[BIO_INFO-QC UPDATE] updating bio informatics qc for questionnaire ID: ${updateBioInformaticsQCInput.id}`
    );

    const data = JSON.stringify({
      operationName: "UpdateBioInformaticsQCStatus",
      query: `mutation UpdateBioInformaticsQCStatus($input: QcStatusInput!) {
        updateBioInformaticsQCStatus(input: $input)
      }`,
      variables: {
        input: updateBioInformaticsQCInput,
      },
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.GRAPHQL_ENDPOINT_URL,
      headers: {
        "x-admin-token": process.env.GRAPHQL_TOKEN,
        "Content-Type": "application/json",
        Authorization: process.env.AUTH_TOKEN,
      },
      data: data,
    };

    const response = await axios.request(config);

    if (
      !response.data.data ||
      !response.data.data.updateBioInformaticsQCStatus
    ) {
      throw new Error(response.data.errors[0].message);
    }

    logger.info(
      `[BIO_INFO-QC UPDATE] success bio informatics qc for questionnaire ID: ${updateBioInformaticsQCInput.id}`
    );

    return response.data.data.updateBioInformaticsQCStatus;
  } catch (error: unknown) {
    console.log(error);
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while updating BioInformaticsQC: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while updating BioInformaticsQC: ${error?.response?.data?.errors?.[0]?.message}`
      );
    }
    if (error instanceof Error) {
      logger.error(error.message);
      throw new Error(error.message);
    }
    logger.error(error);
    throw new Error(`${error}`);
  }
}

export { startBioInformaticsQC, updateBioInformaticsQC };
