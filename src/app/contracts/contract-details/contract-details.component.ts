import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { ContractDetailsService } from './contract-details.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonQueries } from 'src/app/api/queries';
import { Account } from 'src/app/api';
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
   * For details component
   */
  public initDatails(): void {
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
   * Data for model from other queries
   */
  protected getData(): void {

    // Get Total
    this._service.getAggregateData(this.service.getVariablesForBalance(this.modelId), this.commonQueries.getValidatorAggregateAccounts)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.totalBalance = res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    this._service.getAggregateData(this.service.getVariablesForDeployedContracts(this.modelId), this.commonQueries.getValidatorAggregateAccounts)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.deployedContracts = res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    this._service.getAggregateData(this.service.getVariablesForContracts(this.modelId), this.commonQueries.getValidatorAggregateAccounts)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.activeContracts = res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  
    this.service.getAggregateData(this.service.getVariablesForContracts(this.modelId), this.commonQueries.getValidatorAggregateMessages)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.newContracts = res.aggregateMessages[0] ? Number(res.aggregateMessages[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    /** Get accounts */
    this._service.getData(this.service.getVariablesForAccounts(this.modelId), this._service.graphQueryService['getAccounts'], appRouteMap.accounts)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Account[]) => {

        this.accounts = res ? res : [];
        this.tableViewerData =  this._service.mapDataForTable(this.accounts, appRouteMap.accounts, 10, this.totalBalance);
        this.viewersLoading = false;
        this.tableViewersLoading = false;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  }
}
