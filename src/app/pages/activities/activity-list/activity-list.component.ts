import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {UserRepository} from "../../../entity/user.entity";
import {UserManagerService} from "../../../services/user-manager.service";
import {EncryptorService} from "../../../services/encryptor.service";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {Activity} from "../../../activity/activity";
import {ACTIVITIES} from "../../../dependency-injection/injection-tokens";
import {Router} from "@angular/router";
import {ChildRepository} from "../../../entity/child.entity";

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  constructor(
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
    @Inject(ACTIVITIES) public readonly activities: Activity[],
  ) {
  }

  ngOnInit(): void {
    this.titleService.setDefault();
    this.userManager.getCurrentUser().then(user => {
      user.relationships.selectedChild.subscribe(async child => {
        if (child === null) {
          return;
        }
        child = await this.encryptor.decryptEntity(child);
        this.titleService.title = child.attributes.displayName instanceof EncryptedValue
          ? child.attributes.displayName.decrypted
          : child.attributes.displayName;
      });
    });
  }
}
