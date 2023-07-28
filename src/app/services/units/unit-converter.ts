import {UnitConverterType} from "../../enum/unit-converter-type.enum";

export interface UnitConverter {
  get names(): string[];
  get units(): string[];
  get type(): UnitConverterType;
  get id(): string;
  convertFromDefault(defaultUnitAmount: number): number[];
  convertToDefault(currentUnitAmount: number[]): number;
}
