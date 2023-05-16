import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {OAuthService, ScopeResponse} from "../../../services/oauth.service";
import {TranslateService} from "@ngx-translate/core";
import {toPromise} from "../../../helper/observables";
import {TitleService} from "../../../services/title.service";
import {FormArray, FormControl} from "@angular/forms";

@Component({
  selector: 'app-authorize',
  templateUrl: './o-auth-authorize.component.html',
  styleUrls: ['./o-auth-authorize.component.scss']
})
export class OAuthAuthorizeComponent implements OnInit {
  public loading = true;
  public error: string = '';
  public clientName: string = '';
  public scopes: ScopeResponse[] = [];
  public appTitle: Promise<string>;
  public preauthorized = false;

  public form = new FormArray<FormControl<boolean>>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly oAuth: OAuthService,
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
  ) {
    this.appTitle = titleService.defaultTitle;
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('App authorization');

    try {
      const clientId = this.route.snapshot.queryParams['client_id'];
      const scopes = (<string>this.route.snapshot.queryParams['scope']).split(' ');

      try {
        const isAuthorized = await this.oAuth.isAuthorized(clientId, scopes);
        if (isAuthorized.success) {
          this.preauthorized = true;
          window.location.href = <string>isAuthorized.redirectUrl;
          return;
        }
        if (isAuthorized.error) {
          this.error = isAuthorized.error;
          return;
        }
      } catch (e) {
        this.error = await toPromise(this.translator.get('There was an error while processing your request.'));
        return;
      }

      try {
        this.clientName = await this.oAuth.getClientName(clientId);
      } catch (e) {
        this.error = await toPromise(this.translator.get('There was an error while processing your request.'));
        return;
      }

      this.scopes = (await this.oAuth.getScopeInfo()).filter(value => scopes.includes(value.scope));
      for (const scope of this.scopes) {
        this.form.push(<FormControl<boolean>>new FormControl<boolean>({value: true, disabled: scope.required}));
      }
    } finally {
      this.loading = false;
    }
  }

  public async authorize() {
    this.oAuth.redirectToAuthorizationResult(
      true,
      this.scopes
        .filter((value, index) => this.form.at(index).value)
        .map(value => value.scope)
    );
  }

  public async reject() {
    this.oAuth.redirectToAuthorizationResult(false);
  }
}
