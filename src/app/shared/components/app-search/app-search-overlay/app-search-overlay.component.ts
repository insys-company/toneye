import { Component, InjectionToken, Inject, OnDestroy, OnInit, AfterContentInit, AfterViewInit } from '@angular/core';
import { AppSearchOverlayService } from './app-search-overlay.service';
import { Block, Message, Transaction, Validator } from 'src/app/api/contracts';
import { smoothSearchPanelAnimation } from 'src/app/app-animations';

export const SEARCH_PANEL_DATA = new InjectionToken<{}>('SEARCH_PANEL_DATA');
export const NOT_FOUND = 'Not found';

@Component({
  selector: 'app-search-overlay',
  templateUrl: './app-search-overlay.component.html',
  styleUrls: ['./app-search-overlay.component.scss'],
  animations: [ smoothSearchPanelAnimation ],
})
export class AppSearchOverlayComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  /**
   * Список элементов для выбора
   */
  blocks: Block[];
  /**
   * Список элементов для выбора
   */
  messages: Message[];
  /**
   * Список элементов для выбора
   */
  transactions: Transaction[];
  /**
   * Список элементов для выбора
   */
  accounts: Account[];
  /**
   * Список элементов для выбора
   */
  validators: Validator[];

  /**
   * Текст для случая когда не найдено ничего по поиску
   */
  notFoundTitle: string;

  /**
   * Не найдено
   */
  get notFound(): boolean {
    return  !this.checkArray(this.blocks)
      && !this.checkArray(this.messages)
      && !this.checkArray(this.transactions)
      && !this.checkArray(this.accounts)
      && !this.checkArray(this.validators);
  }

  constructor(
    protected service: AppSearchOverlayService,
    @Inject(SEARCH_PANEL_DATA) public data: any,
  ) {
    // TODO
  }

  /**
   * Инициализация
   */
  ngOnInit(): void {
    this.blocks = this.data.data.blocks ? this.data.data.blocks : [];
    this.messages = this.data.data.messages ? this.data.data.messages : [];
    this.transactions = this.data.data.transactions ? this.data.data.transactions : [];
    this.accounts = this.data.data.accounts ? this.data.data.accounts : [];
    this.validators = this.data.data.validators ? this.data.data.validators : [];

    this.notFoundTitle = this.data.data.notFoundTitle;

    this.notFoundTitle = this.notFoundTitle
      ? this.notFoundTitle
      : NOT_FOUND;
  }

  /**
   * Обновление дом элементов после инициализации
   */
  ngAfterViewInit(): void {
    // TODO
  }

  /**
   * Обновление дом элементов после ngDoCheck
   */
  ngAfterContentInit(): void {
    // TODO
  }

  /**
   * Уничтожение компонента
   */
  ngOnDestroy(): void {
    this.blocks = null;
    this.messages = null;
    this.transactions = null;
    this.accounts = null;
    this.validators = null;

    this.notFoundTitle = null;
  }

  /**
   * Метод выбора элементов из списка
   * @param {any} option Выбранный элемент
   */
  onSelectOption(type: string, option: any): void {
    this.service.selectOption.next({type, option});
  }

  /**
   * Метод проверки массива на его наличие и длину
   * @param {any[]} array Массив для проверки длины
   */
  private checkArray(array: any[]): boolean {
    return (array && array.length) ? true : false;
  }
}
