import {AbstractEntity, EncryptedString} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";

export class WeighingActivity extends AbstractEntity {
  override type: string = 'weighing-activity';
  override attributes: {
    startTime: EncryptedValue;
    weight: EncryptedValue;
  } = {
    startTime: new EncryptedValue(''),
    weight: new EncryptedValue(''),
  };

  override encryptedValueConvertors = {
    startTime: EncryptedString,
    weight: EncryptedString,
  };
}

@Injectable({
  providedIn: 'root',
})
export class WeighingActivityRepository extends AbstractRepository<WeighingActivity> {
  override resource: typeof AbstractEntity = WeighingActivity;
  override type: string = 'weighing-activity';
}
