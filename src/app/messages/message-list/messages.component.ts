import { Component, ChangeDetectionStrategy, OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { MessagesService } from './messages.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonQueries, MessageQueries } from 'src/app/api/queries';
import { ViewerData, TabViewerData, ItemList, Message } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent extends BaseComponent<Message> implements OnInit, AfterViewChecked, OnDestroy {
  /**
   * Details or list
   */
  protected listMode: boolean = true;
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(2);

  /**
   * Single request for messages by params
   */
  public get isSingleQuery(): boolean {
    return !this.params || (this.params.chain == null && this.params.ext_int != 'ext') ? true : false
  }

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: MessagesService,
    protected route: ActivatedRoute,
    protected router: Router,
    private commonQueries: CommonQueries,
    private messageQueries: MessageQueries,
  ) {
    super(
      changeDetection,
      _service,
      route,
      router,
    );
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

    // let date = this.data[this.data.length - 1].created_at;

    // const _variables = {
    //   filter: {created_at: {le: date}},
    //   orderBy: [{path: 'created_at', direction: 'DESC'}],
    //   limit: 25,
    // }

    // // Get messages
    // this.messagesService.getMessages(_variables)
    //   .pipe(takeUntil(this.unsubscribe))
    //   .subscribe((res: Message[]) => {

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
   * Получение данных
   */
  protected refreshData(): void {
    this.getAggregateData();
  }

  /**
   * Get aggregate messages count
   */
  private getAggregateData(): void {

    this.viewersLoading = true;
    this.tableViewersLoading = true;
    this.detectChanges();

    this._service.getAggregateData(
      this._service.getVariablesForAggregateData(this.params),
      this.commonQueries.getAggregateMessages
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((generalData: any) => {

        this.generalViewerData = [];

        const aggregateMessages = new ViewerData({
          title: 'Message count',
          value: generalData.aggregateMessages[0] ? generalData.aggregateMessages[0] : 0,
          isNumber: true
        });

        this.generalViewerData.push(aggregateMessages);

        this.getMessages();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get message list
   */
  private getMessages(): void {

    // Одиночный вызов сообщений
    if (this.isSingleQuery) {

      this._service.getData(
        this._service.getVariablesForMessages(this.params),
        this.messageQueries.getMessages
      )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((res: Message[]) => {
  
          this.processData(res);
  
        }, (error: any) => {
          console.log(error);
        });

    }

    // Запросы на сообщения по источникам и получателям
    else {

      this._service.getData(
        this._service.getVariablesForMessages(this.params, true),
        this.messageQueries.getMessages
      )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((srcData: Message[]) => {
  
          srcData = srcData ? srcData : [];

          this._service.getData(
            this._service.getVariablesForMessages(this.params, false),
            this.messageQueries.getMessages
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((dstData: Message[]) => {

              dstData = dstData ? dstData : [];

              // Объединение двух массивов и сортировка
              let _data = srcData.concat(dstData);

              _data = (_.sortBy(_data, 'created_at')).reverse();

              this.processData(_data);
      
            }, (error: any) => {
              console.log(error);
            });
  
        }, (error: any) => {
          console.log(error);
        });

    }

  }

  /**
   * Get general data
   * @param _data Messages
   */
  private processData(_data: Message[]): void {

    /** Messages */
    this.data = new ItemList({
      data: _data ? _data : [],
      page: 0,
      pageSize: 25,
      total: _data ? _data.length : 0
    });

    const mps = new ViewerData({
      title: 'MPS',
      value: (this._service.baseFunctionsService.getAverageTime(this.data.data, 'created_at') + ' sec').replace('.', ','),
      isNumber: false,
      dinamic: true
    });

    this.generalViewerData.push(mps);

    this.viewersLoading = false;

    this.detectChanges();

    this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.messages, 10);

    this.tableViewersLoading = false;

    this.filterLoading = false;

    this.detectChanges();
  }
}
