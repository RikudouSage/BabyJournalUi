import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {DatabaseService} from "../../../services/database.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly database: DatabaseService,
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {
    this.titleService.title = this.translator.get('Logout');
  }

  public async logout() {
    this.userManager.logout();
    await this.database.deleteAll();
    window.location.reload();
  }
}
