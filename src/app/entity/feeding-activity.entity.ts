import {AbstractEntity, EncryptedNullableString, EncryptedString} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";

export class FeedingActivity extends AbstractEntity {
  type: string = 'feeding-activity';

  override attributes: {
    startTime: EncryptedValue,
    endTime: EncryptedValue,
    note: EncryptedValue | null,
    type: EncryptedValue,
    bottleContentType: EncryptedValue | null,
    amount: EncryptedValue | null,
    breast: EncryptedValue | null,
  } = {
    startTime: new EncryptedValue(''),
    endTime: new EncryptedValue(''),
    note: null,
    type: new EncryptedValue(''),
    bottleContentType: null,
    amount: null,
    breast: null,
  };

  override encryptedValueConvertors = {
    startTime: EncryptedString,
    endTime: EncryptedNullableString,
    note: EncryptedNullableString,
    type: EncryptedString,
    bottleContentType: EncryptedNullableString,
    amount: EncryptedNullableString,
    breast: EncryptedNullableString,
  }

}

@Injectable({
  providedIn: 'root',
})
export class FeedingActivityRepository extends AbstractRepository<FeedingActivity> {
  resource: typeof AbstractEntity = FeedingActivity;
  type: string = 'feeding-activity';
}
