// StartBioInformaticsQC

import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";
import { IBioInfoQCInput, IBioInfoQcStatusInput } from "../types/bioInformaticsQC";

async function startBioInformaticsQC(
  startBioInformaticsQCInput: IBioInfoQCInput
): Promise<any> {
  try {
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
      },
      data: data,
    };

    const response = await axios.request(config);

    if (!response.data.data || !response.data.data.startBioInformaticsQC) {
      throw new Error("Failed to create BioInformaticsQC In Lab database");
    }

    return response.data.data.startBioInformaticsQC;
  } catch (error: unknown) {
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
      },
      data: data,
    };

    const response = await axios.request(config);

    if (!response.data.data || !response.data.data.updateBioInformaticsQCStatus) {
      throw new Error("Failed to update BioInformaticsQC In Lab database");
    }

    return response.data.data.updateBioInformaticsQCStatus;
  } catch (error: unknown) {
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

export { startBioInformaticsQC , updateBioInformaticsQC};
