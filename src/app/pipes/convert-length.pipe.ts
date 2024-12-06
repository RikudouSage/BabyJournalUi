import { Pipe, PipeTransform } from '@angular/core';
import {UnitConverterService} from "../services/units/unit-converter.service";
import {ConvertPipeResult} from "../types/convert-pipe-result.type";

@Pipe({
  name: 'convertLength',
  standalone: true
})
export class ConvertLengthPipe implements PipeTransform {
  constructor(
    private readonly unitConverter: UnitConverterService,
  ) {
  }

  public transform(value: number | string, unitName: string | null = null): ConvertPipeResult {
    return {
      amounts: this.unitConverter.convertLength(Number(value), unitName),
      units: this.unitConverter.getLengthUnits(unitName),
    };
  }

}
