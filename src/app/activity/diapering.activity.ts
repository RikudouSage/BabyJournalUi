import {Activity} from "./activity";

export class DiaperingActivity implements Activity {
  getColor(): string {
    return "#d500f9";
  }

  getDisplayName(): string {
    return "Diapering";
  }

  getLink(): string {
    return "";
  }

}
