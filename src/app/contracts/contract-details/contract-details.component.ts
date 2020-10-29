import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { ContractDetailsService } from './contract-details.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonQueries, AccountQueries } from 'src/app/api/queries';
import { Account, ItemList } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';

@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractDetailsComponent extends BaseComponent<Account> implements OnInit, OnDestroy {
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(3);
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
    private accountQueries: AccountQueries,
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
   * For details component
   */
  public initDatails(): void {
    this.route.params
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((params: Params) => {
        this.modelId = params['id'] != null ? params['id'].trim() : null;

        this.initList();

      })
      .unsubscribe();
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.totalBalance = null;
    this.deployedContracts = null;
    this.activeContracts = null;
    this.newContracts = null;
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
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    // TODO
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getData();
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {

    this.viewersLoading = true;
    this.tableViewersLoading = true;
    this.detectChanges();

    // get by balance
    this._service.getAggregateData(
      this.service.getVariablesForAggregateAccounts(this.params, String(this.modelId), true),
      this.commonQueries.getValidatorAggregateAccounts
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.totalBalance = res && res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    // Get by type
    this._service.getAggregateData(
      this.service.getVariablesForAggregateAccounts(this.params, String(this.modelId), false, true),
      this.commonQueries.getValidatorAggregateAccounts
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.deployedContracts = res && res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    // Get by hash only
    this._service.getAggregateData(
      this.service.getVariablesForAggregateAccounts(this.params, String(this.modelId)),
      this.commonQueries.getValidatorAggregateAccounts
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.activeContracts = res && res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  
    // Get message
    this._service.getAggregateData(
      this.service.getVariablesForAggregateMessages(this.params, String(this.modelId)),
      this.commonQueries.getAggregateMessages
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.newContracts = res && res.aggregateMessages[0] ? Number(res.aggregateMessages[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    /** Get accounts */
    this._service.getData(
      this.service.getVariablesForAggregateAccounts(this.params, String(this.modelId), false, false, true),
      this.accountQueries.getAccounts,
      appRouteMap.accounts
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
   * @param _data Account
   */
  private processData(_data: Account[]): void {

    /** Accounts */
    this.data = new ItemList({
      data: _data ? _data : [],
      page: 0,
      pageSize: 25,
      total: _data ? _data.length : 0
    });

    this.viewersLoading = false;

    this.detectChanges();

    this.tableViewerData =  this._service.mapDataForTable(this.data.data, appRouteMap.accounts, 10, this.totalBalance);
        
    this.detectChanges();

    this.tableViewersLoading = false;

    this.filterLoading = false;

    this.detectChanges();
  }
}