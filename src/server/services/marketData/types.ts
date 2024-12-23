export interface CollectionProgress {
  date: Date;
  recordsCollected: number;
  totalRecords: number;
}

export interface CollectionStatus {
  isCollecting: boolean;
  currentDate?: Date;
  totalRecords: number;
  dataCompleteness: number;
}
