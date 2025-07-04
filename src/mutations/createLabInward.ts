import axios from "axios";
import { LabInwardInput } from "../types/labInward";
import { isAxiosError } from "axios";

async function createSeller(labInwardInput: LabInwardInput): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "createB2BSealer",
      query: `mutation createB2BSealer($input: SealerB2BInput) {
         createB2BSealer(input: $input) {
          id
          name
          tat
          poc_name
          poc_email
          poc_phone
          sealerId
          isWhiteLabeled
          email
          website
          logo
          footerLogo
          orgName
          orgAddress
          orgEmail
          orgPhone
          createdAt
          updatedAt
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

    if (!response.data.data || !response.data.data.createB2BSealer) {
      throw new Error("Failed to create B2bClient In Lab database");
    }

    return response.data.data.createB2BSealer;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.dir(error?.response?.data);
      throw new Error(
        `Axios error occurred while creating seller: ${error?.response?.data?.errors?.[0]?.message}`
      );
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(`${error}`);
  }
}
