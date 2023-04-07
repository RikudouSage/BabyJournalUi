import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {Child, ChildRepository} from "../../../entity/child.entity";
import {EncryptorService} from "../../../services/encryptor.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {lastValueFrom, of} from "rxjs";
import {UserRepository} from "../../../entity/user.entity";

@Component({
  selector: 'app-select-child',
  templateUrl: './select-child.component.html',
  styleUrls: ['./select-child.component.scss']
})
export class SelectChildComponent implements OnInit {

  public loading = true;
  public children: Child[] = [];
  public currentlySelected: Child | null = null;

  constructor(
    private readonly titleService: TitleService,
    private readonly childRepository: ChildRepository,
    private readonly encryptor: EncryptorService,
    private readonly userManager: UserManagerService,
    private readonly userRepository: UserRepository,
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.titleService.title = 'Select child';
    this.currentlySelected = await lastValueFrom((await this.userManager.getCurrentUser()).relationships.selectedChild);

    this.childRepository.collection().subscribe(async children => {
      this.children = await Promise.all(
        children.toArray().map(async child => await this.encryptor.decryptEntity(child)),
      );
      this.loading = false;
    });
  }

  setAsActive(child: Child) {
    this.userManager.getCurrentUser().then(user => {
      user.relationships.selectedChild = of(child);
      this.userRepository.update(user, false).subscribe(user => {
        user.relationships.selectedChild.subscribe(child => {
          if (child === null) {
            return;
          }

          this.currentlySelected = child;
        });
      });
    });
  }
}
