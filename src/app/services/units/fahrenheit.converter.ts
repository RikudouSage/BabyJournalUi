import {UnitConverter} from "./unit-converter";
import {UnitConverterType} from "../../enum/unit-converter-type.enum";

export class FahrenheitConverter implements UnitConverter {
  public convertFromDefault(defaultUnitAmount: number): number[] {
    return [Math.round(((9/5) * defaultUnitAmount + 32) * 10) / 10];
  }

  public convertToDefault(currentUnitAmount: number[]): number {
    return (currentUnitAmount[0] - 32) * (5/9);
  }

  public get id(): string {
    return "°F";
  }

  public get names(): string[] {
    return ['Fahrenheit'];
  }

  public get type(): UnitConverterType {
    return UnitConverterType.Temperature;
  }

  public get units(): string[] {
    return ['°F'];
  }

}
