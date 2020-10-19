export class BlockMasterShardHashesDescr {
  gen_utime: number;
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
      gen_utime: this.gen_utime,
      __typename: this.__typename,
    };
  }
}
