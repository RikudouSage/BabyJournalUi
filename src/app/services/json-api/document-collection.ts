import {AbstractEntity} from './abstract.entity';

export class DocumentCollection<T extends AbstractEntity> {
  private data: T[] = [];
  private _totalItems: number = 0;

  constructor(
    public initialized = true
  ) {
  }

  public filter(callback: (value: T) => boolean) {
    const copy = new DocumentCollection<T>(this.initialized);
    copy.data = this.data.filter(callback);
    return copy;
  }

  public length(): number {
    return this.data.length;
  }

  public setData(entities: T[]) {
    this.data = entities;
    return this;
  }

  public add(entity: T) {
    this.data.push(entity);
    return this;
  }

  public at(index: number): T {
    return this.data[index];
  }

  public toArray(): T[] {
    const copy = [];
    for (const item of this.data) {
      copy.push(item);
    }
    return copy;
  }

  get totalItems(): number {
    return this._totalItems;
  }

  public setTotalItems(count: number): void {
    this._totalItems = count;
  }

  [Symbol.iterator]() {
    let index = 0;
    const length = this.data.length;
    const self = this;
    return {
      next(): { value: T | null, done: boolean } {
        if (index >= length) {
          return {value: null, done: true};
        }
        const value = self.data[index];
        ++index;
        return {value, done: false};
      }
    };
  }
}
