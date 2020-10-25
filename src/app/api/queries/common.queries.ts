import { Injectable } from '@angular/core';
import { BlockFragments } from '../fragments';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class CommonQueries {

  getAccountsCount = gql`
    query getAccountsCount{
      getAccountsCount
    }
  `;

  getAggregateTransactions = gql`
    query getTransactionsCount($filter: TransactionFilter, $fields: [FieldAggregation]){
      aggregateTransactions(filter: $filter, fields: $fields)
    }
  `;

  getAccountsTotalBalance = gql`
    query getAccountsTotalBalance{
      getAccountsTotalBalance
    }
  `;

  getGeneralData = gql`
    query getGeneralData{
      getAccountsCount
      aggregateTransactions
      getAccountsTotalBalance
    }
  `;

  getGeneralAccountData = gql`
    query getGeneralAccountData{
      getAccountsCount
      getAccountsTotalBalance
    }
  `;

  getAggregateBlocks = gql`
    query getAggregateBlocks($filter: BlockFilter, $fields: [FieldAggregation]){
      aggregateBlocks(filter: $filter, fields: $fields)
    }
  `;

  getAggregateMessages = gql`
    query getAggregateMessages($filter: MessageFilter, $fields: [FieldAggregation]){
      aggregateMessages(filter: $filter, fields: $fields)
    }
  `;

  getValidatorAggregateAccounts = gql`
    query aggregateAccounts($filter: AccountFilter, $fields: [FieldAggregation]){
      aggregateAccounts(filter: $filter, fields: $fields)
    }
  `;

  getValidatorAggregateMessages = gql`
    query aggregateMessages($filter: MessageFilter, $fields: [FieldAggregation]){
      aggregateMessages(filter: $filter, fields: $fields)
    }
  `;

  getValidatorAggregateBlockSignatures = gql`
    query aggregateBlockSignatures($filter: BlockSignaturesFilter, $fields: [FieldAggregation]){
      aggregateBlockSignatures(filter: $filter, fields: $fields)
    }
  `;



  constructor(private blockFragments: BlockFragments) { }
}