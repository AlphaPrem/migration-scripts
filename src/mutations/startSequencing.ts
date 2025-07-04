import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";
import { ISequencingCreateInput, ISequencingUpdateInput } from "../types/startSequencing";

async function createSequencing(
  createSequencingInput: ISequencingCreateInput,
  labProcessId: string
): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "CreateSequencing",
      query: `mutation CreateSequencing($labProcessId: String!, $input: sequencingInput) {
        createSequencing(labProcessId: $labProcessId, input: $input) {
          id
        }
      }`,
      variables: {
        input: createSequencingInput,
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

    if (!response.data.data || !response.data.data.createSequencing) {
      throw new Error("Failed to create Sequencing In Lab database");
    }

    return response.data.data.createSequencing;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while creating Sequencing: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while creating Sequencing: ${error?.response?.data?.errors?.[0]?.message}`
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

async function updateSequencing(
  updateSequencingInput: ISequencingUpdateInput,
  updateSequencingId: string
): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "UpdateSequencing",
      query: `mutation UpdateSequencing(
        $updateSequencingId: ID!,
        $input: sequencingUpdateInput
      ) {
        updateSequencing(id: $updateSequencingId, input: $input) {
          id
        }
      }`,
      variables: {
        input: updateSequencingInput,
        updateSequencingId: updateSequencingId,
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

    if (!response.data.data || !response.data.data.updateSequencing) {
      throw new Error("Failed to update Sequencing In Lab database");
    }

    return response.data.data.updateSequencing;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while updating Sequencing: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while updating Sequencing: ${error?.response?.data?.errors?.[0]?.message}`
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

export { createSequencing, updateSequencing };
