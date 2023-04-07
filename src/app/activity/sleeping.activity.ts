import {Activity} from "./activity";

export class SleepingActivity implements Activity {
  getColor(): string {
    return "#1a237e";
  }

  getDisplayName(): string {
    return "Sleeping";
  }

  getLink(): string {
    return "";
  }

}
