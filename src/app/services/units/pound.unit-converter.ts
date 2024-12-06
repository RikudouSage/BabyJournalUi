import {UnitConverter} from "./unit-converter";
import {UnitConverterType} from "../../enum/unit-converter-type.enum";

export class PoundUnitConverter implements UnitConverter {
  public convertFromDefault(defaultUnitAmount: number): number[] {
    const amount = defaultUnitAmount * 0.00220462262;
    const amountLbs = Math.floor(amount);
    const amountOz = Math.round((amount - amountLbs) * 16);

    return [amountLbs, amountOz];
  }

  public convertToDefault(currentUnitAmount: number[]): number {
    let [lbs, oz] = currentUnitAmount;
    lbs += oz * 0.0625;

    return lbs * 453.59237;
  }

  public get id(): string {
    return this.units[0];
  }

  public get names(): string[] {
    return ["pounds", "ounces"];
  }

  public get units(): string[] {
    return ["lbs", "oz"];
  }

  get type(): UnitConverterType {
    return UnitConverterType.Weight;
  }
}
