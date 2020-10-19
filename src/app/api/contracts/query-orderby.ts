export class QueryOrderBy {
  path: string;
  direction: string;   // DESC

  constructor(data?: any) {
    if (data) {
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          this[i] = data[i];
        }
      }
    }
  }

  serialize() {
    return {
      path: this.path,
      direction: this.direction
    };
  }
}
