import {AfterContentInit, AfterViewInit, Component, OnInit, Type} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Gender} from "../../../enum/gender.enum";
import {AppValidators} from "../../../helper/app-validators";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {Child, ChildRepository} from "../../../entity/child.entity";
import {EncryptorService} from "../../../services/encryptor.service";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {UserRepository} from "../../../entity/user.entity";
import {UserManagerService} from "../../../services/user-manager.service";
import {of} from "rxjs";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-create-first',
  templateUrl: './create-child.component.html',
  styleUrls: ['./create-child.component.scss']
})
export class CreateChildComponent implements OnInit {

  public Gender = Gender;

  public form = new FormGroup({
    name: new FormControl(),
    gender: new FormControl(null, [AppValidators.isEnum(Gender)]),
    birthDay: new FormControl(),
    birthWeight: new FormControl(null, [Validators.min(0)]),
    birthLength: new FormControl(null, [Validators.min(0)]),
  });
  public loading = false;
  public isMobile = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay(),
    );

  constructor(
    private readonly titleService: TitleService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly childRepository: ChildRepository,
    private readonly encryptor: EncryptorService,
    private readonly userRepository: UserRepository,
    private readonly userManager: UserManagerService,
    private readonly router: Router,
    private readonly translator: TranslateService,
  ) {
  }

  public ngOnInit(): void {
    this.titleService.title = this.translator.get('Add child');
  }

  public async addChild() {
    this.loading = true;

    const child = new Child();
    child.attributes.name = this.form.controls.name.value
      ? new EncryptedValue(await this.encryptor.encrypt(this.form.controls.name.value))
      : null;
    child.attributes.gender = this.form.controls.gender.value
      ? new EncryptedValue(await this.encryptor.encrypt(this.form.controls.gender.value))
      : null;
    child.attributes.birthDay = this.form.controls.birthDay.value
      ? new EncryptedValue(await this.encryptor.encrypt((this.form.controls.birthDay.value as Date).toISOString()))
      : null;
    child.attributes.birthWeight = this.form.controls.birthWeight.value
      ? new EncryptedValue(await this.encryptor.encrypt(this.form.controls.birthWeight.value))
      : null;
    child.attributes.birthHeight = this.form.controls.birthLength.value
      ? new EncryptedValue(await this.encryptor.encrypt(this.form.controls.birthLength.value))
      : null;

    this.childRepository.create(child, false).subscribe(result => {
      this.userManager.getCurrentUser().then(user => {
        user.relationships.selectedChild = of(result);
        this.userRepository.update(user, false).subscribe(() => {
          this.router.navigateByUrl('/');
        });
      });
    });
  }
}
