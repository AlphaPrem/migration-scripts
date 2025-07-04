// CreateGelElectrophoresis

import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";
import { IcreateGelElectrophoresisInput } from "../types/gelElectrophoresis";

async function createGelElectrophoresis(
  createGelElectrophoresisInput: IcreateGelElectrophoresisInput,
  labProcessId: string
): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "CreateGelElectrophoresis",
      query: `mutation CreateGelElectrophoresis($labProcessId: String!, $input: gelElectrophoresisInput) {
        createGelElectrophoresis(labProcessId: $labProcessId, input: $input) {
          id
        }
      }`,
      variables: {
        input: createGelElectrophoresisInput,
        labProcessId: labProcessId,
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

    if (!response.data.data || !response.data.data.createGelElectrophoresis) {
      throw new Error("Failed to create GelElectrophoresis In Lab database");
    }

    return response.data.data.createGelElectrophoresis;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while creating GelElectrophoresis: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while creating GelElectrophoresis: ${error?.response?.data?.errors?.[0]?.message}`
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

export { createGelElectrophoresis };
