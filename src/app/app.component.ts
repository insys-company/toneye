import { Component, ChangeDetectionStrategy, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { appRouteMap } from './app-route-map';
import { RouterOutlet, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { routeAnimation } from './app-animations';
import { Breadcrumbs, Block, Message, Transaction, QueryOrderBy, Validator, BlockMaster, ValidatorSetList } from './api';
import { takeUntil, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { BlockQueries, MessageQueries, AccountQueries, TransactionQueries } from './api/queries';
import _ from 'underscore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ routeAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {
  /**
   * for router
   */
  public _unsubscribe: Subject<void> = new Subject();
  /**
   * Array of links
   */
  public links: Array<string> = [
    appRouteMap.blocks,
    appRouteMap.transactions,
    appRouteMap.messages,
    appRouteMap.accounts,
    appRouteMap.contracts,
    appRouteMap.validators
  ];
  /**
   * Flag for mobile menu and mobile menu icon
   */
  public isMenuOpened: boolean;
  /**
   * Breadcrumbs object for pages
   */
  public breadcrumbs: Breadcrumbs[];

  /** Array of ... */
  public foundBlocks: Block[] = [];
  public foundMessages: Message[] = [];
  public foundTransactions: Transaction[] = [];

  public foundAccounts: Account[] = [];
  public foundValidators: ValidatorSetList[] = [];

  constructor(
    private changeDetection: ChangeDetectorRef,
    private router: Router,
    private apollo: Apollo,
    private blockQueries: BlockQueries,
    // private commonQueries: CommonQueries,
    private accountQueries: AccountQueries,
    private messageQueries: MessageQueries,
    private transactionQueries: TransactionQueries,
  ) {

    /** Disable change detection for application optimization */
    // this.changeDetection.detach();

    this.isMenuOpened = false;
    this.breadcrumbs = [];
    this.breadcrumbs = [new Breadcrumbs({ name: appRouteMap.home, url: appRouteMap.home })];
  }

  /** Search input */
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef;

  /**
   * Initialization of the component
   */
  public ngOnInit(): void {
    this.routerSubscribe();
    // this.detectChanges();
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
    this._unsubscribe = null;
    this.links = null;
    this.isMenuOpened = null;
    this.breadcrumbs = null;
    this.foundBlocks = null;
    this.foundMessages = null;
    this.foundTransactions = null;
    this.foundAccounts = null;
    this.foundValidators = null;
  }

  /**
   * Search method
   * @param search String from search input
   */
  public onSearch(search: string): void {
    const _search = search ? search.trim() : search;

    if (!_search || _search == '') {

      // Для вызова в child ngOnChanges
      this.foundBlocks = JSON.parse(JSON.stringify([]));
      this.foundMessages = JSON.parse(JSON.stringify([]));
      this.foundTransactions = JSON.parse(JSON.stringify([]));
      this.foundAccounts = JSON.parse(JSON.stringify([]));
      this.foundValidators = JSON.parse(JSON.stringify([]));

      this.detectChanges();
      return;
    }

    this.searchDara(_search);
  }

  /**
   * 
   * @param obj 
   */
  public onDetails(data: {type: string, option: any}): void {
    let baseUrl: string;
    if (data.type === appRouteMap.blocks) {
      baseUrl = appRouteMap.block;
    }
    else if (data.type === appRouteMap.transactions) {
      baseUrl = appRouteMap.transaction;
    }
    else if (data.type === appRouteMap.messages) {
      baseUrl = appRouteMap.message;
    }
    else if (data.type === appRouteMap.accounts) {
      baseUrl = appRouteMap.account;
    }
    else if (data.type === appRouteMap.validators) {
      baseUrl = appRouteMap.validator;
    }

    if (baseUrl && data.option.id) {
      this.router.navigate([`/${baseUrl}/${data.option.id}`]);
    }
  }

  /**
   * Method for ngFor optimization (Menu)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  public identifyMenu(index: number, item: string): string { return item; }

  /**
   * Method for ngFor optimization (Breadcrumbs list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  public identifyBreadcrumbs(index: number, item: Breadcrumbs): string { return item.name; }

  /**
   * Method for route animation
   * @param outlet Router outlet for animation
   */
  prepareRouteForAnimation(outlet: RouterOutlet): any {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }

  /**
   * Check url and change breadcrumbs object
   */
  private routerSubscribe(): void {
    this.router.events
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {

          const _urlArray = event.url != null ? _.without((event.url.split('?')[0]).split('/'), '', null) : '';
  
          const _url = _urlArray[0] != null ? _urlArray[0] : '';

          this.breadcrumbs = this.breadcrumbs.slice(0, 1);

          if (_url == appRouteMap.home) { return; }

          if (_urlArray.length === 1) {
            this.breadcrumbs.push(new Breadcrumbs({ name: _url, url: _url }));
          }
          // details
          else {
            const parent = _.find(this.links, (l) => { return l.includes(_url)})
            this.breadcrumbs.push(new Breadcrumbs({ name: `${parent}`, url: `${parent}` }));
            this.breadcrumbs.push(new Breadcrumbs({ name: `${_url} details`, url: _url }));
          }
        }
      });
  }

  /**
   * Detect Changes
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }

  /**
   * Get block list
   * @param search String for searching
   */
  private searchDara(search: string): void {
    // Get blocks
    this.getBlocks(search)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((b: Block[]) => {

        // Get messages
        this.getMessages(search)
          .pipe(takeUntil(this._unsubscribe))
          .subscribe((m: Message[]) => {

            // Get transactions
            this.getTransaction(search)
              .pipe(takeUntil(this._unsubscribe))
              .subscribe((t: Transaction[]) => {

                // Get accounts
                this.getAccounts(search)
                  .pipe(takeUntil(this._unsubscribe))
                  .subscribe((a: Account[]) => {

                    this.getKeyForValidators()
                      .pipe(takeUntil(this._unsubscribe))
                      .subscribe((prevBlock: Block[]) => {

                        this.getValidators(prevBlock[0].prev_key_block_seqno)
                        .pipe(takeUntil(this._unsubscribe))
                        .subscribe((masterBlockConfig: Block[]) => {

                          // Для вызова в child ngOnChanges
                          this.foundBlocks = JSON.parse(JSON.stringify(b)) ? JSON.parse(JSON.stringify(b)) : JSON.parse(JSON.stringify([]));

                          // Для вызова в child ngOnChanges
                          this.foundMessages = JSON.parse(JSON.stringify(m)) ? JSON.parse(JSON.stringify(m)) : JSON.parse(JSON.stringify([]));

                          this.foundTransactions = JSON.parse(JSON.stringify(t)) ? JSON.parse(JSON.stringify(t)) : JSON.parse(JSON.stringify([]));

                          this.foundAccounts = JSON.parse(JSON.stringify(a)) ? JSON.parse(JSON.stringify(a)) : JSON.parse(JSON.stringify([]));

                          let masterBlock = masterBlockConfig ? new BlockMaster(masterBlockConfig[0].master) : new BlockMaster(null);

                          if (masterBlock.config && masterBlock.config.p32 && masterBlock.config.p32.list) {
                            this.foundValidators = _.find(masterBlock.config.p32.list, (item: ValidatorSetList) => { return item.public_key === search})
                              ? [_.find(masterBlock.config.p32.list, (item: ValidatorSetList) => { return item.public_key === search})]
                              : [];
                          }
            
                          if (!this.foundValidators.length && masterBlock.config && masterBlock.config.p34 && masterBlock.config.p34.list) {
                            this.foundValidators = _.find(masterBlock.config.p34.list, (item: ValidatorSetList) => { return item.public_key === search})
                              ? [_.find(masterBlock.config.p34.list, (item: ValidatorSetList) => { return item.public_key === search})]
                              : [];
                          }
            
                          if (!this.foundValidators.length && masterBlock.config && masterBlock.config.p36 && masterBlock.config.p36.list) {
                            this.foundValidators = _.find(masterBlock.config.p36.list, (item: ValidatorSetList) => { return item.public_key === search})
                              ? [_.find(masterBlock.config.p36.list, (item: ValidatorSetList) => { return item.public_key === search})]
                              : [];
                          }

                          this.foundValidators.forEach(v => { v.id = v.public_key});

                          this.foundValidators = JSON.parse(JSON.stringify(this.foundValidators)) ? JSON.parse(JSON.stringify(this.foundValidators)) : JSON.parse(JSON.stringify([]));

                          this.detectChanges();
  
                        }, (error: any) => {
                          console.log(error);
                        });


                      }, (error: any) => {
                        console.log(error);
                      });
    

                  }, (error: any) => {
                    console.log(error);
                  });

              }, (error: any) => {
                console.log(error);
              });

          }, (error: any) => {
            console.log(error);
          });

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get block list query
   * @param _search String for searching
   */
  private getBlocks(_search?: string): Observable<Block[]> {

    const regexp = /([0-9]*)/;

    const _variables = {
      // filter: {seq_no: {eq: _search}},
      filter: _search.match(regexp) === null ? {id: {in: _search}} : {seq_no: {eq: Number(_search)}},
      orderBy: [
        new QueryOrderBy({path: 'gen_utime', direction: 'DESC'}),
        new QueryOrderBy({path: 'seq_no', direction: 'DESC'},)
      ]
    }

    return this.apollo.watchQuery<Block[]>({
      query: this.blockQueries.getBlocks,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]));
  }

  /**
   * Get messages list query
   * @param _search String for searching
   */
  private getMessages(_search?: string): Observable<Message[]> {

    const _variables = {
      filter: {id: {in: _search}},
      orderBy: [
        new QueryOrderBy({path: 'created_at', direction: 'DESC'}),
      ]
    }

    return this.apollo.watchQuery<Block[]>({
      query: this.messageQueries.getMessages,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.messages]));
  }

  /**
   * Get transaction list query
   * @param _search String for searching
   */
  private getTransaction(_search?: string): Observable<Transaction[]> {

    const _variables = {
      filter: {id: {in: _search}},
      orderBy: [
        new QueryOrderBy({path: 'now', direction: 'DESC'}),
        new QueryOrderBy({path: 'account_addr', direction: 'DESC'}),
        new QueryOrderBy({path: 'lt', direction: 'DESC'})
      ]
    }

    return this.apollo.watchQuery<Transaction[]>({
      query: this.transactionQueries.getTransaction,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.transactions]));
  }

  /**
   * Get accounts list query
   * @param _search String for searching
   */
  private getAccounts(_search?: string): Observable<Account[]> {

    _search = _search && _search.match('-') && _search.match(':')
      ? _search.substring(3, _search.length)
      :  _search && _search.match(':')
        ? _search.substring(2, _search.length)
        : _search;

    const _variables = {
      filter: {id: {in: [`0:${_search}`, `-1:${_search}`]}},
      orderBy: [
        new QueryOrderBy({path: "balance", direction: "DESC"}),
      ]
    }

    return this.apollo.watchQuery<Account[]>({
      query: this.accountQueries.getAccounts,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.accounts]));
  }

  /**
   * Get accounts list query
   * @param _search String for searching
   */
  private getKeyForValidators(): Observable<Block[]> {

    const _variables = {filter: {workchain_id: {eq: -1}}, orderBy: [{path: 'seq_no', direction: 'DESC'}], limit: 1};
    return this.apollo.watchQuery<Block[]>({
      query: this.blockQueries.getMasterBlockPrevKey,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]));
  }

  /**
   * Get accounts list query
   * @param seq_no For configs
   */
  private getValidators(seq_no: number): Observable<Block[]> {

    const _variables = {filter: {seq_no: {eq: seq_no}, workchain_id: {eq: -1}}};
    return this.apollo.watchQuery<Block[]>({
      query: this.blockQueries.getMasterBlockConfig,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]));
  }
}
