export interface IcreateSequencingEndInput {
  employeeId: string;
}

export interface ISequencingEndUpdateInput {
  numberOfActiveSpores?: number;
  numberOfPassedReads?: number;
  numberOfFailedReads?: number;
  N50?: number;
  status?: "pending" | "accepted" | "rejected" | string;
  remarks?: string;
  totalDataGenerate?: string; // assuming it's a string for units like "16 GB"
}