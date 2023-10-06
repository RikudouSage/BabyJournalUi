import {AbstractEntity, EncryptedNullableString, EncryptedString} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";

export class MilestoneActivity extends AbstractEntity {
  override type: string = 'milestone-activity';
  override attributes: {
    startTime: EncryptedValue;
    note: EncryptedValue | null;
    milestoneName: EncryptedValue | null;
    predefinedMilestone: EncryptedValue | null;
  } = {
    startTime: new EncryptedValue(''),
    note: null,
    milestoneName: null,
    predefinedMilestone: null,
  }

  override encryptedValueConvertors = {
    startTime: EncryptedString,
    note: EncryptedNullableString,
    milestoneName: EncryptedNullableString,
    predefinedMilestone: EncryptedNullableString,
  }
}

@Injectable({
  providedIn: 'root',
})
export class MilestoneActivityRepository extends AbstractRepository<MilestoneActivity> {
  resource: typeof AbstractEntity = MilestoneActivity;
  type: string = 'milestone-activity';
}
