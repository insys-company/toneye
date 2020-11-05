import { Component, ChangeDetectionStrategy, OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { MessagesService } from './messages.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonQueries, MessageQueries } from 'src/app/api/queries';
import { ViewerData, TabViewerData, ItemList, Message, SimpleDataFilter } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';

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


  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.messagesPage,
    date: LocaleText.timeFilterPlaceholder,
    tons: LocaleText.tonCountFilterPlaceholder,
    loadMore: LocaleText.loadMore,
    autoupdate: LocaleText.autoupdate,
    items: LocaleText.messages
  };

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
    protected dialog: MatDialog,
    private commonQueries: CommonQueries,
    private messageQueries: MessageQueries,
  ) {
    super(
      changeDetection,
      _service,
      route,
      router,
      dialog
    );
  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    this.tableViewersLoading = true;

    this.detectChanges();

    let date = this.data && this.data.data ? _.last(this.data.data).created_at : null;

    let _p = this.params ?  _.clone(this.params) : new SimpleDataFilter();

    _p.toDate = date + '';

    // Одиночный вызов сообщений
    if (this.isSingleQuery) {

      this._service.getData(
        this._service.getVariablesForMessages(_p, null, 25),
        this.messageQueries.getMessages
      )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((res: Message[]) => {
  
          this.data.data = this.data.data.concat(res ? res : []);
          this.data.total = this.data.data.length;
      
          this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.messages, 25);
      
          this.tableViewersLoading = false;
      
          this.filterLoading = false;
      
          this.detectChanges();
  
        }, (error: any) => {
          console.log(error);
        });

    }

    // Запросы на сообщения по источникам и получателям
    else {

      this._service.getData(
        this._service.getVariablesForMessages(this.params, true, 25),
        this.messageQueries.getMessages
      )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((srcData: Message[]) => {
  
          srcData = srcData ? srcData : [];

          this._service.getData(
            this._service.getVariablesForMessages(this.params, false, 25),
            this.messageQueries.getMessages
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((dstData: Message[]) => {

              dstData = dstData ? dstData : [];

              // Объединение двух массивов и сортировка
              let res = srcData.concat(dstData);

              res = (_.sortBy(res, 'created_at')).reverse();

              this.data.data = this.data.data.concat(res = res ? res : []);
              this.data.total = this.data.data.length;
          
              this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.messages, 25);
          
              this.tableViewersLoading = false;
          
              this.filterLoading = false;
          
              this.detectChanges();
      
            }, (error: any) => {
              console.log(error);
            });
  
        }, (error: any) => {
          console.log(error);
        });

    }
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

    if (!this.autoupdate) {
      this.viewersLoading = true;
      this.tableViewersLoading = true;
      this.detectChanges();
    }

    this._service.getAggregateData(
      this._service.getVariablesForAggregateData(this.params),
      this.commonQueries.getAggregateMessages
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((generalData: any) => {

        this.generalViewerData = [];

        const aggregateMessages = new ViewerData({
          title: LocaleText.messageCount,
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
  
          res = res ? res : [];

          if (!this.autoupdate) {
            this.processData(res);
          }
          else {
            this.newDataAfterUpdate = this.newDataAfterUpdate ? this.newDataAfterUpdate : [];
  
            let uniqItems = [];
  
            res.forEach((item: Message) => {
              let filterItem = _.findWhere(this.data.data, {id: item.id});
              let filterNewItem = _.findWhere(this.newDataAfterUpdate, {id: item.id});
              if (!filterItem && !filterNewItem) { uniqItems.push(item); }
            });
  
            if (uniqItems.length) {
              this.newDataAfterUpdate = _.clone(uniqItems.concat(this.newDataAfterUpdate));
              this.newDataAfterUpdateForView = this._service.mapDataForTable(this.newDataAfterUpdate, appRouteMap.messages);
            }
  
            const mps = new ViewerData({
              title: LocaleText.mps,
              value: (this._service.baseFunctionsService.getAverageTime(_.first(_.clone(this.newDataAfterUpdate.concat(this.data.data)), 50), 'created_at') + '').replace('.', ','),
              isNumber: false
            });

            this.generalViewerData = this.generalViewerData.splice(0, 1);
        
            this.generalViewerData.push(mps);
  
            this.detectChanges();
          }
  
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
              let res = srcData.concat(dstData);

              res = (_.sortBy(res, 'created_at')).reverse();

              if (!this.autoupdate) {
                this.processData(res);
              }
              else {
                this.newDataAfterUpdate = this.newDataAfterUpdate ? this.newDataAfterUpdate : [];
      
                let uniqItems = [];
      
                res.forEach((item: Message) => {
                  let filterItem = _.findWhere(this.data.data, {id: item.id});
                  let filterNewItem = _.findWhere(this.newDataAfterUpdate, {id: item.id});
                  if (!filterItem && !filterNewItem) { uniqItems.push(item); }
                });
      
                if (uniqItems.length) {
                  this.newDataAfterUpdate = _.clone(uniqItems.concat(this.newDataAfterUpdate));
                  this.newDataAfterUpdateForView = this._service.mapDataForTable(this.newDataAfterUpdate, appRouteMap.messages);
                }
      
                const mps = new ViewerData({
                  title: LocaleText.mps,
                  value: (this._service.baseFunctionsService.getAverageTime(_.first(_.clone(this.newDataAfterUpdate.concat(this.data.data)), 50), 'created_at') + '').replace('.', ','),
                  isNumber: false
                });

                this.generalViewerData = this.generalViewerData.splice(0, 1);
            
                this.generalViewerData.push(mps);
      
                this.detectChanges();
              }
      
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
      title: LocaleText.mps,
      value: (this._service.baseFunctionsService.getAverageTime(this.data.data, 'created_at') + '').replace('.', ','),
      isNumber: false
    });

    this.generalViewerData = this.generalViewerData.splice(0, 1);

    this.generalViewerData.push(mps);

    this.viewersLoading = false;

    this.detectChanges();

    this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.messages, 25);

    this.tableViewersLoading = false;

    this.filterLoading = false;

    this.detectChanges();
  }
}
