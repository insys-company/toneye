export class Message {
  created_at: number;
  dst: string;
  id: string;
  src: string;
  value: string
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
      created_at: this.created_at,
      dst: this.dst,
      id: this.id,
      src: this.src,
      value: this.value,
      __typename: this.__typename,
    };
  }
}
