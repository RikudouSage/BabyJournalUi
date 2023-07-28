import {Inject, Injectable} from '@angular/core';
import {DatabaseService} from "../database.service";
import {WEIGHT_UNIT_CONVERTER} from "../../dependency-injection/injection-tokens";
import {UnitConverter} from "./unit-converter";
import {UnitConverterType} from "../../enum/unit-converter-type.enum";

@Injectable({
  providedIn: 'root'
})
export class UnitConverterService {
  private converters: {
    [type in UnitConverterType]: {[unit: string]: UnitConverter}
  } = {
    [UnitConverterType.Weight]: {},
  };

  constructor(
    private readonly database: DatabaseService,
    @Inject(WEIGHT_UNIT_CONVERTER) private readonly weightUnitConverters: UnitConverter[],
  ) {
    this.init([...weightUnitConverters]);
  }

  public convertWeight(defaultUnitAmount: number, unitName: string | null = null): number[] {
    unitName ??= this.database.getWeightUnit();
    const converter = this.findConverterByUnit(unitName, UnitConverterType.Weight);

    return converter.convertFromDefault(defaultUnitAmount);
  }

  public getWeightUnits(unitName: string | null = null): string[] {
    return this.findConverterByUnit(unitName ?? this.database.getWeightUnit(), UnitConverterType.Weight).units;
  }

  private findConverterByUnit(unit: string, type: UnitConverterType): UnitConverter {
    const converter = this.converters[type][unit];
    if (converter === undefined) {
      throw new Error(`Unsupported converter: ${unit}, type: ${type}`);
    }

    return converter;
  }

  private init(unitConverters: UnitConverter[]): void {
    for (const converter of unitConverters) {
      for (const unit of converter.units) {
        this.converters[converter.type][unit] = converter;
      }
    }
  }
}
