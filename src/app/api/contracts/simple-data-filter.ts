export class SimpleDataFilter {
  chain: string;
  ext_int: string;
  msg_direction:string;
  max: string;
  min: string;
  fromDate: string;
  toDate: string;
  period: string;
  fromTime: number;
  toTime: number;
  shard: string;
  aborted: string;
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
