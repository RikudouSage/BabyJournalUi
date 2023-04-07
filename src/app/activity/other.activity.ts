import {Activity} from "./activity";

export class OtherActivity implements Activity {
  getColor(): string {
    return "#616161";
  }

  getDisplayName(): string {
    return "Other";
  }

  getLink(): string {
    return "";
  }
}
