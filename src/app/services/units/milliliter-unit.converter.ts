import {UnitConverter} from "./unit-converter";
import {UnitConverterType} from "../../enum/unit-converter-type.enum";

export class MilliliterUnitConverter implements UnitConverter {
  public convertFromDefault(defaultUnitAmount: number): number[] {
    return [defaultUnitAmount];
  }

  public convertToDefault(currentUnitAmount: number[]): number {
    return currentUnitAmount[0];
  }

  public get id(): string {
    return this.units[0];
  }

  public get names(): string[] {
    return ['milliliters'];
  }

  public get type(): UnitConverterType {
    return UnitConverterType.Volume;
  }

  public get units(): string[] {
    return ['ml'];
  }

}
