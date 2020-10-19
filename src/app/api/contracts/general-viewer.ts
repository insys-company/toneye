export class GeneralViewer {
  title: string;
  value: string;
  isNumber?: boolean;
  dinamic?: boolean; 

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
      title: this.title,
      value: this.value,
      isNumber: this.isNumber
    };
  }
}
