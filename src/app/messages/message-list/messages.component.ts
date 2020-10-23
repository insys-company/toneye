import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Message, ViewerData, TabViewerData, DataConfig, QueryOrderBy } from '../../api';
import { MessagesService } from './messages.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'underscore';
import { appRouteMap } from '../../app-route-map';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent implements OnInit, OnDestroy {
  /**
   * Для отписок на запросы
   */
  public unsubscribe: Subject<void> = new Subject();
  /**
   * Data for view
   */
  public generalViewerData: Array<ViewerData>;
  /**
   * Data for view
   */
  public tableViewerData: Array<TabViewerData>;
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(2);
  /**
   * Flag for loading data of General Viewer
   */
  public generalViewerLoading: boolean;
  /**
   * Flag for loading data of Tabs Viewer
   */
  public tableViewerLoading: boolean;

  /** Array of ... */
  public data: Message[] = [];

  constructor(
    private changeDetection: ChangeDetectorRef,
    private messagesService: MessagesService,
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
   * Event of select
   * @param item Selected item from table
   */
  public onSelectItem(item: TabViewerData): void {

    if (item.id) {
      this.router.navigate([`/${appRouteMap.message}/${item.id}`]);
    }

  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  onSeeMore(index: number): void {

    // this.tableViewerLoading = true;

    // this.detectChanges();

    let date = this.data[this.data.length - 1].created_at;

    const _variables = {
      filter: {created_at: {le: date}},
      orderBy: [{path: 'created_at', direction: 'DESC'}],
      limit: 25,
    }

    // Get messages
    this.messagesService.getMessages(_variables)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: Message[]) => {

        let newData = this.mapData(res);
        this.tableViewerData = _.clone(this.tableViewerData.concat(newData));
        // this.tableViewerLoading = false;

        this.detectChanges();

        // Scroll to bottom
        // window.scrollTo(0, document.body.scrollHeight);
      
      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Init method
   */
  private init(): void {

    this.messagesService.getGeneralData()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((generalData: any) => {

        const aggregateMessages = new ViewerData({
          title: 'Message count',
          value: generalData.aggregateMessages[0] ? generalData.aggregateMessages[0] : 0,
          isNumber: true
        });

        // Get messages
        this.messagesService.getMessages()
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((res: Message[]) => {

            this.data = res ? res : [];

            const mps = new ViewerData({
              title: 'MPS',
              value: (this.getAverageTime(this.data) + ' sec').replace('.', ','),
              isNumber: false,
              dinamic: true
            });

            this.generalViewerData = [];

            this.generalViewerData.push(aggregateMessages);
            this.generalViewerData.push(mps);

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

  }

  /**
   * Get average time
   * @param _list Array of items
   */
  private getAverageTime(_list: Message[]): number {
    if (!_list || !_list.length) { return 0; }

    let averageTime = 0;

    _list.forEach((item: Message, i: number) => {
      if (_list[i+1]) {
        averageTime += item.created_at - _list[i+1].created_at;
      }
    });

    averageTime = averageTime/_list.length;

    return Number(averageTime.toFixed(1));
  }

  /**
   * Map messages for table
   * @param _list Array of messages
   */
  private mapData(_list: Message[]): TabViewerData[] {
    if (!_list || !_list.length) { return []; }

    let data = [];
    data = _list.map((m: Message, i: number) => {

      m.value = m.value && m.value.match('x') ? String(parseInt(m.value, 16)) : m.value;

      return new TabViewerData({
        id: m.id,
        url: appRouteMap.message,
        titleLeft: m.id,
        subtitleLeft: new DataConfig({
          text: `${(!m.src || m.src == '') ? 'ext' : m.src.substring(0, 6)} -> ${(!m.dst || m.dst == '') ? 'ext' : m.dst.substring(0, 6)}`,
          type: 'string'
        }),
        titleRight: new DataConfig({text: m.value, icon: true, iconClass: 'icon-gem', type: 'number'}),
        subtitleRight: new DataConfig({text: m.created_at, type: 'date'})
      });
    });

    data = _.clone(_.first(data, 10))

    return data;
  }

  /**
   * Detect Changes
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
