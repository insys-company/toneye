export class FlowData {
  created: string;
  exported: string;
  fees_collected: string;
  fees_imported: string;
  from_prev_blk: string;
  imported: string;
  minted: string;
  to_next_blk: string;
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
      created: this.created,
      exported: this.exported,
      fees_collected: this.fees_collected,
      fees_imported: this.fees_imported,
      from_prev_blk: this.from_prev_blk,
      imported: this.imported,
      minted: this.minted,
      to_next_blk: this.to_next_blk,
      __typename: this.__typename,
    };
  }
}
