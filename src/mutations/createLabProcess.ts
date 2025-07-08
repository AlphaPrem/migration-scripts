import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";
import { ILabProcessInput } from "../types/labProcess";

interface LabProcessResponse {
  id: string;
  sampleTubeBarCode: string;
}

async function createLabProcess(
  labProcessInput: ILabProcessInput
): Promise<LabProcessResponse> {
  try {
    const data = JSON.stringify({
      operationName: "createNewLabProcess",
      query: `mutation createNewLabProcess($input: NewLabProcessInput) {
        createNewLabProcess(input: $input) {
        id
        sampleTubeBarCode
        }
      }`,
      variables: {
        input: labProcessInput,
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

    if (!response.data.data || !response.data.data.createNewLabProcess) {
      throw new Error("Failed to create lab Process In Lab database");
    }

    return response.data.data.createNewLabProcess;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while creating lab Process: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while creating lab Process: ${error?.response?.data?.errors?.[0]?.message}`
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

export { createLabProcess };
