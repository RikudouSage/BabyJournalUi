import {AfterViewInit, Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {FormControl, FormGroup} from "@angular/forms";
import {ApiService} from "../../../services/api.service";
import {Router} from "@angular/router";

type Step = 'create' | 'invitationCode' | 'migrate';

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
  public loading = false;

  constructor(
    private readonly titleService: TitleService,
    private readonly api: ApiService,
    private readonly router: Router,
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
}
