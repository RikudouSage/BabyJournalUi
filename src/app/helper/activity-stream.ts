import {AbstractEntity} from "../services/json-api/abstract.entity";
import {ActivityStreamItem} from "../services/activity-stream.service";
import {EncryptedValue} from "../dto/encrypted-value";
import {ActivityType} from "../enum/activity-type.enum";

export function toActivityStreamItem(
  entity: AbstractEntity,
  type: ActivityType,
  childName: string | null,
  additionalFields: {[key: string]: any} = {},
): ActivityStreamItem {
  let result: Partial<ActivityStreamItem> = {
    id: String(entity.id),
    activityType: type,
    childName: childName,
  };

  for (const attribute of Object.keys(entity.attributes)) {
    const value = (<any>entity.attributes)[attribute];
    if (value instanceof EncryptedValue && !value.isDecrypted) {
      throw new Error("The entity must be decrypted before being passed to this function");
    }
    result[attribute] = value instanceof EncryptedValue ? value.decrypted : value;
  }
  for (const key of Object.keys(additionalFields)) {
    result[key] = additionalFields[key];
  }

  if (result.id === undefined) {
    throw new Error('ID cannot be undefined');
  }
  if (result.startTime === undefined) {
    throw new Error('Start time cannot be undefined');
  }
  if (result.endTime === undefined) {
    result.endTime = null;
  }

  return <ActivityStreamItem>result;
}
