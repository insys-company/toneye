import { Component, ChangeDetectionStrategy, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { appRouteMap } from './app-route-map';
import { RouterOutlet, Router, NavigationStart } from '@angular/router';
import { routeAnimation } from './app-animations';
import { Breadcrumbs, Block, Message, Transaction, QueryOrderBy, Validator } from './api';
import { takeUntil, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { BlockQueries } from './api/queries';
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
    appRouteMap.home,
    appRouteMap.blocks,
    appRouteMap.transactions,
    appRouteMap.messages,
    appRouteMap.accounts,
    // this.validators
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
  public foundValidators: Validator[] = [];

  constructor(
    private changeDetection: ChangeDetectorRef,
    private router: Router,
    private apollo: Apollo,
    private blockQueries: BlockQueries,
    // private commonQueries: CommonQueries,
    // private messageQueries: MessageQueries,
    // private transactionQueries: TransactionQueries,
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
  ngOnInit(): void {
    this.routerSubscribe();
    // this.detectChanges();
  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
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
  onSearch(search: string): void {
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
   * Method for ngFor optimization (Menu)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifyMenu(index: number, item: string): string { return item; }

  /**
   * Method for ngFor optimization (Breadcrumbs list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifyBreadcrumbs(index: number, item: Breadcrumbs): string { return item.name; }

  /**
   * Method for route animation
   * @param outlet Router outlet for animation
   */
  prepareRouteForAnimation(outlet: RouterOutlet): any {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }

  /**
   * Redirect by link from breadcrumbs
   * @param indexOfItem Index of selected item
   * @param item Selected breadcrumb
   */
  onRedirect(indexOfItem: number, item: Breadcrumbs): void {
    if (item.url != null && indexOfItem !== (this.breadcrumbs.length - 1)) {
      this.router.navigate([`/${item.url}`]);
    }
  }

  /**
   * Check url and change breadcrumbs object
   */
  private routerSubscribe(): void {
    this.router.events
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(event => {
        if (event instanceof NavigationStart) {

          const _url = event.url != null ? event.url.replace('/', '').toLowerCase() : '';
          this.breadcrumbs = this.breadcrumbs.slice(0, 1);

          if (_url == appRouteMap.home) { return; }

          this.breadcrumbs.push(new Breadcrumbs({ name: _url, url: _url }));
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
      .subscribe((res: Block[]) => {

        // Для вызова в child ngOnChanges
        this.foundBlocks = JSON.parse(JSON.stringify(res)) ? JSON.parse(JSON.stringify(res)) : JSON.parse(JSON.stringify([]));
        this.detectChanges();

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

    console.log('e');

    return this.apollo.watchQuery<Block[]>({
      query: this.blockQueries.getBlocks,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]))
  }
}
