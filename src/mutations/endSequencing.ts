import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";
import {
  IcreateSequencingEndInput,
  ISequencingEndUpdateInput,
} from "../types/endSequencing";

interface ICreateSequencingENDResponse {
  id: string;
}

async function createENDSequencing(
  createSequencingENDInput: IcreateSequencingEndInput,
  labProcessId: string
): Promise<ICreateSequencingENDResponse> {
  try {
    logger.info(
      `[SEQUENCING-End] Creating sequencing end for lab process ID: ${labProcessId}`
    );

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
        Authorization: process.env.AUTH_TOKEN,
      },
      data: data,
    };

    const response = await axios.request(config);

    if (!response.data.data || !response.data.data.createSequencingEnd) {
      throw new Error("Failed to create SequencingEND In Lab database");
    }

    logger.info(
      `[SEQUENCING-End] Successfully created sequencing end for lab process ID: ${labProcessId}`
    );

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

interface IUpdateSequencingENDResponse {
  id: string;
}

async function updateENDSequencing(
  updateSequencingENDInput: ISequencingEndUpdateInput,
  updateSequencingEndId: string
): Promise<IUpdateSequencingENDResponse> {
  try {
    logger.info(
      `[SEQUENCING-End] updating sequencing end for seq id: ${updateSequencingEndId}`
    );

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
        Authorization: process.env.AUTH_TOKEN,
      },
      data: data,
    };

    const response = await axios.request(config);

    if (!response.data.data || !response.data.data.updateSequencingEnd) {
      throw new Error("Failed to update Sequencing END In Lab database");
    }

    logger.info(
      `[SEQUENCING-End] successfully updated sequencing end for seq id: ${updateSequencingEndId}`
    );

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

async function connectSequencingEnd(
  labProcessId: string,
  sequencingEndId: string
): Promise<any> {
  try {
    logger.info(
      `[SEQUENCING-End] Connecting sequencing end for lab process ID: ${labProcessId} and sequencing end ID: ${sequencingEndId}`
    );

    const data = JSON.stringify({
      operationName: "SequencingEndUpdate",
      query: `mutation SequencingEndUpdate(
        $labProcessId: String!,
        $sequencingEndId: String!
      ) {
        SequencingEndUpdate(labProcessId: $labProcessId, sequencingEndId: $sequencingId)
      }`,
      variables: {
        labProcessId,
        sequencingEndId,
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

    if (!response.data.data || !response.data.data.sequencingUpdate) {
      throw new Error("Failed to connect Sequencing In Lab database");
    }

    logger.info(
      `[SEQUENCING-End] Successfully connected sequencing end for lab process ID: ${labProcessId} and sequencing end ID: ${sequencingEndId}`
    );

    return response.data.data.sequencingUpdate;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while connecting Sequencing: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while connecting Sequencing: ${error?.response?.data?.errors?.[0]?.message}`
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

export { createENDSequencing, updateENDSequencing, connectSequencingEnd };
