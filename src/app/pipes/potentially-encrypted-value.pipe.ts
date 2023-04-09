import { Pipe, PipeTransform } from '@angular/core';
import {EncryptedValue} from "../dto/encrypted-value";

export function potentiallyEncryptedValue(value: EncryptedValue | string | null, defaultValue: string | null = null): string {
  if (value === null) {
    if (!defaultValue) {
      throw new Error('You must provide a default value for null values');
    }
    return defaultValue;
  }
  if (value instanceof EncryptedValue) {
    return value.decrypted;
  }

  return value;
}

@Pipe({
  name: 'potentiallyEncryptedValue'
})
export class PotentiallyEncryptedValuePipe implements PipeTransform {

  transform(value: EncryptedValue | string | null, defaultValue: string | null = null): string {
    return potentiallyEncryptedValue(value, defaultValue);
  }

}
