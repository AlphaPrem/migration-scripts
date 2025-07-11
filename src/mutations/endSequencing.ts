import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";
import {
  IcreateSequencingEndInput,
  ISequencingEndUpdateInput,
} from "../types/endSequencing";

async function createENDSequencing(
  createSequencingENDInput: IcreateSequencingEndInput,
  labProcessId: string
): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "CreateSequencingEnd",
      query: `mutation CreateSequencingEnd(
        $labProcessId: String!,
        $input: sequencingEndInput
      ) {
        createSequencingEnd(labProcessId: $labProcessId, input: $input) {
          id
        }
      }`,
      variables: {
        input: createSequencingENDInput,
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

    if (!response.data.data || !response.data.data.createSequencingEnd) {
      throw new Error("Failed to create SequencingEND In Lab database");
    }

    return response.data.data.createSequencingEnd;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while creating SequencingEND: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while creating SequencingEND: ${error?.response?.data?.errors?.[0]?.message}`
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

async function updateENDSequencing(
  updateSequencingENDInput: ISequencingEndUpdateInput,
  updateSequencingEndId: string
): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "UpdateSequencingEnd",
      query: `mutation UpdateSequencingEnd(
        $updateSequencingEndId: ID!,
        $input: sequencingEndUpdateInput
      ) {
        updateSequencingEnd(id: $updateSequencingEndId, input: $input) {
          id
        }
      }
      `,
      variables: {
        input: updateSequencingENDInput,
        updateSequencingEndId: updateSequencingEndId,
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

    if (!response.data.data || !response.data.data.updateSequencingEnd) {
      throw new Error("Failed to update Sequencing END In Lab database");
    }

    return response.data.data.updateSequencingEnd;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while updating Sequencing END: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while updating Sequencing END: ${error?.response?.data?.errors?.[0]?.message}`
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

export { createENDSequencing, updateENDSequencing };
