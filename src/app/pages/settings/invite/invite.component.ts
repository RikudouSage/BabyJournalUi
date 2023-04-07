import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {EncryptorService} from "../../../services/encryptor.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {lastValueFrom} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly encryptor: EncryptorService,
    private readonly userManager: UserManagerService,
    private readonly snackBar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    this.titleService.title = this.translator.get('Create an invite');
  }

  public async copyInviteCode() {
    const user = await this.userManager.getCurrentUser();
    const parentalUnit = await lastValueFrom(user.relationships.parentalUnit);
    const keys = await this.encryptor.exportKey();
    const inviteCode = `${keys}:::${parentalUnit.id}`;

    await navigator.clipboard.writeText(inviteCode);

    this.snackBar.open(
      await lastValueFrom(this.translator.get('Invite code copied to clipboard')),
      await lastValueFrom(this.translator.get('Dismiss')),
      {
        duration: 10_000,
      }
    );
  }
}
