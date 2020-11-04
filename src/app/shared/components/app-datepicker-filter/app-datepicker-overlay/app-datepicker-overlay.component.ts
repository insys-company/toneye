import { Component, ViewChild, InjectionToken, Inject, OnDestroy, OnInit, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { AppDatepickerOverlayService } from './app-datepicker-overlay.service';
import { Subscription, Subject } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import _ from 'underscore';
import { DateTime } from 'src/app/shared/utils';
import { MatDatepickerInputEvent } from '@angular/material/datepicker/datepicker-input';

export const DATE_PANEL_DATA = new InjectionToken<{}>('DATE_PANEL_DATA');
export const MIN = 'From';
export const MAX = 'To';
@Component({
  selector: 'app-datepicker-overlay',
  templateUrl: './app-datepicker-overlay.component.html',
  styleUrls: ['./app-datepicker-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppDatepickerOverlayComponent implements OnInit, OnDestroy {
  /**
   * Для отписок на запросы
   * @type {Subject<void>}
   */
  private unsubscribe: Subject<void>;
  /**
   * Для подписок
   * @type {Subscription}
   */
  private overlaySub: Subscription;

  /**
   * Блокировщик
   * @type {boolean}
   */
  public disabled: boolean;

  /**
   * From date
   */
  public fromDate: string;
  /**
   * To date
   */
  public toDate: string;

  /**
   * From date
   * For datepicker
   */
  public from: Date;
  /**
   * To date
   * For datepicker
   */
  public to: Date;

  /**
   * Для поля
   * @type {string}
   */
  public fromPlaceholder: string;
  /**
   * Для поля
   * @type {string}
   */
  public toPlaceholder: string;

  /**
   * Доп класс для панели
   * @type {string}
   */
  public panelClass?: string;

  /**
   * Устанавливает класс для стилизации кнопки крестика
   * @type {boolean}
   */
  public get setShowClassForClearIconForFrom(): boolean {
    return  this.fromDate != null && this.fromDate != '' ? true : false;
  }

  /**
   * Устанавливает класс для стилизации кнопки крестика
   * @type {boolean}
   */
  public get setShowClassForClearIconForTo(): boolean {
    return  this.toDate != null && this.toDate != ''  ? true : false;
  }

  /**
   * Таймзона пользователя
   * @type {number}
   */
  public get timezoneOffset(): number {
    return Math.abs(new Date(Math.round(new Date().getTime() / 1000)).getTimezoneOffset());
  }

  /**
   * Минимальная дата для календарей
   * 1 января 1970
   * @type {minDate}
   */
  public get minDate(): Date {
    return new DateTime(0).toLocalDate();
  }

  constructor(
    protected service: AppDatepickerOverlayService,
    @Inject(DATE_PANEL_DATA) public data: any,
  ) {
    // TODO
  }

  /**
   * Поле поиска в панели
   * @type {MatFormField}
   */
  @ViewChild('optionsPanel', { static: false }) optionsPanel?: ElementRef;
  // /** Инпут с min */
  // @ViewChild('minInput', { static: false }) minInput?: ElementRef;
  // /** Инпут с max */
  // @ViewChild('maxInput', { static: false }) maxInput?: ElementRef;

  /**
   * Инициализация
   * @returns {void}
   */
  public ngOnInit(): void {
    this.disabled = this.data.data.disabled;

    this.fromDate = this.data.data.fromDate;
    this.toDate = this.data.data.toDate;

    this.from = this.fromDate != null
      ? new Date(new Date(Number(this.fromDate) * 1000).setMinutes(new Date(Number(this.fromDate) * 1000).getMinutes() - this.timezoneOffset))
      : null;

    this.to = this.toDate != null
      ? new Date(new Date(Number(this.toDate) * 1000).setMinutes(new Date(Number(this.toDate) * 1000).getMinutes() - this.timezoneOffset))
      : null;

    this.fromPlaceholder = this.data.data.fromPlaceholder;
    this.toPlaceholder = this.data.data.toPlaceholder;

    this.fromPlaceholder = this.fromPlaceholder
      ? this.fromPlaceholder
      : MIN;

    this.toPlaceholder = this.toPlaceholder
      ? this.toPlaceholder
      : MAX;

    this.panelClass = this.data.data.panelClass;
  }

  /**
   * Обновление дом элементов после инициализации
   * @returns {void}
   */
  public ngAfterViewInit(): void {
    // if (this.optionsPanel && this.minInput) { this.minInput.nativeElement.focus(); }
  }

  /**
   * Уничтожение компонента
   * @returns {void}
   */
  public ngOnDestroy(): void {
    this.ngUnsubscribe();

    if (this.overlaySub) {
      this.overlaySub.unsubscribe();
      this.overlaySub = null;
    }

    this.fromDate = null;
    this.toDate = null;
    this.fromPlaceholder = null;
    this.toPlaceholder = null;

    this.panelClass = null;
  }

  /**
   * Отписка от запросов
   * @returns {void}
   */
  public ngUnsubscribe(): void {
    if (this.unsubscribe) {
      this.unsubscribe.next();
      this.unsubscribe.complete();
      this.unsubscribe = null;
    }
  }

  /**
   * save
   */
  public onSave(): void {
    this.service.periodSelect.next({from: this.fromDate, to: this.toDate});
  }

  /**
   *  Clear from date
   */
  public onClearFromDate(): void {
    this.fromDate = null;
    this.from = null;
  }

  /**
   * Cleas to date
   */
  public onClearToDate(): void {
    this.toDate = null;
    this.to = null;
  }

  /**
   * Reset filter
   */
  public onResetFilter(): void {
    this.fromDate = null;
    this.from = null;
    this.toDate = null;
    this.to = null;
    this.service.periodSelect.next({from: this.fromDate, to: this.toDate});
  }

  /**
   * Проверка fromDate
   * @param {MatDatepickerInputEvent<Date>} date Выбранная дата
   */
  public fromDateChange(date: MatDatepickerInputEvent<Date>): void {

    this.fromDate = date && date.value
      ? Math.round(date.value.setMinutes(date.value.getMinutes() + this.timezoneOffset) / 1000) + ''
      : null;

    if (date.value && this.to && date.value >= this.to) {
      let g = date.value;
      this.to = new Date(g.setDate(g.getDate() + 1));
      g = null;

      this.toDate = Math.round(this.to.setMinutes(this.to.getMinutes() + this.timezoneOffset) / 1000) + '';      
    }

  }

  /**
   * Проверка toDate
   * @param {MatDatepickerInputEvent<Date>} date Выбранная дата
   */
  public toDateChange(date: MatDatepickerInputEvent<Date>): void {

    this.toDate = date && date.value
      ? Math.round(date.value.setMinutes(date.value.getMinutes() + this.timezoneOffset) / 1000) + ''
      : null;

  }
}
