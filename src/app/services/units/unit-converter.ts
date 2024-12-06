import {UnitConverterType} from "../../enum/unit-converter-type.enum";

export interface UnitConverter {
  get names(): string[];
  get units(): string[];
  get type(): UnitConverterType;
  get id(): string;
  convertFromDefault(defaultUnitAmount: number): Array<string|number>;
  convertToDefault(currentUnitAmount: number[]): number;
}
