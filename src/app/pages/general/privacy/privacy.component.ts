import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {lastValueFrom} from "rxjs";

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit {
  public userName: EncryptedValue | null = null;
  public childName: EncryptedValue | null = null;

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Privacy');
    if (this.userManager.isLoggedIn()) {
      const user = await this.userManager.getCurrentUser();
      this.userName = user.attributes.name;
      const child = await lastValueFrom(user.relationships.selectedChild);
      this.childName = child?.attributes.name ?? null;
    }
  }

}
