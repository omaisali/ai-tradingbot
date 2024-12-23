export interface MarketStatus {
  hasData: boolean;
  totalRecords: number;
  lastUpdate: Date | null;
}

export interface CollectionProgress {
  progress: number;
  currentDate: Date;
  recordsCollected: number;
}