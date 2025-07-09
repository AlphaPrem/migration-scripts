import axios from "axios";
import { isAxiosError } from "axios";
import { USERID } from "../../scripts/createLabprocesses";
import logger from "../../lib/logger/logger";

interface IUpdateSampleCollectionInwardResponse {
  id: string;
  inward: {
    id: string;
  };
}

async function UpdateSampleCollectionInward(
  id: string,
  inwardId: string
): Promise<IUpdateSampleCollectionInwardResponse> {
  try {
    const data = JSON.stringify({
      operationName: "UpdateSampleCollectionInward",
      query: `mutation UpdateSampleCollectionInward($id: String!, $inwardId: String) {
        updateSampleCollectionInward(id: $id, inwardId: $inwardId) {
          id
          inward {
            id
          }
        }
      }`,
      variables: {
        id,
        inwardId,
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
      !response.data.data.updateSampleCollectionInward
    ) {
      throw new Error(response.data.errors[0].message);
    }

    logger.info(
      `[updateSampleCollectionInward] : successfully updated sampleCollectionInward for sampleCollectionData ${id}`
    );

    return response.data.data.updateSampleCollectionInward;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      logger.error(
        `Axios error occurred while UpdateSampleCollectionInward: ${error?.response?.data?.errors?.[0]?.message}`
      );
      throw new Error(
        `Axios error occurred while UpdateSampleCollectionInward: ${error?.response?.data?.errors?.[0]?.message}`
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

export { UpdateSampleCollectionInward };
