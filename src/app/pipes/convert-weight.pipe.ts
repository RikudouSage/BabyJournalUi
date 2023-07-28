import { Pipe, PipeTransform } from '@angular/core';
import {ConvertPipeResult} from "../types/convert-pipe-result.type";
import {UnitConverterService} from "../services/units/unit-converter.service";

@Pipe({
  name: 'convertWeight'
})
export class ConvertWeightPipe implements PipeTransform {

  constructor(
    private readonly unitConverter: UnitConverterService,
  ) {
  }

  public transform(value: number | string, unitName: string | null = null): ConvertPipeResult {
    return {
      amounts: this.unitConverter.convertWeight(Number(value), unitName),
      units: this.unitConverter.getWeightUnits(unitName),
    };
  }

}
