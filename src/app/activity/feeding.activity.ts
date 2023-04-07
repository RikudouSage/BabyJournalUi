import {Activity} from "./activity";

export class FeedingActivity implements Activity {
  getColor(): string {
    return '#f48fb1';
  }

  getDisplayName(): string {
    return 'Feeding';
  }

  getLink(): string {
    return "/activities/feeding";
  }
}
