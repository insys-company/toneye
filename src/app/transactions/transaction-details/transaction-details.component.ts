import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Transaction, Block, GeneralViewer } from '../../api';
import { TransactionDetailsService } from './transaction-details.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'underscore';
import { appRouteMap } from 'src/app/app-route-map';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsComponent implements OnInit, OnDestroy {
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
   * Data for view
   */
  public storageViewerData: Array<GeneralViewer>;
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(6);
  /**
   * Flag for loading data of General Viewer
   */
  public generalViewerLoading: boolean;

  public data: Transaction;

  public modelId: string | number;

  /**
   * Flag for main info
   */
  public isGeneralInfoOpen: boolean;

  constructor(
    private changeDetection: ChangeDetectorRef,
    private transactionsService: TransactionDetailsService,
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
          this.router.navigate([`/${appRouteMap.transactions}`]);
          this.unsubscribe.next();
          this.unsubscribe.complete();
          return;
        }

        this.transactionsService.getTransaction(this.modelId)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((model: Transaction[]) => {
  
            this.data = model[0];
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

    this.transactionsService.getBlock(this.data.block_id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((model: Block[]) => {

        this.generalViewerData = this.mapData(this.data, (model[0] ? model[0] : new Block({})));
        this.generalViewerLoading = false;
        this.detectChanges();

    }, (error: any) => {

    });

  }

  /**
   * Map transaction for viewer
   * @param _model Model of transaction
   */
  private mapData(_model: Transaction, _data: Block): GeneralViewer[] {

    let viewers = [];

    viewers.push(new GeneralViewer({title: 'ID', value: _model.id}));
    viewers.push(new GeneralViewer({title: 'Type', value: _model.tr_type == 3 ? 'Tock' : _model.tr_type == 2 ? 'Tick' : _model.balance_delta}));
    viewers.push(new GeneralViewer({title: 'Time & Date', value: _model.now}));
    viewers.push(new GeneralViewer({title: 'Account', value: _model.account_addr}));

    this.aditionalViewerData = [];
    // Details
    this.aditionalViewerData.push(new GeneralViewer({title: 'Block', value: `${_data.seq_no} / ${_data.workchain_id} : ${_data.shard}`}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Block ID', value: _data.id}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Logical time', value: _data.gen_utime}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Prev. transaction hash', value: _model.prev_trans_hash ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Prev. transaction lt', value: _model.lt}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Out messages count', value: _model.outmsg_cnt}));

    // Details
    this.aditionalViewerData.push(new GeneralViewer({title: 'Original status', value: _model.orig_status}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'End status', value: _model.end_status}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Old hash', value: _model.old_hash}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'New hash', value: _model.new_hash}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Aborted', value: _model.aborted ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Boc', value: _model.boc}));

    this.storageViewerData = [];

    // Storage
    this.storageViewerData.push(new GeneralViewer({title: 'Storage fees collected', value: _model.storage ? _model.storage.storage_fees_collected : ''}));
    this.storageViewerData.push(new GeneralViewer({title: 'Storage fees due', value: _model.storage ? _model.storage.storage_fees_due : ''}));
    this.storageViewerData.push(new GeneralViewer({title: 'Status change', value: _model.storage ? _model.storage.status_change : ''}));

    // // Compute
    // this.aditionalViewerData.push(new GeneralViewer({title: 'Original status', value: _model.orig_status}));
    // this.aditionalViewerData.push(new GeneralViewer({title: 'End status', value: _model.end_status}));
    // this.aditionalViewerData.push(new GeneralViewer({title: 'Old hash', value: _model.old_hash}));
    // this.aditionalViewerData.push(new GeneralViewer({title: 'New hash', value: _model.new_hash}));
    // this.aditionalViewerData.push(new GeneralViewer({title: 'Aborted', value: _model.aborted ? 'Yes' : 'No'}));
    // this.aditionalViewerData.push(new GeneralViewer({title: 'Boc', value: _model.boc}));

    // // Action
    // this.aditionalViewerData.push(new GeneralViewer({title: 'Original status', value: _model.orig_status}));
    // this.aditionalViewerData.push(new GeneralViewer({title: 'End status', value: _model.end_status}));
    // this.aditionalViewerData.push(new GeneralViewer({title: 'Old hash', value: _model.old_hash}));
    // this.aditionalViewerData.push(new GeneralViewer({title: 'New hash', value: _model.new_hash}));
    // this.aditionalViewerData.push(new GeneralViewer({title: 'Aborted', value: _model.aborted ? 'Yes' : 'No'}));
    // this.aditionalViewerData.push(new GeneralViewer({title: 'Boc', value: _model.boc}));

    return viewers;
  }

  /**
   * Detect Changes
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
