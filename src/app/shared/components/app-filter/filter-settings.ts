export class FilterSettings {
  filterChain: boolean;
  filterExtInt: boolean;
  filterByShard: boolean;
  filterByTime: boolean;
  filterByAbort: boolean;
  filterByMinMax: boolean;

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
