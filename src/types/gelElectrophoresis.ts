// CreateGelElectrophoresis

export interface IcreateGelElectrophoresisInput {
  remark: string;
  score: number;
  status: string;
  employeeId: string;
  customerId: string;
}

export interface IUpdateGelElectrophoresisUpdateInput {
  status?: string;
  remark?: string;
  score?: number;
  statusLog?: StatusLogEntry[];
}

interface StatusLogEntry {
  remark: string;
  status: string;
  score: string; // or number, depending on your backend schema
  createdAt: string; // should ideally be in ISO 8601 format
}