import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";
import { IDNAInput } from "../types/dna";

async function createDNA(dnaInput: IDNAInput,labProcessId:string): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "CreateDNA",
      query: `mutation CreateDNA($labProcessId: String!, $input: DNAInput) {
        createDNA(labProcessId: $labProcessId, input: $input) {
          id
        }
      }
      `,
      variables: {
        input: dnaInput,
        labProcessId:labProcessId
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

    if (!response.data.data || !response.data.data.createDNA) {
      throw new Error("Failed to create DNA In Lab database");
    }

    return response.data.data.createDNA;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while creating DNA: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while creating DNA: ${error?.response?.data?.errors?.[0]?.message}`
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

export { createDNA };
