import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {User, UserRepository} from "../../../entity/user.entity";
import {EncryptorService} from "../../../services/encryptor.service";
import {ParentalUnit, ParentalUnitRepository} from "../../../entity/parental-unit.entity";
import {lastValueFrom} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {ChangeNameDialogComponent} from "../../../components/dialogs/change-name-dialog/change-name-dialog.component";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {ConfirmDialog} from "../../../components/dialogs/confirm-dialog/confirm-dialog.component";
import {ApiService} from "../../../services/api.service";
import {DatabaseService} from "../../../services/database.service";

@Component({
  selector: 'app-account',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit  {
  public user: User | null = null;
  public parentalUnit: ParentalUnit | null = null;
  public loading = false;

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
    private readonly dialog: MatDialog,
    private readonly userRepository: UserRepository,
    private readonly parentalUnitRepository: ParentalUnitRepository,
    private readonly api: ApiService,
    private readonly database: DatabaseService,
  ) {
  }

  ngOnInit(): void {
    this.titleService.title = this.translator.get('Account settings');
    this.userManager.getCurrentUser().then(async user => {
      this.user = await this.encryptor.decryptEntity(user);
      this.parentalUnit = await this.encryptor.decryptEntity(await lastValueFrom(this.user.relationships.parentalUnit));
    });
  }

  public openNameChangeDialog() {
    if (this.user === null) {
      return;
    }
    const ref = this.dialog.open(ChangeNameDialogComponent, {
      data: {
        name: this.user.attributes.name,
      },
    });
    ref.afterClosed().subscribe(async result => {
      if (this.user === null || result === undefined) { // only to escape constant type checks
        return;
      }
      this.loading = true;
      this.user.attributes.name = new EncryptedValue(await this.encryptor.encrypt(result), result);
      this.userRepository.update(this.user, false).subscribe(async user => {
        this.user = await this.encryptor.decryptEntity(user);
        this.loading = false;
      });
    });
  }

  public openFamilyNameChangeDialog() {
    if (this.parentalUnit === null) {
      return;
    }

    const ref = this.dialog.open(ChangeNameDialogComponent, {
      data: {
        name: this.parentalUnit.attributes.name,
      },
    });
    ref.afterClosed().subscribe(async result => {
      if (this.parentalUnit === null || result === undefined) { // only to escape constant type checks
        return;
      }

      this.loading = true;
      this.parentalUnit.attributes.name = new EncryptedValue(await this.encryptor.encrypt(result), result);
      this.parentalUnitRepository.update(this.parentalUnit, false).subscribe(async parentalUnit => {
        this.parentalUnit = await this.encryptor.decryptEntity(parentalUnit);
        this.loading = false;
      });
    });
  }

  public async deleteAccount() {
    if (this.user === null) {
      return;
    }
    const dialog = this.dialog.open(ConfirmDialog, {
      data: {
        title: this.translator.get('Are you sure?'),
        description: this.translator.get(`You cannot take this action back. If there are other users connected to this account, no data other than your user will be deleted. Otherwise all of your data will be deleted.`),
      },
    });
    dialog.afterClosed().subscribe(async (result: boolean) => {
      if (!result) {
        return;
      }

      await this.database.deleteAll();
      await this.api.deleteUser();
      await this.userManager.logout();
      window.location.reload();
    });
  }
}
