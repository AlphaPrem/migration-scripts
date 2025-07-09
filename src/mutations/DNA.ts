import axios from "axios";
import { isAxiosError } from "axios";
import logger from "../../lib/logger/logger";
import { IDNAInput, IDNAUpdateInput } from "../types/dna";

interface ICreateDNAResponse {
  id: string;
}

async function createDNA(
  dnaInput: IDNAInput,
  labProcessId: string
): Promise<ICreateDNAResponse> {
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

    if (!response.data.data || !response.data.data.createDNA) {
      throw new Error(response.data.errors[0].message);
    }

    logger.info(
      `[DNA][CREATE] DNA record created successfully. ID: ${response.data.data.createDNA.id}`
    );

    return response.data.data.createDNA;
  } catch (error: unknown) {
    console.error(error);
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

async function updateDNA(
  updateDNAInput: IDNAUpdateInput,
  updateDnaId: string
): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "UpdateDNA",
      query: `mutation UpdateDNA($updateDnaId: ID!, $input: DNAUpdateInput) {
        updateDNA(id: $updateDnaId, input: $input)
      }`,
      variables: {
        input: updateDNAInput,
        updateDnaId: updateDnaId,
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

    if (!response.data.data || !response.data.data.updateDNA) {
      throw new Error(response.data.errors[0].message);
    }

    logger.info(
      `[DNA][UPDATE] DNA record updated successfully. ID: ${updateDnaId}`
    );

    return response.data.data.updateDNA;
  } catch (error: unknown) {
    console.error(error);
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while updating DNA: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while updating DNA: ${error?.response?.data?.errors?.[0]?.message}`
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
export { createDNA, updateDNA };
