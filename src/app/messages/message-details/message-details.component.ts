import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Message, GeneralViewer, TabViewerData, DataConfig, QueryOrderBy, Transaction } from '../../api';
import { MessageDetailsService } from './message-details.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'underscore';
import { appRouteMap } from 'src/app/app-route-map';

@Component({
  selector: 'app-message-details',
  templateUrl: './message-details.component.html',
  styleUrls: ['./message-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDetailsComponent implements OnInit, OnDestroy {
  /**
   * Для отписок на запросы
   */
  public unsubscribe: Subject<void> = new Subject();
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(7);
  /**
   * Flag for show/hide state of info
   */
  public isAditionalInfoOpen: boolean;
  /**
   * Flag for loading animation in Viewers
   */
  public viewersLoading: boolean;
  /**
   * Model
   */
  public data: Message;
  /**
   * ModelId
   */
  public modelId: string | number;
  /**
   * General Data for view
   */
  public generalViewerData: Array<GeneralViewer>;
  /**
   * Aditional Data for view
   */
  public aditionalViewerData: Array<GeneralViewer>;

  constructor(
    private changeDetection: ChangeDetectorRef,
    private service: MessageDetailsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    /** Loading animation in children */
    this.viewersLoading = true;
  }

  /**
   * Initialization of the component
   */
  ngOnInit(): void {
    this.detectChanges();

    this.route.params
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((params: Params) => {
        this.modelId = params['id'] != null ? params['id'].trim() : null;

        if (this.modelId == null) {
          this.router.navigate([`/${appRouteMap.messages}`]);
          this.unsubscribe.next();
          this.unsubscribe.complete();
          return;
        }

        this.service.getMessage(this.modelId)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((model: Message[]) => {
  
            this.data = model[0]
              ? new Message(model[0])
              : new Message();

            this.init();

          }, (error: any) => {
            console.log(error);
          });

      })
      .unsubscribe();
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
   * Init method
   */
  private init(): void {

    this.service.getTransaction(this.modelId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((in_trasaction: Transaction[]) => {

        if(in_trasaction[0]) {
          this.generalViewerData = this.mapData(this.data, new Transaction(in_trasaction[0]));
          this.viewersLoading = false;
          this.detectChanges();
        }
        else {

          this.service.getTransaction(this.modelId, true)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((out_trasaction: Transaction[]) => {

              out_trasaction[0] = out_trasaction[0]
                ? new Transaction(out_trasaction[0])
                : new Transaction();

              this.generalViewerData = this.mapData(this.data, out_trasaction[0]);
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
   * Map messages for viewer
   * @param _model Model of message
   */
  private mapData(_model: Message, _data: Transaction): GeneralViewer[] {

    let viewers = [];

    viewers.push(new GeneralViewer({title: 'ID', value: _model.id}));
    viewers.push(new GeneralViewer({title: 'Type', value: _model.msg_type === 0 ? 'Internal' : '?'}));
    viewers.push(new GeneralViewer({title: 'Time & Date', value: _model.created_at}));
    viewers.push(new GeneralViewer({title: 'From', value: _model.src}));
    viewers.push(new GeneralViewer({title: 'To', value: _model.dst}));
    viewers.push(new GeneralViewer({title: 'Value', value: _model.value}));
    viewers.push(new GeneralViewer({title: 'Child transaction', value: _data.id}));

    this.aditionalViewerData = [];

    this.aditionalViewerData.push(new GeneralViewer({title: 'Logical time', value: _model.created_lt}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'IHR Fee', value: _model.ihr_fee}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Fwd Fee', value: _model.fwd_fee}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Bounce', value: _model.bounce ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Bounced', value: _model.bounced ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Boc', value: _model.boc}));

    return viewers;
  }

  /**
   * Detect Changes
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
