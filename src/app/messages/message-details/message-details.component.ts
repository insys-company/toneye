import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { MessageDetailsService } from './message-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionQueries } from 'src/app/api/queries';
import { Message, ViewerData, Transaction } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-message-details',
  templateUrl: './message-details.component.html',
  styleUrls: ['./message-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDetailsComponent extends BaseComponent<Message> implements OnInit, OnDestroy {
  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.messagePage,
    moreDetails: LocaleText.moreDetails,
  };
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(7);

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: MessageDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    private transactionQueries: TransactionQueries,
  ) {
    super(
      changeDetection,
      service,
      route,
      router,
      dialog
    );
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {
    /** Get transaction for out msgs */
    this.service.getData(
      this.service.getVariablesForOutMsgs(this.modelId),
      this.transactionQueries.getTransaction,
      appRouteMap.transactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((in_trasaction: Transaction[]) => {

        if(in_trasaction[0]) {
          this.mapDataForViews(this.model, new Transaction(in_trasaction[0]));
          this.viewersLoading = false;
          this.detectChanges();
        }
        else {
          /** Get transaction for in msgs */
          this.service.getData(
            this.service.getVariablesForInMsgs(this.modelId),
            this.transactionQueries.getTransaction,
            appRouteMap.transactions
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((out_trasaction: Transaction[]) => {

              out_trasaction[0] = out_trasaction[0]
                ? new Transaction(out_trasaction[0])
                : new Transaction();

              this.mapDataForViews(this.model, out_trasaction[0]);
              this.viewersLoading = false;
              this.detectChanges();

            }, (error: any) => {
              console.log(error);
            });

        }

    }, (error: any) => {
      console.log(error);
    });

  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: Message, _data: Transaction): void {

    this.generalViewerData = [];
    this.generalViewerData.push(new ViewerData({title: LocaleText.id, value: _model.id}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.type, value: _model.msg_type === 0 ? 'Internal' : '?'}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.timeDate, value: _model.created_at != null ? _model.created_at : '--', isDate: _model.created_at != null}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.from, value: _model.src != null ? _model.src : '--'}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.to, value: _model.dst != null ? _model.dst : '--'}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.valid, value: _model.value != null ? parseInt(_model.value, 16) : '0', isNumber: true}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.childTransaction, value: _data.id != null ? _data.id : '--'}));

    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.logicalTime, value: _model.created_lt != null ? parseInt(_model.created_lt, 16) : '0'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.ihrFee, value: _model.ihr_fee != null ? parseInt(_model.ihr_fee, 16) : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.fwdFee, value: _model.fwd_fee != null ? parseInt(_model.fwd_fee, 16) : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.bounce, value: _model.bounce, isBoolean: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.bounced, value: _model.bounced, isBoolean: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.boc, value: _model.boc != null ? _model.boc : '--'}));
  }
}
