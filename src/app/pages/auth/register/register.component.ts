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
  });
  public restoreForm = new FormGroup({
    restoreCode: new FormControl('', [Validators.required]),
  });

  public loading = false;
  public restoreError: Observable<string> | null = null;

  constructor(
    private readonly titleService: TitleService,
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly encryptor: EncryptorService,
    private readonly translator: TranslateService,
    private readonly userManager: UserManagerService,
  ) {
  }

  public ngOnInit(): void {
    this.titleService.setDefault();
  }

  public async register() {
    this.loading = true;
    await this.api.register(
      this.createForm.get('name')?.value ?? null,
      this.createForm.get('familyName')?.value ?? null,
    );

    await this.router.navigateByUrl('/');
  }

  public async restore() {
    this.restoreError = null;
    if (!this.restoreForm.valid) {
      return;
    }

    const key = <string>this.restoreForm.controls.restoreCode.value;
    const parts = key.split(':::');
    if (parts.length !== 3 || !isUuid(parts[2])) {
      this.restoreError = this.translator.get('The restore code your provided is invalid.');
      return;
    }

    await this.encryptor.restoreKey(parts[0], parts[1]);
    this.userManager.login(parts[2]);

    await this.router.navigateByUrl('/');
  }
}
