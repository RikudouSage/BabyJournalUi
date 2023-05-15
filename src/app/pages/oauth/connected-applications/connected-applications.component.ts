import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {UserApplication} from "../../../entity/user.entity";
import {OAuthService, ScopeResponse} from "../../../services/oauth.service";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialog} from "../../../components/dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-connected-applications',
  templateUrl: './connected-applications.component.html',
  styleUrls: ['./connected-applications.component.scss']
})
export class ConnectedApplicationsComponent implements OnInit {

  public applications: UserApplication[] = [];
  public loading = true;
  public scopes: ScopeResponse[] = [];

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly oauth: OAuthService,
    private readonly dialog: MatDialog,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Applications');

    const user = await this.userManager.getCurrentUser();
    this.applications = user.attributes.applications;
    this.scopes = await this.oauth.getScopeInfo();

    this.loading = false;
  }

  public async revoke(app: UserApplication) {
    const dialog = this.dialog.open(ConfirmDialog, {
      data: {
        title: this.translator.get('Revoke application access?'),
        description: this.translator.get('Are you sure you want to revoke access for application {{appName}}?', {
          appName: app.name,
        }),
      }
    });
    dialog.afterClosed().subscribe(async result => {
      if (result) {
        this.loading = true;
        await this.oauth.revoke(app.identifier);
        this.applications = this.applications.filter(value => value.identifier !== app.identifier);
        this.loading = false;
      }
    });
  }
}
