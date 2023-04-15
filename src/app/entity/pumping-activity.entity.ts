import {AbstractEntity, EncryptedNullableString, EncryptedString} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";
import {of} from "rxjs";
import {User} from "./user.entity";

export class PumpingActivity extends AbstractEntity {
  type: string = 'pumping-activity';

  override attributes: {
    startTime: EncryptedValue,
    endTime: EncryptedValue,
    note: EncryptedValue | null,
    amount: EncryptedValue | null,
    breast: EncryptedValue,
  } = {
    startTime: new EncryptedValue(''),
    endTime: new EncryptedValue(''),
    note: null,
    amount: null,
    breast: new EncryptedValue(''),
  };

  override relationships = {
    pumpingParent: of(new User(false)),
  };

  override encryptedValueConvertors = {
    startTime: EncryptedString,
    endTime: EncryptedString,
    note: EncryptedNullableString,
    amount: EncryptedNullableString,
    breast: EncryptedString,
  }
}

@Injectable({
  providedIn: 'root',
})
export class PumpingActivityRepository extends AbstractRepository<PumpingActivity> {
  resource: typeof AbstractEntity = PumpingActivity;
  type: string = 'pumping-activity';
}
