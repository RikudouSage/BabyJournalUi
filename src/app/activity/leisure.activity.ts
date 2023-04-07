import {Activity} from "./activity";

export class LeisureActivity implements Activity {
  getColor(): string {
    return "#00bcd4";
  }

  getDisplayName(): string {
    return "Leisure";
  }

  getLink(): string {
    return "";
  }

}
