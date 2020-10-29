import { Component, ChangeDetectionStrategy, OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { AccountsService } from './accounts.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonQueries, MessageQueries, AccountQueries } from 'src/app/api/queries';
import { ViewerData, TabViewerData, ItemList, Account } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsComponent extends BaseComponent<Account> implements OnInit, AfterViewChecked, OnDestroy {
  /**
   * Details or list
   */
  protected listMode: boolean = true;
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(2);

  /**
   * Balance
   */
  public totalBalance: number; 

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: AccountsService,
    protected route: ActivatedRoute,
    protected router: Router,
    private commonQueries: CommonQueries,
    private accountQueries: AccountQueries,
  ) {
    super(
      changeDetection,
      _service,
      route,
      router,
    );
  }

  /**
   * Initialization of the component
   * For list component
   */
  public initList(): void {
    this.route.queryParams
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((queryParams: Params) => {

        this.params = _.clone(this._service.baseFunctionsService.getFilterParams(queryParams, this.params));

        this.detectChanges();

        if (this.initComplete) {
          this.refreshData();
        }

      });

    this.initMethod();
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();

    this.totalBalance = null;
  }


  /**
   * Export method
   */
  public onExport(): void {
    // TODO
  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {

    // // this.tableViewerLoading = true;

    // // this.detectChanges();

    // let balance = this.data[this.data.length - 1].balance;

    // balance = balance && balance.match('x') ? String(parseInt(balance, 16)) : balance;

    // const _variables = {
    //   filter: {balance: {le: balance}},
    //   orderBy: [{path: 'balance', direction: 'DESC'}],
    //   limit: 25,
    // }

    // // Get accounts
    // this.accountsService.getAccounts(_variables)
    //   .pipe(takeUntil(this.unsubscribe))
    //   .subscribe((res: Account[]) => {

    //     let newData = this.mapData(res);
    //     this.tableViewerData = _.clone(this.tableViewerData.concat(newData));
    //     // this.tableViewerLoading = false;

    //     this.detectChanges();

    //     // Scroll to bottom
    //     // window.scrollTo(0, document.body.scrollHeight);
      
    //   }, (error: any) => {
    //     console.log(error);
    //   });
  }

  /**
   * First intit
   */
  protected initMethod(): void {
    this.getAggregateData();
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getAccounts();
  }

  /**
   * Get aggregate messages count
   */
  private getAggregateData(): void {
    this._service.getAggregateData(
      this._service.getVariablesForAggregateData(),
      this.commonQueries.getGeneralAccountData
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((generalData: any) => {

        this.generalViewerData = [];

        const getAccountsCount = new ViewerData({
          title: 'Accounts',
          value: generalData && generalData.getAccountsCount ? generalData.getAccountsCount : 0,
          isNumber: true
        });

        const getAccountsTotalBalance = new ViewerData({
          title: 'Coins',
          value: generalData && generalData.getAccountsTotalBalance ? generalData.getAccountsTotalBalance : 0,
          isNumber: true
        });

        this.totalBalance = Number(generalData.getAccountsTotalBalance);

        this.generalViewerData = [];

        this.generalViewerData.push(getAccountsCount);
        this.generalViewerData.push(getAccountsTotalBalance);

        this.viewersLoading = false;

        this.detectChanges();

        this.getAccounts();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get account list
   */
  private getAccounts(): void {

    this.tableViewersLoading = true;
    this.detectChanges();

    this._service.getData(
      this._service.getVariablesForAccounts(this.params),
      this.accountQueries.getAccounts
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Account[]) => {

        this.processData(res ? res : []);

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get general data
   * @param _data Accounts
   */
  private processData(_data: Account[]): void {

    /** Accounts */
    this.data = new ItemList({
      data: _data ? _data : [],
      page: 0,
      pageSize: 25,
      total: _data ? _data.length : 0
    });

    this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.accounts, 10, this.totalBalance);

    this.tableViewersLoading = false;

    this.filterLoading = false;

    this.initComplete = true;

    this.detectChanges();
  }
}
