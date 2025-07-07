import axios from "axios";
import { ILabInwardInput } from "../types/labInward";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";

interface ICreateLabInwardResponse {
  id: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

async function createLabInward(
  labInwardInput: ILabInwardInput
): Promise<ICreateLabInwardResponse> {
  try {
    const data = JSON.stringify({
      operationName: "createNewInward",
      query: `mutation CreateNewInward($input: NewInwardInput!) {
        createNewInward(input: $input) {    
        id
        createdAt
        user {
          id
          name
          }
        }
      }`,
      variables: {
        input: labInwardInput,
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

    if (!response.data.data || !response.data.data.createNewInward) {
      throw new Error("Failed to create lab Inward In Lab database");
    }

    return response.data.data.createNewInward;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while creating lab Inward: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while creating lab Inward: ${error?.response?.data?.errors?.[0]?.message}`
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

export { createLabInward };
