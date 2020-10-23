import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Account, TabViewerData, DataConfig } from '../../api';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { ContractDetailsService } from './contract-details.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AppDetailsComponent } from 'src/app/shared/components/app-details/app-details.component';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';
import { CommonQueries } from 'src/app/api/queries';

@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractDetailsComponent extends AppDetailsComponent<Account> implements OnInit, OnDestroy {
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(3);
  /**
   * Accounts
   */
  public accounts: Array<Account>;
  /**
   * Account's balance
   */
  public totalBalance: number;
  /**
   * Deployed
   */
  public deployedContracts: number;
  /**
   * Active acc in period
   */
  public activeContracts: number;
  /**
   * New acc in period
   */
  public newContracts: number;

  /**
   * Data for view
   */
  public tableViewerData: Array<TabViewerData>;
  /**
   * Flag for loading data of Tabs Viewer
   */
  public tableViewerLoading: boolean;

  /**
   * Flag for filter open\hide
   */
  public isFilterOpen: boolean = true;

  /**
   * Flag for filter hide btn
   */
  public isFilterHideBtnVisible: boolean = false;

  /**
   * Flag for footer
   */
  public isFilterFooterVisible: boolean = false;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: ContractDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
    private commonQueries: CommonQueries,
  ) {

    super(
      changeDetection,
      service,
      route,
      router,
    );

  }

  /**
   * Initialization of the component
   */
  public ngOnInit(): void {

    this.subscribeInit();
    this.detectChanges();

    this.route.params
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((params: Params) => {
        this.modelId = params['id'] != null ? params['id'].trim() : null;

        // Get aditional data
        this.getData();

      })
      .unsubscribe();
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.accounts = null;
    this.totalBalance = null;
    this.detectChanges = null;
    this.activeContracts = null;
    this.newContracts = null;
    this.tableViewerData = null;
    this.tableViewerLoading = null;
    this.isFilterOpen = null;
    this.isFilterHideBtnVisible = null;
    this.isFilterFooterVisible = null;
  }

  /**
   * Export event
   */
  public onExport(): void {
    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  public onSeeMore(index: number): void {
    // TODO
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {

    // Get Total
    let _variables1 = {
      filter: {code_hash: {eq: this.modelId}},
      orderBy: [
        {path: 'balance', direction: 'DESC'},
        {path: 'seq_no', direction: 'DESC'}
      ],
      fields: [{field: 'balance', fn: 'SUM'}],
      limit: 50
    }

    this.service.getAggregateData(_variables1, this.commonQueries.getValidatorAggregateAccounts)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.totalBalance = res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    let _variables2 = {
      filter: {
        code_hash: {eq: this.modelId},
        acc_type: {eq: 1}
      }
    }

    this.service.getAggregateData(_variables2, this.commonQueries.getValidatorAggregateAccounts)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.deployedContracts = res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    let _variables3 = {
      filter: {code_hash: {eq: this.modelId}}
    }

    this.service.getAggregateData(_variables3, this.commonQueries.getValidatorAggregateAccounts)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.activeContracts = res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  
    this.service.getAggregateData(_variables3, this.commonQueries.getValidatorAggregateMessages)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.newContracts = res.aggregateMessages[0] ? Number(res.aggregateMessages[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    this.service.getAccounts(this.modelId)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Account[]) => {

        this.accounts = res ? res : [];
        this.tableViewerData = this.mapAccounts(this.accounts);
        this.viewersLoading = false;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Map list for table
   * @param _list Array of account
   */
  private mapAccounts(_list: Account[]): TabViewerData[] {
    if (!_list || !_list.length) { return []; }

    let data = [];
    data = _list.map((item: Account, i: number) => {

      item.balance = item.balance && item.balance.match('x') ? String(parseInt(item.balance, 16)) : item.balance;

      return new TabViewerData({
        id: item.id,
        url: appRouteMap.account,
        titleLeft: item.id,
        subtitleLeft: new DataConfig({
          text: item.last_paid == 0 ? '' : `${item.last_paid}`,
          type: item.last_paid == 0 ? 'string' : 'date'
        }),
        titleRight: new DataConfig({text: item.balance, icon: true, iconClass: 'icon-gem', type: 'number'}),
        subtitleRight: new DataConfig({
          text: Number(item.balance) != null
            ? Number(((Number(item.balance)/this.totalBalance)*100).toFixed(2))
            : 0,
          type: 'percent'})
      });
    });

    data = _.clone(_.first(data, 10))

    return data;
  }
}
