import {AbstractEntity, EncryptedString} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";

export class SharedInProgressActivity extends AbstractEntity {
  type: string = 'shared-in-progress-activity';

  override attributes = {
    activityType: '',
    config: new EncryptedValue(''),
  }

  override encryptedValueConvertors = {
    config: EncryptedString,
  }
}

@Injectable({
  providedIn: 'root',
})
export class SharedInProgressActivityRepository extends AbstractRepository<SharedInProgressActivity> {
  resource: typeof AbstractEntity = SharedInProgressActivity;
  type: string = 'shared-in-progress-activity';
}
