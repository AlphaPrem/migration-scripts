import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";
import {
  IcreateLibraryPreparationInput,
  ILibraryPreparationUpdateInput,
} from "../types/libraryPreparation";

interface IcreateLibraryPreparationResponse {
  id: string;
}

async function createLibraryPreparation(
  createlibraryPreparationInput: IcreateLibraryPreparationInput,
  labProcessId: string
): Promise<IcreateLibraryPreparationResponse> {
  try {
    const data = JSON.stringify({
      operationName: "CreateLibraryPreparation",
      query: `mutation CreateLibraryPreparation(
        $labProcessId: String!,
        $input: libraryPreparationInput
      ) {
        createLibraryPreparation(labProcessId: $labProcessId, input: $input) {
          id
        }
      }`,
      variables: {
        input: createlibraryPreparationInput,
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

    if (!response.data.data || !response.data.data.createLibraryPreparation) {
      throw new Error("Failed to create LibraryPreparation In Lab database");
    }

    return response.data.data.createLibraryPreparation;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while creating LibraryPreparation: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while creating LibraryPreparation: ${error?.response?.data?.errors?.[0]?.message}`
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

interface IupdateLibraryPreparationResponse {
  id: string;
}

async function updateLibraryPreparation(
  updatelibraryPreparationInput: ILibraryPreparationUpdateInput,
  updateLibraryPreparationId: string
): Promise<IupdateLibraryPreparationResponse> {
  try {
    const data = JSON.stringify({
      operationName: "UpdateLibraryPreparation",
      query: `mutation UpdateLibraryPreparation(
        $updateLibraryPreparationId: ID!,
        $input: libraryPreparationUpdateInput
      ) {
        updateLibraryPreparation(id: $updateLibraryPreparationId, input: $input) {
          id
        }
      }`,
      variables: {
        input: updatelibraryPreparationInput,
        updateLibraryPreparationId: updateLibraryPreparationId,
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

    if (!response.data.data || !response.data.data.updateLibraryPreparation) {
      throw new Error("Failed to update LibraryPreparation In Lab database");
    }

    return response.data.data.updateLibraryPreparation;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while updating LibraryPreparation: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while updating LibraryPreparation: ${error?.response?.data?.errors?.[0]?.message}`
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

export { createLibraryPreparation, updateLibraryPreparation };
