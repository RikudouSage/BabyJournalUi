import { UnitConverterType } from "src/app/enum/unit-converter-type.enum";
import {UnitConverter} from "./unit-converter";

export class CentimeterUnitConverter implements UnitConverter {
    public get names(): string[] {
      return ['centimeters'];
    }

    public get units(): string[] {
      return ['cm'];
    }

    public get type(): UnitConverterType {
      return UnitConverterType.Length;
    }

    public get id(): string {
      return 'cm';
    }

    public convertFromDefault(defaultUnitAmount: number): (string | number)[] {
      return [defaultUnitAmount];
    }

    public convertToDefault(currentUnitAmount: number[]): number {
      return currentUnitAmount[0];
    }

}
