export interface IcreateLibraryPreparationInput {
  kitName: string;
  flowCellID: string;
  labKitPreparationName: string;
  employeeId: string;
  libraryPreparationBarcode: string;
}

export interface ILibraryPreparationUpdateInput {
  image?: string;
  volumeOfDna?: ReadingWithProcessId[];
  initialQubitReading?: ReadingWithProcessId[];
  postProcessQubitReading?: ReadingWithProcessId[];
  afterBarcodeLigationQubitReading?: ReadingWithProcessId[];
  afterAdapterLigationQubitReading?: ReadingWithProcessId[];
  finalQubitReading?: ReadingWithProcessId[];
  labKitPreparationName?: string;
  status: string;
}

interface ReadingWithProcessId {
  reading: number;
  processId: string;
}