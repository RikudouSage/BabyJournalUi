import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {BottleContentType} from "../enum/bottle-content-type.enum";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EnumToStringService {
  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  public bottleContentTypeToString(foodType: BottleContentType): Observable<string> {
    switch (foodType) {
      case BottleContentType.BreastMilk:
        return this.translator.get('breast milk');
      case BottleContentType.Formula:
        return this.translator.get('formula');
      case BottleContentType.Water:
        return this.translator.get('water');
      case BottleContentType.Juice:
        return this.translator.get('juice');
    }
  }
}
