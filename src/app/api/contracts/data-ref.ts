export class DataRef {
  end_lt: string;
  file_hash: string;
  root_hash: string;
  seq_no: number;
  __typename: string;

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
      end_lt: this.end_lt,
      file_hash: this.file_hash,
      root_hash: this.root_hash,
      seq_no: this.seq_no,
      __typename: this.__typename,
    };
  }
}
