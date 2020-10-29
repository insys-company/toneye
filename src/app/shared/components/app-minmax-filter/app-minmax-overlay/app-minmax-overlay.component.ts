import { Component, ViewChild, InjectionToken, Inject, OnDestroy, OnInit, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { AppMinmaxOverlayService } from './app-minmax-overlay.service';
import { Subscription, Subject } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import _ from 'underscore';

export const MINMAX_PANEL_DATA = new InjectionToken<{}>('MINMAX_PANEL_DATA');
export const MIN = 'Min';
export const MAX = 'Max';
@Component({
  selector: 'app-minmax-overlay',
  templateUrl: './app-minmax-overlay.component.html',
  styleUrls: ['./app-minmax-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppMinmaxOverlayComponent implements OnInit, AfterViewInit, OnDestroy {
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
   * min
   */
  public min: string;
  /**
   * max
   */
  public max: string;

  /**
   * Для поля
   * @type {string}
   */
  public minPlaceholder: string;
  /**
   * Для поля
   * @type {string}
   */
  public maxPlaceholder: string;

  /**
   * Доп класс для панели
   * @type {string}
   */
  public panelClass?: string;

  /**
   * Устанавливает класс для стилизации кнопки крестика
   * @type {boolean}
   */
  public get setShowClassForClearIconForMin(): boolean {
    return  this.min != null && this.min != '' ? true : false;
  }

  /**
   * Устанавливает класс для стилизации кнопки крестика
   * @type {boolean}
   */
  public get setShowClassForClearIconForMax(): boolean {
    return  this.max != null && this.max != ''  ? true : false;
  }


  constructor(
    protected service: AppMinmaxOverlayService,
    @Inject(MINMAX_PANEL_DATA) public data: any,
  ) {
    // TODO
  }

  /**
   * Поле поиска в панели
   * @type {MatFormField}
   */
  @ViewChild('optionsPanel', { static: false }) optionsPanel?: ElementRef;
  /** Инпут с min */
  @ViewChild('minInput', { static: false }) minInput?: ElementRef;
  /** Инпут с max */
  @ViewChild('maxInput', { static: false }) maxInput?: ElementRef;

  /**
   * Инициализация
   * @returns {void}
   */
  public ngOnInit(): void {
    this.disabled = this.data.data.disabled;

    this.min = this.data.data.min;
    this.max = this.data.data.max;
    this.minPlaceholder = this.data.data.minPlaceholder;
    this.maxPlaceholder = this.data.data.maxPlaceholder;

    this.minPlaceholder = this.minPlaceholder
      ? this.minPlaceholder
      : MIN;

    this.maxPlaceholder = this.maxPlaceholder
      ? this.maxPlaceholder
      : MAX;

    this.panelClass = this.data.data.panelClass;
  }

  /**
   * Обновление дом элементов после инициализации
   * @returns {void}
   */
  public ngAfterViewInit(): void {
    if (this.optionsPanel && this.minInput) { this.minInput.nativeElement.focus(); }
  }

  /**
   * Уничтожение компонента
   */
  public ngOnDestroy(): void {
    this.ngUnsubscribe();

    if (this.overlaySub) {
      this.overlaySub.unsubscribe();
      this.overlaySub = null;
    }

    this.min = null;
    this.max = null;
    this.minPlaceholder = null;
    this.maxPlaceholder = null;

    this.panelClass = null;
  }

  /**
   * Отписка от запросов
   */
  public ngUnsubscribe(): void {
    if (this.unsubscribe) {
      this.unsubscribe.next();
      this.unsubscribe.complete();
      this.unsubscribe = null;
    }
  }

  /**
   * Save
   */
  public onSave(): void {
    this.service.periodSelect.next({ min: this.min, max: this.max });
  }

  /**
   * Clear min
   */
  public onClearMin(): void {
    this.min = null;
  }

  /**
   * Clear max
   */
  public onClearMax(): void {
    this.max = null;
  }

  /**
   * Focus on max
   */
  public onMax(): void {
    if (this.maxInput) { this.maxInput.nativeElement.focus(); }
  }

  /**
   * Reset filter
   */
  public onResetFilter(): void {
    this.min = null;
    this.max = null;
    this.service.periodSelect.next({ min: this.min, max: this.max });
  }

  /**
   * Метод некой валидации, исправляет значение на валидное и недает пользователю ошибиться
   * @param {string} count Введенное число
   * @param {string} inputName Наименование инпута
   * @param {string} fieldName Наименование поля в модели
   */
  public numberValidator(count: string, inputName: string, fieldName: string): void {
    if (count !== '' && count != null) {

      const val = Number(count);

      if (!(val >= 0)) {

        count = '0';

        this[fieldName] = count;
        if (this[inputName]) {
          this[inputName].nativeElement.value = count;
        }

      }

    }
  }
}
