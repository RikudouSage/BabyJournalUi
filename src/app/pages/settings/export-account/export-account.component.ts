import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {EncryptorService} from "../../../services/encryptor.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {lastValueFrom} from "rxjs";

@Component({
  selector: 'app-export-account',
  templateUrl: './export-account.component.html',
  styleUrls: ['./export-account.component.scss']
})
export class ExportAccountComponent implements OnInit {
  public loading = false;
  public exportString: string | null = null;

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly encryptor: EncryptorService,
    private readonly userManager: UserManagerService,
    private readonly snackBar: MatSnackBar,
  ) {
  }

  public ngOnInit(): void {
    this.titleService.title = this.translator.get('Export account');
  }

  public async export() {
    this.loading = true;
    this.exportString = (await this.encryptor.exportKey()) + `:::${this.userManager.getUserId()}`;
    this.loading = false;
  }

  public async toast(message: string): Promise<void> {
    const buttonText = await lastValueFrom(this.translator.get('Dismiss'));
    this.snackBar.open(message, buttonText, {
      duration: 10_000,
    });
  }

  public async copyToClipboard() {
    await navigator.clipboard.writeText(<string>this.exportString);
    this.translator.get('Account data have been copied to clipboard.').subscribe(translated => {
      this.toast(translated);
    });
  }
}
