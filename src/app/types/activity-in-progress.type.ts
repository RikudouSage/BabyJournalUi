import {ActivityType} from "../enum/activity-type.enum";

export interface ActivityInProgress {
  startTime: Date;
  activity: ActivityType;
  mode: 'running' | 'paused';
  data: any;
  notes: string | null;
}
