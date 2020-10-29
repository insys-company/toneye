export class DataCounts {
  getAccountsCount: number;
  getAccountsTotalBalance: string;
  getTransactionsCount: number;

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
      getAccountsCount: this.getAccountsCount,
      getAccountsTotalBalance: this.getAccountsTotalBalance,
      getTransactionsCount: this.getTransactionsCount
    };
  }
}