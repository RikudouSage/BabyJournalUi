import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {User, UserRepository} from "../../../entity/user.entity";
import {EncryptorService} from "../../../services/encryptor.service";
import {last} from "rxjs";
import {UserManagerService} from "../../../services/user-manager.service";

@Component({
  selector: 'app-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.scss']
})
export class SharingComponent implements OnInit {
  public loading = false;
  public users: User[] | null = null;
  public currentUser: User | null = null;

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly userRepository: UserRepository,
    private readonly encryptor: EncryptorService,
    private readonly userManager: UserManagerService,
  ) {
  }

  public ngOnInit(): void {
    this.titleService.title = this.translator.get('Sharing');
    this.userRepository.collection().subscribe(async users => {
      this.users = await Promise.all(users.toArray().map(async user => await this.encryptor.decryptEntity(user)));
      this.currentUser = await this.userManager.getCurrentUser();
      this.loading = false;
    });
  }
}
