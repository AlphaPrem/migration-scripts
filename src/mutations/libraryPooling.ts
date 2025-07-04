import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";
import {
  IcreateLibraryPreparationInput,
  ILibraryPreparationUpdateInput,
} from "../types/libraryPreparation";
import { IcreateLibraryPoolingInput, ILibraryPoolingUpdateInput } from "../types/libraryPooling";

async function createLibraryPooling(
  createlibraryPoolingInput: IcreateLibraryPoolingInput,
  labProcessId: string
): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "CreateLibraryPooling",
      query: `mutation CreateLibraryPooling(
        $labProcessId: String!,
        $input: libraryPoolingInput
      ) {
        createLibraryPooling(labProcessId: $labProcessId, input: $input) {
          id
        }
      }`,
      variables: {
        input: createlibraryPoolingInput,
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

    if (!response.data.data || !response.data.data.createLibraryPooling) {
      throw new Error("Failed to create LibraryPooling In Lab database");
    }

    return response.data.data.createLibraryPooling;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while creating LibraryPooling: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while creating LibraryPooling: ${error?.response?.data?.errors?.[0]?.message}`
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

async function updateLibraryPooling(
  updatelibraryPoolingInput: ILibraryPoolingUpdateInput,
  updateLibraryPoolingId: string
): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "UpdateLibraryPooling",
      query: `mutation UpdateLibraryPooling(
        $updateLibraryPoolingId: ID!,
        $input: libraryPoolingUpdateInput
      ) {
        updateLibraryPooling(id: $updateLibraryPoolingId, input: $input) {
          id
        }
      }`,
      variables: {
        input: updatelibraryPoolingInput,
        updateLibraryPoolingId: updateLibraryPoolingId,
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

    if (!response.data.data || !response.data.data.updateLibraryPooling) {
      throw new Error("Failed to update LibraryPooling In Lab database");
    }

    return response.data.data.updateLibraryPooling;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while updating LibraryPooling: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while updating LibraryPooling: ${error?.response?.data?.errors?.[0]?.message}`
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

export { createLibraryPooling, updateLibraryPooling };
