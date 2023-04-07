import {Activity} from "./activity";

export class MedicalActivity implements Activity {
  getColor(): string {
    return "#d32f2f";
  }

  getDisplayName(): string {
    return "Medical";
  }

  getLink(): string {
    return "";
  }

}
