import {UnitConverter} from "./unit-converter";
import {UnitConverterType} from "../../enum/unit-converter-type.enum";

export class GramUnitConverter implements UnitConverter {
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
    return ["grams"];
  }

  public get units(): string[] {
    return ["g"];
  }

  get type(): UnitConverterType {
    return UnitConverterType.Weight;
  }
}
