import {Inject, Injectable} from '@angular/core';
import {DatabaseService} from "../database.service";
import {
  LENGTH_UNIT_CONVERTER,
  TEMPERATURE_UNIT_CONVERTER,
  VOLUME_UNIT_CONVERTER,
  WEIGHT_UNIT_CONVERTER
} from "../../dependency-injection/injection-tokens";
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
    [UnitConverterType.Volume]: {},
    [UnitConverterType.Temperature]: {},
    [UnitConverterType.Length]: {},
  };

  constructor(
    private readonly database: DatabaseService,
    @Inject(WEIGHT_UNIT_CONVERTER) weightUnitConverters: UnitConverter[],
    @Inject(VOLUME_UNIT_CONVERTER) volumeUnitConverters: UnitConverter[],
    @Inject(TEMPERATURE_UNIT_CONVERTER) temperatureUnitConverters: UnitConverter[],
    @Inject(LENGTH_UNIT_CONVERTER) lengthUnitConverters: UnitConverter[],
  ) {
    this.init([...weightUnitConverters, ...volumeUnitConverters, ...temperatureUnitConverters, ...lengthUnitConverters]);
  }

  public convertWeight(defaultUnitAmount: number, unitName: string | null = null): Array<string|number> {
    unitName ??= this.database.getWeightUnit();
    return this.findConverterById(unitName, UnitConverterType.Weight).convertFromDefault(defaultUnitAmount);
  }

  public getWeightUnits(unitName: string | null = null): string[] {
    unitName ??= this.database.getWeightUnit();
    return this.findConverterById(unitName, UnitConverterType.Weight).units;
  }

  public convertLength(defaultUnitAmount: number, unitName: string | null = null): Array<string|number> {
    unitName ??= this.database.getLengthUnit();
    return this.findConverterById(unitName, UnitConverterType.Length).convertFromDefault(defaultUnitAmount);
  }

  public getLengthUnits(unitName: string | null = null): string[] {
    unitName ??= this.database.getLengthUnit();
    return this.findConverterById(unitName, UnitConverterType.Length).units;
  }

  public convertVolume(defaultUnitAmount: number, unitName: string | null = null): Array<string|number> {
    unitName ??= this.database.getVolumeUnit();
    return this.findConverterById(unitName, UnitConverterType.Volume).convertFromDefault(defaultUnitAmount);
  }

  public getVolumeUnits(unitName: string | null = null): string[] {
    unitName ??= this.database.getVolumeUnit();
    return this.findConverterById(unitName, UnitConverterType.Volume).units;
  }

  public convertTemperature(defaultUnitAmount: number, unitName: string | null = null): Array<string|number> {
    unitName ??= this.database.getTemperatureUnit();
    return this.findConverterById(unitName, UnitConverterType.Temperature).convertFromDefault(defaultUnitAmount);
  }

  public getTemperatureUnits(unitName: string | null = null): string[] {
    unitName ??= this.database.getTemperatureUnit();
    return this.findConverterById(unitName, UnitConverterType.Temperature).units;
  }

  private findConverterById(unit: string, type: UnitConverterType): UnitConverter {
    const converter = this.converters[type][unit];
    if (converter === undefined) {
      throw new Error(`Unsupported converter: ${unit}, type: ${type}`);
    }

    return converter;
  }

  private init(unitConverters: UnitConverter[]): void {
    for (const converter of unitConverters) {
      this.converters[converter.type][converter.id] = converter;
      for (const unit of converter.units) {
        this.converters[converter.type][unit] = converter;
      }
    }
  }
}
