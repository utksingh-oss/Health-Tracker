import { Injectable } from '@angular/core';
import { DataEntry } from '../model/data-entry.model';

@Injectable({
  providedIn: 'root',
})
export class DataEntryService {
  dataEntryMap: { [key: string]: DataEntry } = {};

  setDataEntry(dataEntry: DataEntry): void {
    this.dataEntryMap[dataEntry.date] = dataEntry;
  }

  getDataEntry(date: string): DataEntry | null {
    return this.dataEntryMap[date] || null;
  }

  getAllDataEntries(): DataEntry[] {
    return Object.values(this.dataEntryMap).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  deleteDataEntry(date: string): void {
    delete this.dataEntryMap[date];
  }
}
