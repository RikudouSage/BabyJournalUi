import {AbstractEntity, EncryptedNullableString, EncryptedString} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";

export class FeedingActivity extends AbstractEntity {
  type: string = 'feeding-activity';

  override attributes: {
    startTime: EncryptedValue,
    endTime: EncryptedValue | null,
    breakDuration: EncryptedValue | null,
    note: EncryptedValue | null,
    type: EncryptedValue,
    amount: EncryptedValue,
  } = {
    startTime: new EncryptedValue(''),
    endTime: null,
    breakDuration: null,
    note: null,
    type: new EncryptedValue(''),
    amount: new EncryptedValue(''),
  };

  override encryptedValueConvertors = {
    startTime: EncryptedString,
    endTime: EncryptedNullableString,
    breakDuration: EncryptedNullableString,
    note: EncryptedNullableString,
    type: EncryptedString,
    amount: EncryptedString,
  }

}

@Injectable({
  providedIn: 'root',
})
export class FeedingActivityRepository extends AbstractRepository<FeedingActivity> {
  resource: typeof AbstractEntity = FeedingActivity;
  type: string = 'feeding-activity';
}
