import { Injectable } from '@angular/core';
import { DocumentNode } from 'graphql';

@Injectable({
  providedIn: 'root'
})
export class GraphQueryService {

  getItem: DocumentNode;

  constructor() { }
}
