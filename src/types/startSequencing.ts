export interface ISequencingCreateInput {
  employeeId: string;
  cellId: string;
  sequencingMasterId: string;
}

export interface ISequencingUpdateInput {
  numberOfActiveSpores?: number;
  status?: string;
  remarks?: string;
}