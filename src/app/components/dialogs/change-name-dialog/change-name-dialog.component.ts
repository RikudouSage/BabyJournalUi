import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {EncryptedValue} from "../../../dto/encrypted-value";

interface DialogData {
  name: EncryptedValue | null;
}

@Component({
  selector: 'app-change-name-dialog',
  templateUrl: './change-name-dialog.component.html',
  styleUrls: ['./change-name-dialog.component.scss']
})
export class ChangeNameDialogComponent {

  public name: string;

  constructor(
    public dialogRef: MatDialogRef<ChangeNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: DialogData,
  ) {
    this.name = data.name ? data.name.decrypted : '';
  }

  public onCancel() {
    this.dialogRef.close();
  }
}
