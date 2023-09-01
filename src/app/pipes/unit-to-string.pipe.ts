import { Pipe, PipeTransform } from '@angular/core';
import {ConvertPipeResult} from "../types/convert-pipe-result.type";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {toPromise} from "../helper/observables";

@Pipe({
  name: 'unitToString'
})
export class UnitToStringPipe implements PipeTransform {
  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  public async transform(value: ConvertPipeResult): Promise<string> {
    const separator = await toPromise(this.translator.get('unit-converter.unit-separator'));
    const result: string[] = [];

    for (let i = 0; i < value.units.length; ++i) {
      if (!value.amounts[i]) {
        continue;
      }
      result.push(await toPromise(this.translator.get('{{amount}}{{unit}}', {
        amount: value.amounts[i],
        unit: value.units[i],
      })));
    }

    if (!result.length) {
      result.push(await toPromise(this.translator.get('{{amount}}{{unit}}', {
        amount: 0,
        unit: value.units[0],
      })));
    }

    return result.join(separator);
  }

}
