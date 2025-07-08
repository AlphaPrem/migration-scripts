import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";
import { IDataTransferToBioinformaticsInput } from "../types/dataTransferToBioinformatics";

interface ICreateDataTransferToBioinformaticsResponse {
  id: string;
}

async function createDataTransferToBioinformatics(
  createDataTransferToBioinformaticsInput: IDataTransferToBioinformaticsInput,
  labProcessId: string
): Promise<ICreateDataTransferToBioinformaticsResponse> {
  try {
    const data = JSON.stringify({
      operationName: "CreateDataTransferToBioinformatics",
      query: `mutation CreateDataTransferToBioinformatics(
        $labProcessId: String!,
        $input: dataTransferToBioinformaticsInput
      ) {
        createDataTransferToBioinformatics(labProcessId: $labProcessId, input: $input) {
          id
        }
      }`,
      variables: {
        input: createDataTransferToBioinformaticsInput,
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

    if (
      !response.data.data ||
      !response.data.data.createDataTransferToBioinformatics
    ) {
      throw new Error(
        "Failed to create DataTransferToBioinformatics In Lab database"
      );
    }

    return response.data.data.createDataTransferToBioinformatics;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while creating DataTransferToBioinformatics: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while creating DataTransferToBioinformatics: ${error?.response?.data?.errors?.[0]?.message}`
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

export { createDataTransferToBioinformatics };
