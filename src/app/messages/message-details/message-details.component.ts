import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Message, ViewerData, Transaction } from '../../api';
import { MessageDetailsService } from './message-details.service';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AppDetailsComponent } from 'src/app/shared/components/app-details/app-details.component';

@Component({
  selector: 'app-message-details',
  templateUrl: './message-details.component.html',
  styleUrls: ['./message-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDetailsComponent extends AppDetailsComponent<Message> implements OnInit, OnDestroy {
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(7);

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: MessageDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {

    super(
      changeDetection,
      service,
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
   * Data for model from other queries
   */
  protected getData(): void {

    this.service.getTransaction(this.modelId)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((in_trasaction: Transaction[]) => {

        if(in_trasaction[0]) {
          this.mapDataForViews(this.model, new Transaction(in_trasaction[0]));
          this.viewersLoading = false;
          this.detectChanges();
        }
        else {

          this.service.getTransaction(this.modelId, true)
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
    this.generalViewerData.push(new ViewerData({title: 'ID', value: _model.id}));
    this.generalViewerData.push(new ViewerData({title: 'Type', value: _model.msg_type === 0 ? 'Internal' : '?'}));
    this.generalViewerData.push(new ViewerData({title: 'Time & Date', value: _model.created_at}));
    this.generalViewerData.push(new ViewerData({title: 'From', value: _model.src}));
    this.generalViewerData.push(new ViewerData({title: 'To', value: _model.dst}));
    this.generalViewerData.push(new ViewerData({title: 'Value', value: _model.value}));
    this.generalViewerData.push(new ViewerData({title: 'Child transaction', value: _data.id}));

    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new ViewerData({title: 'Logical time', value: _model.created_lt}));
    this.aditionalViewerData.push(new ViewerData({title: 'IHR Fee', value: _model.ihr_fee}));
    this.aditionalViewerData.push(new ViewerData({title: 'Fwd Fee', value: _model.fwd_fee}));
    this.aditionalViewerData.push(new ViewerData({title: 'Bounce', value: _model.bounce ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new ViewerData({title: 'Bounced', value: _model.bounced ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new ViewerData({title: 'Boc', value: _model.boc}));
  }
}
