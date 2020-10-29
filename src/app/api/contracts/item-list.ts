export class ItemList<T> {
  /**Page items */
  data: Array<T>;
  /**Requested page nubmer */
  page: number;
  /**Requested page size */
  pageSize: number;
  /**Total nubmer of items */
  total: number;

  constructor(data: any) {
    if (data) {
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          this[i] = data[i];
        }
      }
    }
  }
}
