import {AbstractEntity, EncryptedNullableString, EncryptedString} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";

export class DiaperingActivity extends AbstractEntity {
  type: string = 'diapering-activity';

  override attributes: {
    startTime: EncryptedValue;
    note: EncryptedValue | null;
    wet: EncryptedValue;
    poopy: EncryptedValue;
    quantity: EncryptedValue | null;
    poopColor: EncryptedValue | null;
  } = {
    startTime: new EncryptedValue(''),
    note: null,
    wet: new EncryptedValue(''),
    poopy: new EncryptedValue(''),
    quantity: null,
    poopColor: null,
  };

  override encryptedValueConvertors = {
    startTime: EncryptedString,
    note: EncryptedNullableString,
    wet: EncryptedString,
    poopy: EncryptedString,
    quantity: EncryptedNullableString,
    poopColor: EncryptedNullableString,
  }
}

@Injectable({
  providedIn: 'root',
})
export class DiaperingActivityRepository extends AbstractRepository<DiaperingActivity> {
  resource: typeof AbstractEntity = DiaperingActivity;
  type: string = 'diapering-activity';
}
