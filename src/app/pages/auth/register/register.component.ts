import {AfterViewInit, Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "../../../services/api.service";
import {Router} from "@angular/router";
import {EncryptorService} from "../../../services/encryptor.service";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {isUuid} from "../../../helper/uuid";
import {UserManagerService} from "../../../services/user-manager.service";
import {DatabaseService} from "../../../services/database.service";

type Step = 'create' | 'invitationCode' | 'migrate' | 'restore';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public step: Step | null = null;
  public createForm = new FormGroup({
    name: new FormControl(''),
    familyName: new FormControl(''),
    parentalUnitId: new FormControl(''),
  });
  public loginFromCodeForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
  });

  public loading = false;
  public codeLoginError: Observable<string> | null = null;

  constructor(
    private readonly titleService: TitleService,
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly encryptor: EncryptorService,
    private readonly translator: TranslateService,
    private readonly userManager: UserManagerService,
    private readonly database: DatabaseService,
  ) {
  }

  public ngOnInit(): void {
    this.titleService.setDefault();
  }

  public async register() {
    this.loading = true;
    await this.api.register(
      this.createForm.controls.name.value || null,
      this.createForm.controls.familyName.value || null,
      this.createForm.controls.parentalUnitId.value || null,
    );

    await this.router.navigateByUrl('/');
  }

  public async restore() {
    const userId = await this.handleCodeLogin();
    if (userId === null) {
      return;
    }
    this.userManager.login(userId);

    try {
      await this.userManager.getCurrentUser();
      await this.router.navigateByUrl('/');
    } catch (e) {
      this.userManager.logout();
      await this.database.deleteAll();
      this.codeLoginError = this.translator.get('The restore code you provided is invalid.');
    }
  }

  public async loginFromInvite() {
    const parentalUnitId = await this.handleCodeLogin();
    if (parentalUnitId === null) {
      return;
    }
    this.createForm.patchValue({
      parentalUnitId: parentalUnitId,
    });
    this.step = 'create';
  }

  private async handleCodeLogin(): Promise<string | null> {
    this.codeLoginError = null;
    if (!this.loginFromCodeForm.valid) {
      return null;
    }

    const key = <string>this.loginFromCodeForm.controls.code.value;
    const parts = key.split(':::');
    if (parts.length !== 3 || !isUuid(parts[2])) {
      this.codeLoginError = this.translator.get('The restore code you provided is invalid.');
      return null;
    }

    await this.encryptor.restoreKey(parts[0], parts[1]);

    return parts[2];
  }
}
