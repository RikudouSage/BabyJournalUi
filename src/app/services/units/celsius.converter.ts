import {UnitConverter} from "./unit-converter";
import {UnitConverterType} from "../../enum/unit-converter-type.enum";

export class CelsiusConverter implements UnitConverter {
  public convertFromDefault(defaultUnitAmount: number): number[] {
    return [defaultUnitAmount];
  }

  public convertToDefault(currentUnitAmount: number[]): number {
    return currentUnitAmount[0];
  }

  public get id(): string {
    return "°C";
  }

  public get names(): string[] {
    return ['Celsius'];
  }

  public get type(): UnitConverterType {
    return UnitConverterType.Temperature;
  }

  public get units(): string[] {
    return ['°C'];
  }

}
