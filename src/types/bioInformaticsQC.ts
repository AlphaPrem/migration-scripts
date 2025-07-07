export interface IBioInfoQCInput {
  id: string; // ID of the sample or record
  userID: string;
  noOfBases: string;         // consider number if applicable
  noOfReads: string;         // consider number if applicable
  meanReadLength: string;    // consider number if applicable
  dataSize: string;          // consider number if applicable
}

export interface IBioInfoQcStatusInput {
  id: string;          
  QCstatus: string;
}