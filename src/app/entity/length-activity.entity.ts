import {AbstractEntity, EncryptedString} from "../services/json-api/abstract.entity";
import {EncryptedValue} from "../dto/encrypted-value";
import {Injectable} from "@angular/core";
import {AbstractRepository} from "../services/json-api/abstract.repository";

export class LengthActivity extends AbstractEntity {
  override type: string = 'length-activity';
  override attributes: {
    startTime: EncryptedValue;
    length: EncryptedValue;
  } = {
    startTime: new EncryptedValue(''),
    length: new EncryptedValue(''),
  };

  override encryptedValueConvertors = {
    startTime: EncryptedString,
    length: EncryptedString,
  };
}

@Injectable({
  providedIn: 'root',
})
export class LengthActivityRepository extends AbstractRepository<LengthActivity> {
  override resource: typeof AbstractEntity = LengthActivity;
  override type: string = 'length-activity';
}
