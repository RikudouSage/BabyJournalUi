import {UnitConverter} from "./unit-converter";
import {UnitConverterType} from "../../enum/unit-converter-type.enum";

export class FluidOunceUnitConverter implements UnitConverter {
  public convertFromDefault(defaultUnitAmount: number): Array<string|number> {
    const full = Math.round((defaultUnitAmount * 0.0338140227) * 100) / 100;
    const int = Math.round(full);
    const fraction = full - int;

    let normalizedFraction = '';
    if (fraction >= 0.75) {
      normalizedFraction = '¾';
    } else if (fraction >= 0.5) {
      normalizedFraction = '½';
    } else if (fraction >= 0.25) {
      normalizedFraction = '¼';
    }

    const result: Array<string | number> = [int];
    if (normalizedFraction) {
      result.push(normalizedFraction);
    }

    return result;
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
    return ['oz.'];
  }
}
