/**
 * Represents list item in select list
 */
export class ListItem {
  id: string;
  name: string;

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