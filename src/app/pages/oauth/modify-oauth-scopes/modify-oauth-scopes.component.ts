import {Component, OnInit} from '@angular/core';
import {UserManagerService} from "../../../services/user-manager.service";
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {OAuthService, ScopeResponse} from "../../../services/oauth.service";
import {UserApplication} from "../../../entity/user.entity";
import {Observable, of} from "rxjs";
import {FormArray, FormControl} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {toPromise} from "../../../helper/observables";
import {findRouteParent} from "../../../helper/route-hierarchy";

@Component({
  selector: 'app-modify-oauth-scopes',
  templateUrl: './modify-oauth-scopes.component.html',
  styleUrls: ['./modify-oauth-scopes.component.scss']
})
export class ModifyOauthScopesComponent implements OnInit {
  private currentRoute: string | null = null;

  public loading = true;
  public application: UserApplication | null = null;
  public error: Observable<string> = of('');
  public form = new FormArray<FormControl<boolean>>([]);
  public availableScopes: ScopeResponse[] = [];
  public clientId: string;

  constructor(
    private readonly userManager: UserManagerService,
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly route: ActivatedRoute,
    private readonly oauth: OAuthService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
  ) {
  }
  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Edit application');
    const user = await this.userManager.getCurrentUser();
    this.availableScopes = await this.oauth.getScopeInfo();
    for (const scope of this.availableScopes) {
      this.form.push(<FormControl<boolean>>new FormControl<boolean>({value: scope.required, disabled: scope.required}));
    }

    this.route.url.subscribe(parts => this.currentRoute = parts.join('/'));

    this.route.params.subscribe(async params => {
      try {
        this.loading = true;

        this.clientId = params['clientId'];
        const filtered = user.attributes.applications.filter(value => value.identifier === this.clientId);
        if (!filtered.length) {
          this.error = this.translator.get('Application does not exist.')
          return;
        }
        this.application = filtered[0];
        for (const scope of this.application.scopes) {
          const index = this.getIndexByScope(scope);
          if (index === null) {
            this.error = this.translator.get('There was an internal error.');
            return;
          }
          this.form.at(index).patchValue(true);
        }
      } finally {
        this.loading = false;
      }
    });
  }

  private getIndexByScope(scope: string): number | null {
    for (let i = 0; i < this.availableScopes.length; ++i) {
      if (this.availableScopes[i].scope === scope) {
        return i;
      }
    }

    return null;
  }

  public async save() {
    const scopes: string[] = [];
    for (let index = 0; index < this.availableScopes.length; ++index) {
      if (this.form.at(index).value) {
        scopes.push(this.availableScopes[index].scope);
      }
    }

    await this.oauth.setScopes(this.clientId, scopes);
    this.snackBar.open(
      await toPromise(this.translator.get('Successfully saved!')),
      await toPromise(this.translator.get('Dismiss')),
      {
        duration: 5_000,
      }
    );
    if (this.currentRoute !== null) {
      await this.router.navigateByUrl(findRouteParent(this.currentRoute));
    }
  }
}
