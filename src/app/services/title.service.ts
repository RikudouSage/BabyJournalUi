import { Injectable } from '@angular/core';
import {BehaviorSubject, from, Observable, of} from "rxjs";
import {Title} from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private readonly defaultTitle = 'Baby Tracker';

  private _titleChanged: BehaviorSubject<string> = new BehaviorSubject<string>(this.defaultTitle);

  constructor(
    private readonly titleService: Title
  ) {
  }

  get titleChanged(): Observable<string> {
    return this._titleChanged;
  }

  set title(title: string | Promise<string> | Observable<string>) {
    let observable: Observable<string>;
    if (typeof title === 'string') {
      observable = of(title);
    } else if (title instanceof Promise) {
      observable = from(title);
    } else {
      observable = title;
    }

    observable.subscribe(title => {
      this.titleService.setTitle(title)
      this._titleChanged.next(title);
    });
  }
  public setDefault(): void {
    this.title = this.defaultTitle;
  }
}
