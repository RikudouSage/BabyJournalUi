import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {User, UserRepository} from "../../../entity/user.entity";
import {EncryptorService} from "../../../services/encryptor.service";
import {last} from "rxjs";
import {UserManagerService} from "../../../services/user-manager.service";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialog} from "../../../components/dialogs/confirm-dialog/confirm-dialog.component";
import {ApiService} from "../../../services/api.service";

@Component({
  selector: 'app-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.scss']
})
export class SharingComponent implements OnInit {
  public loading = false;
  public users: User[] | null = null;
  public currentUser: User | null = null;

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly userRepository: UserRepository,
    private readonly encryptor: EncryptorService,
    private readonly userManager: UserManagerService,
    private readonly dialog: MatDialog,
    private readonly api: ApiService,
  ) {
  }

  public ngOnInit(): void {
    this.titleService.title = this.translator.get('Sharing');
    this.loadUsers();
  }

  public async deleteUser(user: User) {
    const dialog = this.dialog.open(ConfirmDialog, {
      data: {
        title: this.translator.get('Delete user?'),
        description: this.translator.get('Are you sure you want to delete user {{user}}?', {
          user: typeof user.attributes.displayName === 'string' ? user.attributes.displayName : user.attributes.displayName.decrypted,
        }),
      }
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.users = null;
        this.userRepository.delete(user).subscribe(async () => {
          await this.api.refreshShareCode();
          this.loadUsers();
        });
      }
    });
  }

  private loadUsers() {
    this.userRepository.collection().subscribe(async users => {
      this.users = await Promise.all(users.toArray().map(async user => await this.encryptor.decryptEntity(user)));
      this.currentUser = await this.userManager.getCurrentUser();
      this.loading = false;
    });
  }
}
