import { NgModule } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HttpClientModule } from "@angular/common/http";
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import * as fromFragments from './fragments';
import * as fromQueries from './queries';
// import * as fromMutations from './mutations';

const uri = environment.apiUrl; // <-- add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink): any {

  const errorLink = onError(({ graphQLErrors, networkError, response }) => {
    const networkErrorRef: HttpErrorResponse = networkError as HttpErrorResponse;

    console.log('onError() graphQLErrors', graphQLErrors);
    console.log('onError() networkError', networkError);
    console.log('onError() response', response);

    if (networkErrorRef) {
      networkErrorRef.error.errors.forEach((error: any) => {
        console.log(error.message);
      });
    }
  });

  const link: any = ApolloLink.from([errorLink, httpLink.create({uri})]);
  const cache = new InMemoryCache();

  return {
    link,
    cache
  };
}

@NgModule({
  declarations: [],
  imports: [
    ApolloModule,
    HttpClientModule,
    HttpLinkModule
    // ApiService
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
    fromFragments.BlockFragments,
    fromQueries.BlockQueries,
  ],
})
export class ApiModule {
  // constructor(
  //   apollo: Apollo,
  //   httpLink: HttpLink,
  // ) {
  //   const uri = environment.apiUrl;
  //   const cache = new InMemoryCache({
  //     dataIdFromObject: object => object['data'] || null
  //   });
  //   // const errorLink = onError(({ networkError }) => {
  //   //   const networkErrorRef: HttpErrorResponse = networkError as HttpErrorResponse;
  //   //   if (networkErrorRef) {
  //   //     networkErrorRef.error.errors.forEach((error: any) => {
  //   //       console.log(error.message);
  //   //     });
  //   //   }
  //   // });
  //   apollo.create({
  //     // link: ApolloLink.from([errorLink, httpLink.create({uri})]),
  //     link: ApolloLink.from([httpLink.create({uri})]),
  //     cache: new InMemoryCache()
  //   });
  // }
}
