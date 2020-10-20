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
   * Data for view
   */
  public generalViewerData: Array<GeneralViewer>;
  /**
   * Data for view
   */
  public aditionalViewerData: Array<GeneralViewer>;
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(6);
  /**
   * Flag for loading data of General Viewer
   */
  public generalViewerLoading: boolean;

  public data: Message;

  public modelId: string | number;

  /**
   * Flag for main info
   */
  public isGeneralInfoOpen: boolean;

  constructor(
    private changeDetection: ChangeDetectorRef,
    private messagesService: MessageDetailsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    /** Loading animation in children */
    this.generalViewerLoading = true;
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

        this.messagesService.getMessage(this.modelId)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((m: Message[]) => {
  
            this.data = m[0];
            this.init(this.modelId);

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
  private init(id: string | number): void {

    this.messagesService.getMessage(this.modelId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((m: Message[]) => {

        this.data = m[0] ? m[0] : new Message();

        this.messagesService.getTransaction(this.modelId)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((in_t: Transaction[]) => {

            if(in_t[0]) {
              this.generalViewerData = this.mapData(this.data, in_t[0]);
              this.generalViewerLoading = false;
              this.detectChanges();
            }
            else {


              this.messagesService.getTransaction(this.modelId, true)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((out_t: Transaction[]) => {
    
                if(out_t[0]) {
                  this.generalViewerData = this.mapData(this.data, out_t[0]);
                  this.generalViewerLoading = false;
                  this.detectChanges();
                }
    
                }, (error: any) => {
        
                });


            }

        }, (error: any) => {

        });


    }, (error: any) => {
      console.log(error);
    });    

  }

  /**
   * Map messages for table
   * @param _list Array of messages
   */
  private mapData(_model: Message, _transaction: Transaction): GeneralViewer[] {

    let _data = [];

    _data.push(new GeneralViewer({title: 'ID', value: _model.id}));
    _data.push(new GeneralViewer({title: 'Type', value: _model.msg_type === 0 ? 'Internal' : '?'}));
    _data.push(new GeneralViewer({title: 'Time & Date', value: _model.created_at}));
    _data.push(new GeneralViewer({title: 'From', value: _model.src}));
    _data.push(new GeneralViewer({title: 'To', value: _model.dst}));
    _data.push(new GeneralViewer({title: 'Value', value: _model.value}));
    _data.push(new GeneralViewer({title: 'Child transaction', value: _transaction.id}));

    this.aditionalViewerData = [];

    this.aditionalViewerData.push(new GeneralViewer({title: 'Logical time', value: _model.created_lt}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'IHR Fee', value: _model.ihr_fee}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Fwd Fee', value: _model.fwd_fee}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Bounce', value: _model.bounce ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Bounced', value: _model.bounced ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Boc', value: _model.boc}));

    return _data;
  }

  /**
   * Detect Changes
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
