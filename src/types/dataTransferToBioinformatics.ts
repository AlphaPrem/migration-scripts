export interface IDataTransferToBioinformaticsInput {
  employeeId: string;
  remarks: string;
  modeOfDataTransfer: string; // e.g., 'ethernet', 'USB'
  barcode: string;
  extractionDate: string; // ISO date string
  firstRatio: number;
  secondRatio: number;
  kitName: string;
  nanoDropConcentration: string; 
  qubitConcentration: number;
  quantity: string; 
  repeatNo: number;
}