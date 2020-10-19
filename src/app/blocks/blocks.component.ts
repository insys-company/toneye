import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Block, GeneralViewer, TabViewerData, DataConfig, QueryOrderBy } from '../api';
import { BlocksService } from './blocks.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'underscore';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlocksComponent implements OnInit, OnDestroy {
  /**
   * Для отписок на запросы
   */
  public unsubscribe: Subject<void> = new Subject();
  /**
   * Data for view
   */
  public generalViewerData: Array<GeneralViewer>;
  /**
   * Data for view
   */
  public tableViewerData: Array<TabViewerData>;
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(4);
  /**
   * Flag for loading data of General Viewer
   */
  public generalViewerLoading: boolean;
  /**
   * Flag for loading data of Tabs Viewer
   */
  public tableViewerLoading: boolean;

  /** Array of ... */
  public data: Block[] = [];

  constructor(
    private changeDetection: ChangeDetectorRef,
    private blocksService: BlocksService,
    private router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    /** Loading animation in children */
    this.generalViewerLoading = true;
    this.tableViewerLoading = true;
  }

  /**
   * Initialization of the component
   */
  ngOnInit(): void {
    this.detectChanges();
    this.init();
  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
    // TODO
  }

  /**
   * Export event
   */
  onExport(): void {
    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  onSeeMore(index: number): void {

    // this.tableViewerLoading = true;

    // this.detectChanges();

    let date = this.data[this.data.length - 1].gen_utime;

    const _variables = {
      filter: {gen_utime: {le: date}},
      limit: 25,
      orderBy: [new QueryOrderBy({path: 'gen_utime', direction: 'DESC'})]
    }

    // Get blocks
    this.blocksService.getBlocks(_variables)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: Block[]) => {

        let newData = this.mapData(res);
        this.tableViewerData = _.clone(this.tableViewerData.concat(newData));
        // this.tableViewerLoading = false;

        this.detectChanges();

        // Scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
      
      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Init method
   */
  private init(): void {

    this.blocksService.getGeneralData()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((generalData: any) => {

        const aggregateBlocks = new GeneralViewer({
          title: 'Blocks by current validators',
          value: generalData.aggregateBlocks[0] ? generalData.aggregateBlocks[0] : 0,
          isNumber: true
        });

        // Get master block
        this.blocksService.getMasterBlock()
        .pipe(takeUntil(this.unsubscribe))
          .subscribe((masterBlock: any) => {

            const shards = new GeneralViewer({
              title: 'Workchain shards',
              value: masterBlock[0].master && masterBlock[0].master.shard_hashes
                ? masterBlock[0].master.shard_hashes.length
                : 0,
              isNumber: true,
              // dinamic: true
            });

            // Get blocks
            this.blocksService.getBlocks()
              .pipe(takeUntil(this.unsubscribe))
              .subscribe((res: Block[]) => {

                this.data = res ? res : [];

                const headBlocks = new GeneralViewer({
                  title: 'Head blocks',
                  value: this.data.length ? _.max(this.data, function(b){ return b.seq_no; })['seq_no'] : 0,
                  isNumber: true,
                  dinamic: true
                });

                const averageBlockTime = new GeneralViewer({
                  title: 'Average block time',
                  value: (this.getAverageBlockTime(this.data) + ' sec').replace('.', ','),
                  isNumber: false,
                  dinamic: true
                });

                this.generalViewerData = [];

                this.generalViewerData.push(headBlocks);
                this.generalViewerData.push(averageBlockTime);
                this.generalViewerData.push(aggregateBlocks);
                this.generalViewerData.push(shards);

                this.generalViewerLoading = false;

                this.detectChanges();
        
                this.tableViewerData = this.mapData(this.data);

                this.tableViewerLoading = false;

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

  }

  /**
   * Map list for table
   * @param _list Array of blocks
   */
  private mapData(_list: Block[]): TabViewerData[] {
    if (!_list || !_list.length) { return []; }

    let data = [];
    data = _list.map((b: Block, i) => {
      return new TabViewerData({
        titleLeft: b.seq_no,
        subtitleLeft: new DataConfig({text: `${b.workchain_id}:${b.shard ? b.shard.substring(0, 3) : b.shard}`, type: 'string'}),
        titleRight: new DataConfig({text: (b.tr_count ? b.tr_count : ''), icon: true, iconClass: 'icon-transactions', type: 'number'}),
        subtitleRight: new DataConfig({text: b.gen_utime, type: 'date'})
      });
    });

    data = _.clone(_.first(data, 10))

    return data;
  }

  /**
   * Get average time
   * @param _list Array of blocks
   */
  private getAverageBlockTime(_list: Block[]): number {
    if (!_list || !_list.length) { return 0; }

    let averageTime = 0;

    _list.forEach((b: Block, i: number) => {
      if (_list[i+1]) {
        averageTime += b.gen_utime - _list[i+1].gen_utime;
      }
    });

    averageTime = averageTime/_list.length;

    return Number(averageTime.toFixed(1));
  }

  /**
   * Detect Changes
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
