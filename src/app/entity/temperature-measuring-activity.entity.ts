import {AbstractEntity, EncryptedString} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";

export class TemperatureMeasuringActivity extends AbstractEntity {
  override type: string = 'temperature-measuring-activity';
  override attributes: {
    startTime: EncryptedValue;
    temperature: EncryptedValue;
  } = {
    startTime: new EncryptedValue(''),
    temperature: new EncryptedValue(''),
  };

  override encryptedValueConvertors = {
    startTime: EncryptedString,
    temperature: EncryptedString,
  };
}

@Injectable({
  providedIn: 'root',
})
export class TemperatureMeasuringActivityRepository extends AbstractRepository<TemperatureMeasuringActivity> {
  override resource: typeof AbstractEntity = TemperatureMeasuringActivity;
  override type: string = 'temperature-measuring-activity';
}
