import { Pipe, PipeTransform } from '@angular/core';
import {EncryptedValue} from "../dto/encrypted-value";

@Pipe({
  name: 'encryptedOrStringValue'
})
export class EncryptedOrStringValuePipe implements PipeTransform {

  transform(value: EncryptedValue | string): string {
    if (value instanceof EncryptedValue) {
      return value.decrypted;
    }

    return value;
  }

}
