import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { SimpleDataFilter } from 'src/app/api';

@Injectable({
  providedIn: 'root'
})
export class ListService<TContract> {
  /**
   * For unsubscribe
   */
  _unsubscribe: Subject<void>;
  /**
   * Флаг инициализации страницы
   * @type {boolean}
   */
  initComplete: boolean;
  /**
   * Массив для скелетного блока
   * @type {Array<number>}
   */
  skeletonArray: Array<number>;
  /**
   * Параметры фильтра
   * @type {SimpleDataFilter}
   */
  filterParams: SimpleDataFilter;
  /**
   * Параметры фильтра которые сбрасывать не нужно
   * @type {string[]}
   */
  defaultFilterParamsKeys: string[];

  constructor(

    /** Настройки для меню */
    @Inject(function() {}) protected _setMenuSettings?: () => void,
    /** Настройки для хэдера */
    @Inject(function() {}) protected _setHeaderSettings?: () => void,
    /** Настройки для фильтров */
    @Inject(function() {}) protected _setFilterSettings?: () => void,
  ) {

    /** Массив для скелетного блока */
    this.skeletonArray = new Array(10);
    /** Дефолтные параметры фильтра, которые нельзя сбросить */
    this.defaultFilterParamsKeys = [ 'PageNumber', 'PageSize', 'OrderByField'];
  }

  /**
   * Initialization of the service
   */
  init(): void {
    /** Для отписок */
    this._unsubscribe = new Subject<void>();
    this.setMenuSettings();
    this.setHeaderSettings();
    this.setFilterSettings();
  }

  /**
   * Destruction of the service
   */
  destroy(): void {
    this.unsubscribe();
    this.initComplete = null;
  }

  /**
   * unsubscribe from qeries of the service
   */
  unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe.next();
      this._unsubscribe.complete();
      this._unsubscribe = null;
    }
  }

  /**
   * Инициализация сервиса из компонента
   */
  initService(): void {
    // TODO
  }

  /**
   * Получение данных
   */
  refreshData(): void {
    // TODO
  }

  /**
   * Установка хэдера
   * @returns {void}
   */
  setHeaderSettings(): void {
    if (this._setHeaderSettings) {
      this._setHeaderSettings();
    }
  }

  /**
   * Установка менюшки
   * Выполняется в кострукторе компонента
   * @returns {void}
   */
  setMenuSettings(): void {
    if (this._setMenuSettings) {
      this._setMenuSettings();
    }
  }

  /**
   * Установка фильтров
   * Выполняется в кострукторе компонента
   * @returns {void}
   */
  setFilterSettings(): void {
    if (this._setFilterSettings) {
      this._setFilterSettings();
    }
  }

  /**
   * Получение параметров фильтра из queryParams
   * @param {Object} queryParams Параметры из url
   * @param {SimpleDataFilter} dataFilter Параметры для фильтра
   * @param {string[]} defaultFilterParams Параметры для фильтра,
   * которые сбрасывать не нужно
   *
   * @returns {SimpleDataFilter}
   */
  getFilterParams(
    queryParams: Object,
    dataFilter: SimpleDataFilter,
    defaultDataFilter: string[] = this.defaultFilterParamsKeys): SimpleDataFilter {

    // Сбрасываем все параметры которые пришли null, если
    // только они не содержаться в списке дефолтных параметров
    for (const key in dataFilter) {
      if ((!queryParams[key] && queryParams[key] !== 0) &&
        (!this.checkArray(this.defaultFilterParamsKeys) || defaultDataFilter.indexOf(`${key}`) === -1)) {

        delete dataFilter[key];
      }
    }

    for (const key in queryParams) {
      if (queryParams.hasOwnProperty(key)) {
        dataFilter[key] = queryParams[key];
      }
    }
    return dataFilter;
  }

  /**
   * Метод проверяет наличие элементов в массиве - его содержание
   * @param {any[]} array Массив для проверки
   *
   * @returns {boolean} результат - удовлетворяет ли массив условию
   */
  checkArray(array: any[]): boolean {
    return (array && array.length) ? true : false;
  }

  /**
   * Метод проверяет строку
   * @param {string} str Строка для проверки
   *
   * @returns {boolean} результат - удовлетворяет ли строка условию
   */
  checkString(str: string): boolean {
    return (str && str.length) ? true : false;
  }
}
