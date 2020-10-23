export class SimpleDataFilter {
  chains: string;
  extint: string;
  max: number;
  min: number;
  dateFrom: number;
  dateTo: number;
  period: string;
  timeFrom: number;
  timeTo: number;
  shard: string;
  aborted: boolean;
  direction: string;
  index: string;

  constructor(data?: any) {
    if (data) {
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          this[i] = data[i];
        }
      }
    }
  }
}
