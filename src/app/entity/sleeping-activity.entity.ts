import {AbstractEntity, EncryptedNullableString, EncryptedString} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";

export class SleepingActivity extends AbstractEntity {
  type: string = 'sleeping-activity';

  override attributes: {
    startTime: EncryptedValue;
    endTime: EncryptedValue;
    note: EncryptedValue | null;
  } = {
    startTime: new EncryptedValue(''),
    endTime: new EncryptedValue(''),
    note: null,
  }

  override encryptedValueConvertors = {
    startTime: EncryptedString,
    endTime: EncryptedString,
    note: EncryptedNullableString,
  }
}

@Injectable({
  providedIn: 'root',
})
export class SleepingActivityRepository extends AbstractRepository<SleepingActivity> {
  resource: typeof AbstractEntity = SleepingActivity;
  type: string = 'sleeping-activity';
}
