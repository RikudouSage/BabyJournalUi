import {UnitConverterType} from "src/app/enum/unit-converter-type.enum";
import {UnitConverter} from "./unit-converter";

export class FeetUnitConverter implements UnitConverter {
    public get names(): string[] {
      return ['feet', 'inches'];
    }

    public get units(): string[] {
      return ['ft', 'in'];
    }

    public get type(): UnitConverterType {
      return UnitConverterType.Length;
    }

    public get id(): string {
      return 'feet';
    }

    public convertFromDefault(defaultUnitAmount: number): number[] {
      const inches = Math.round(defaultUnitAmount * (1 / 2.54));
      if (inches < 24) {
        return [0, inches];
      }

      const feet = Math.floor(inches / 12);
      const remainder = inches % 12;

      return [feet, remainder];
    }

    public convertToDefault(currentUnitAmount: number[]): number {
      const inches = currentUnitAmount[0] * 12 + currentUnitAmount[1];

      return inches * 2.54;
    }
}
