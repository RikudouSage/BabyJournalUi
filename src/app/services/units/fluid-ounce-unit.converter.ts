import {UnitConverter} from "./unit-converter";
import {UnitConverterType} from "../../enum/unit-converter-type.enum";

export class FluidOunceUnitConverter implements UnitConverter {
  public convertFromDefault(defaultUnitAmount: number): number[] {
    return [Math.round(defaultUnitAmount * 0.0338140227)];
  }

  public convertToDefault(currentUnitAmount: number[]): number {
    return currentUnitAmount[0] * 29.5735296;
  }

  public get id(): string {
    return "fl oz";
  }

  public get names(): string[] {
    return ['ounces'];
  }

  public get type(): UnitConverterType {
    return UnitConverterType.Volume;
  }

  public get units(): string[] {
    return ['oz'];
  }

}
