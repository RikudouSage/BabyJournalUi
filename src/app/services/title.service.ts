import {Injectable} from '@angular/core';
import {BehaviorSubject, from, Observable, of} from "rxjs";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";
import {toPromise} from "../helper/observables";

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private readonly _defaultTitle = 'Baby Journal';

  private _titleChanged: BehaviorSubject<string> = new BehaviorSubject<string>(this._defaultTitle);

  constructor(
    private readonly titleService: Title,
    private readonly translator: TranslateService,
  ) {
  }

  get titleChanged(): Observable<string> {
    return this._titleChanged;
  }

  get defaultTitle(): Promise<string> {
    return toPromise(this.translator.get(this._defaultTitle));
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
