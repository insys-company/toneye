import { Component, ChangeDetectionStrategy, OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { BlocksService } from './blocks.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonQueries, BlockQueries } from 'src/app/api/queries';
import { ViewerData, ItemList, Block } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlocksComponent extends BaseComponent<Block> implements OnInit, AfterViewChecked, OnDestroy {
  /**
   * Details or list
   */
  protected listMode: boolean = true;

  /**
   * Min time for aggregate data
   */
  protected utime_since: number;

  /**
   * Key for prev block for master block's config
   */
  protected prev_key_block_seqno: number;

  /**
   * Count of shards
   */
  protected shards_length: number = 0;
  /**
   * count of blocks
   */
  protected aggregate_blocks: string;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: BlocksService,
    protected route: ActivatedRoute,
    protected router: Router,
    private commonQueries: CommonQueries,
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

    this.prev_key_block_seqno = null;
    this.utime_since = null;
    this.shards_length = null;
    this.aggregate_blocks = null;
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

    // let date = this.data[this.data.length - 1].gen_utime;

    // const _variables = {
    //   filter: {gen_utime: {le: date}},
    //   orderBy: [{path: 'gen_utime', direction: 'DESC'}],
    //   limit: 25,
    // }

    // // Get blocks
    // this.blocksService.getBlocks(_variables)
    //   .pipe(takeUntil(this.unsubscribe))
    //   .subscribe((res: Block[]) => {

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
    this.getMasterBlock();
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getAggregateData();
  }

  /**
   * Get key of prev block for master config
   */
  private getMasterBlock(): void {
    // Get master block
    this._service.getGeneralData(
      this._service.getVariablesForPrevBlockKey(),
      this.blockQueries.getMasterBlockPrevKey,
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((prevBlock: Block[]) => {

        prevBlock = prevBlock ? prevBlock : [];

        this.prev_key_block_seqno = prevBlock[0] ? prevBlock[0].prev_key_block_seqno : null;

        this.getMasterBlockConfig();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get config for utime_since
   */
  private getMasterBlockConfig(): void {
    // Get master block config
    this._service.getGeneralData(
      this._service.getVariablesForPrevBlockConfig(this.prev_key_block_seqno),
      this.blockQueries.getMasterBlockConfig,
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((masterBlockConfig: Block[]) => {

        masterBlockConfig = masterBlockConfig ? masterBlockConfig : [];

        // For aggregate data
        this.utime_since = masterBlockConfig[0] && masterBlockConfig[0].master && masterBlockConfig[0].master.config && masterBlockConfig[0].master.config.p34
          ? masterBlockConfig[0].master.config.p34.utime_since
          : null;

        // count of shards
        this.shards_length = masterBlockConfig[0] && masterBlockConfig[0].master && masterBlockConfig[0].master && masterBlockConfig[0].master.shard_hashes
          ? masterBlockConfig[0].master.shard_hashes.length
          : 0;

        this.getAggregateData();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get aggregate blocks count
   */
  private getAggregateData(): void {

    this.viewersLoading = true;
    this.tableViewersLoading = true;
    this.detectChanges();

    this._service.getAggregateData(
      this._service.getVariablesForAggregateData(this.params, this.utime_since),
      this.commonQueries.getAggregateBlocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((aggData: any) => {

        this.aggregate_blocks = aggData && aggData.aggregateBlocks[0]
          ? aggData.aggregateBlocks[0]
          : 0;

        this.getBlocks();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Init method
   */
  private getBlocks(): void {
    this._service.getData(
      this._service.getVariablesForBlocks(this.params),
      this.blockQueries.getBlocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        this.processData(res ? res : []);

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get general data
   * @param _data Blocks
   */
  private processData(_data: Block[]): void {

    /** Blocks */
    this.data = new ItemList({
      data: _data ? _data : [],
      page: 0,
      pageSize: 25,
      total: _data ? _data.length : 0
    });

    const aggregateBlocks = new ViewerData({
      title: 'Blocks by current validators',
      value: this.aggregate_blocks,
      dinamic: true,
      isNumber: true
    });

    const shards = new ViewerData({
      title: 'Workchain shards',
      value: this.shards_length,
      isNumber: true
    });

    const headBlocks = new ViewerData({
      title: 'Head blocks',
      value: this.data.data.length ? _.max(this.data.data, function(b){ return b.seq_no; })['seq_no'] : 0,
      dinamic: true,
      isNumber: true
    });

    const averageBlockTime = new ViewerData({
      title: 'Average block time',
      value: (this._service.baseFunctionsService.getAverageTime(this.data.data, 'gen_utime') + ' sec').replace('.', ','),
      dinamic: true,
      isNumber: false
    });

    this.generalViewerData = [];

    this.generalViewerData.push(headBlocks);
    this.generalViewerData.push(averageBlockTime);
    this.generalViewerData.push(aggregateBlocks);
    this.generalViewerData.push(shards);

    this.viewersLoading = false;

    this.detectChanges();

    this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.blocks, 10);

    this.tableViewersLoading = false;

    this.filterLoading = false;

    this.initComplete = true;

    this.detectChanges();
  }
}
