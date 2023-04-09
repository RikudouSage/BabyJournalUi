import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {Child, ChildRepository} from "../../../entity/child.entity";
import {EncryptorService} from "../../../services/encryptor.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {lastValueFrom, of} from "rxjs";
import {UserRepository} from "../../../entity/user.entity";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialog} from "../../../components/dialogs/confirm-dialog/confirm-dialog.component";
import {potentiallyEncryptedValue} from "../../../pipes/potentially-encrypted-value.pipe";

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
    private readonly translator: TranslateService,
    private readonly dialog: MatDialog,
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Your children');
    await this.reloadData();
  }

  private async reloadData() {
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

  public async confirmDelete(child: Child) {
    const dialog = this.dialog.open(ConfirmDialog, {
      data: {
        title: this.translator.get('Remove child'),
        description: this.translator.get('Are you sure you want to remove child {{childName}}? You cannot take this action back.', {
          childName: potentiallyEncryptedValue(child.attributes.displayName),
        }),
      }
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.childRepository.delete(child).subscribe(async () => {
          await this.reloadData();
          this.loading = false;
        });
      }
    });
  }
}
