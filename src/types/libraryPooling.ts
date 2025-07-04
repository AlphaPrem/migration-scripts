export interface IcreateLibraryPoolingInput {
  employeeId: string;
  notification: boolean;
}

export interface ILibraryPoolingUpdateInput {
  adapterLigation?: string; // or number, depending on backend schema
  finalQubitReadings?: string; // or number
  status?: string;
}