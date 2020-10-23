import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Block, ViewerData, TabViewerData, DataConfig, QueryOrderBy, ValidatorSetList, ValidatorSet, Validator, BlockMasterConfig } from '../../api';
import { ValidatorsService } from './validators.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import { AppListComponent } from 'src/app/shared/components/app-list/app-list.component';
import _ from 'underscore';
import { BlockQueries } from 'src/app/api/queries';

@Component({
  selector: 'app-validators',
  templateUrl: './validators.component.html',
  styleUrls: ['./validators.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidatorsComponent extends AppListComponent<any> implements OnInit, OnDestroy {
  /**
   * Validators
   */
  public previosValidators: ValidatorSet;
  public currentValidators: ValidatorSet;
  public nextValidators: ValidatorSet;

  /**
   * key of previos block
   */
  public prevBlockKey: number;

  /**
   * General Data for view
   */
  public generalViewerData: Array<ViewerData>;
  /**
   * Aditional Data for view
   */
  public aditionalViewerData: Array<ViewerData>;
  /**
   * Aditional Data for view
   */
  public p15ViewerData: Array<ViewerData>;
  /**
   * Aditional Data for view
   */
  public p16ViewerData: Array<ViewerData>;
  /**
   * Aditional Data for view
   */
  public p17ViewerData: Array<ViewerData>;

  /**
   * Data for view
   */
  public tableViewerDataPrev: Array<TabViewerData>;

  /**
   * Data for view
   */
  public tableViewerDataNext: Array<TabViewerData>;

  /**
   * Tab index
   * (For styles and queries in parent component)
   */
  public selectedTabIndex: number = 0;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: ValidatorsService,
    protected route: ActivatedRoute,
    protected router: Router,
    private blockQueries: BlockQueries,
  ) {
    super(
      changeDetection,
      _service,
      route,
      router,
    );
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.previosValidators = null;
    this.currentValidators = null;
    this.nextValidators = null;
    this.prevBlockKey = null;
    this.generalViewerData = null;
    this.aditionalViewerData = null;
    this.p15ViewerData = null;
    this.p16ViewerData = null;
    this.p17ViewerData = null;
    this.tableViewerDataPrev = null;
    this.tableViewerDataNext = null;
  }

  /**
   * Export method
   */
  public onExport(): void {
    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  public onChangeTab(index: number): void {

    if (index == this.selectedTabIndex) { return; }

    this.selectedTabIndex = index;
    // this.tableViewerLoading = true;
    // this.tableViewerData = [];
    // this.detectChanges();

    // this.tableViewerData = index == 0
    //   ? this.mapTransactions(this.transactions)
    //   : index == 1
    //     ? this.mapMessages(this.inMessages)
    //     : this.mapMessages(this.outMessages);

    // this.tableViewerLoading = false;
    this.detectChanges();

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
    this.getPrevBlockKey();
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {
    // TODO
  }

  /**
   * Map messages for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: BlockMasterConfig, _data?: any): void {


    this.p15ViewerData = [];
    this.p15ViewerData.push(new ViewerData({title: 'Validators elected for', value: _model.p15.validators_elected_for}));
    this.p15ViewerData.push(new ViewerData({title: 'Elections start before', value: _model.p15.elections_start_before}));
    this.p15ViewerData.push(new ViewerData({title: 'Elections end before', value: _model.p15.elections_end_before}));
    this.p15ViewerData.push(new ViewerData({title: 'Stake held for', value: _model.p15.stake_held_for}));

    this.p16ViewerData = [];
    this.p16ViewerData.push(new ViewerData({title: 'Max main validators', value: _model.p16.max_main_validators, isNumber: true}));
    this.p16ViewerData.push(new ViewerData({title: 'Max validators', value: _model.p16.max_validators, isNumber: true}));
    this.p16ViewerData.push(new ViewerData({title: 'Min validators', value: _model.p16.min_validators, isNumber: true}));

    this.p17ViewerData = [];
    this.p17ViewerData.push(new ViewerData({title: 'Max stake', value: _model.p17.max_stake, isNumber: true}));
    this.p17ViewerData.push(new ViewerData({title: 'Max stake factor', value: _model.p17.max_stake_factor, isNumber: true}));
    this.p17ViewerData.push(new ViewerData({title: 'Min stake', value: _model.p17.min_stake, isNumber: true}));
    this.p17ViewerData.push(new ViewerData({title: 'Min total stake', value: _model.p17.min_total_stake, isNumber: true}));

    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new ViewerData({title: 'Since', value: _model.p32.utime_since, isDate: true}));
    this.aditionalViewerData.push(new ViewerData({title: 'Until', value: _model.p32.utime_until, isDate: true}));
  }

  /**
   * Init method
   */
  private init(): void {

    // this.validatorsService.getGeneralData()
    //   .pipe(takeUntil(this.unsubscribe))
    //   .subscribe((generalData: any) => {

    //     const aggregateBlocks = new ViewerData({
    //       title: 'Blocks by current validators',
    //       value: generalData.aggregateBlocks[0] ? generalData.aggregateBlocks[0] : 0,
    //       isNumber: true
    //     });

    //     // Get master block
    //     this.validatorsService.getMasterBlock()
    //     .pipe(takeUntil(this.unsubscribe))
    //       .subscribe((masterBlock: any) => {

    //         const shards = new ViewerData({
    //           title: 'Workchain shards',
    //           value: masterBlock[0].master && masterBlock[0].master.shard_hashes
    //             ? masterBlock[0].master.shard_hashes.length
    //             : 0,
    //           isNumber: true,
    //           // dinamic: true
    //         });

    //         // Get blocks
    //         this.validatorsService.getBlocks()
    //           .pipe(takeUntil(this.unsubscribe))
    //           .subscribe((res: Block[]) => {

    //             this.data = res ? res : [];

    //             const headBlocks = new ViewerData({
    //               title: 'Head blocks',
    //               value: this.data.length ? _.max(this.data, function(b){ return b.seq_no; })['seq_no'] : 0,
    //               isNumber: true,
    //               dinamic: true
    //             });

    //             const averageBlockTime = new ViewerData({
    //               title: 'Average block time',
    //               value: (this.getAverageBlockTime(this.data) + ' sec').replace('.', ','),
    //               isNumber: false,
    //               dinamic: true
    //             });

    //             this.generalViewerData = [];

    //             this.generalViewerData.push(headBlocks);
    //             this.generalViewerData.push(averageBlockTime);
    //             this.generalViewerData.push(aggregateBlocks);
    //             this.generalViewerData.push(shards);

    //             this.generalViewerLoading = false;

    //             this.detectChanges();
        
    //             this.tableViewerData = this.mapData(this.data);

    //             this.tableViewerLoading = false;

    //             this.detectChanges();

    //           }, (error: any) => {
    //             console.log(error);
    //           });
    
    //       }, (error: any) => {
    //         console.log(error);
    //       });


    //   }, (error: any) => {
    //     console.log(error);
    //   });

  }

  /**
   * 
   */
  private getPrevBlockKey(): void {
    const _variables = {filter: {workchain_id: {eq: -1}}, orderBy: [{path: 'seq_no', direction: 'DESC'}], limit: 1};
    this._service.getData(_variables, this.blockQueries.getMasterBlockPrevKey)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        this.prevBlockKey = res[0]
          ? res[0].prev_key_block_seqno
          : null;

        if (this.prevBlockKey != null) {
          this.getPrevBlockConfig();
        }

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * 
   */
  private getPrevBlockConfig(): void {
    const _variables = {filter: {seq_no: {eq: this.prevBlockKey}, workchain_id: {eq: -1}}};
    this._service.getData(_variables, this.blockQueries.getMasterBlockConfig)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        this.data = res ? res : [];

        this.previosValidators = this.data[0] && this.data[0].master && this.data[0].master.config
          ? new ValidatorSet(this.data[0].master.config.p32)
          : new ValidatorSet();

        this.currentValidators = this.data[0] && this.data[0].master && this.data[0].master.config
          ? new ValidatorSet(this.data[0].master.config.p34)
          : new ValidatorSet();

        this.nextValidators = this.data[0] && this.data[0].master && this.data[0].master.config
          ? new ValidatorSet(this.data[0].master.config.p36)
          : new ValidatorSet();

        this.mapDataForViews(this.data[0] && this.data[0].master ? this.data[0].master.config : null);

        this.viewersLoading = false;

        this.detectChanges();

        this.tableViewerDataPrev = this.mapDataForTable(this.previosValidators.list, appRouteMap.validators, 10, this.previosValidators.total_weight);
        this.tableViewerData = this.mapDataForTable(this.currentValidators.list, appRouteMap.validators, 10, this.currentValidators.total_weight);
        this.tableViewerDataNext = this.mapDataForTable(this.nextValidators.list, appRouteMap.validators, 10, this.nextValidators.total_weight);

        this.tableViewersLoading = false;

        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  }
}
