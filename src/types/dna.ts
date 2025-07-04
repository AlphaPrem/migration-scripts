export interface IDNAInput {
  qcStatus: string;
  employeeId: string;
  statusLog: any[];
  kitName: string;
  customerId: string;
}

export interface IDNAUpdateInput {
  qcStatus?: "pending" | "approved" | "rejected" | string;
  labId?: string;
  statusLog?: StatusLogEntry[];
}

interface StatusLogEntry {
  status: string;
  remark: string;
  date: string; // ISO 8601 date string
  concentration: string; // or number, if handled as numeric
  firstRatio: number;
  secondRatio: number;
  extractionLabID: string;
}