import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User, UserRepository} from "../../entity/user.entity";
import {Observable} from "rxjs";
import {EncryptorService} from "../../services/encryptor.service";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-parent-select',
  templateUrl: './parent-select.component.html',
  styleUrls: ['./parent-select.component.scss']
})
export class ParentSelectComponent implements OnInit {
  private _change: EventEmitter<User> = new EventEmitter<User>();
  private initialValueSet = false;
  private lateSet: string[] = [];

  protected users: User[] | null = null;
  protected form = new FormGroup({
    userId: new FormControl<string | null>(null),
  })

  @Input() public label: string | null = null;

  @Input() set user(user: User | string | null) {
    if (user === null) {
      return;
    }
    if (typeof user !== 'string') {
      user = <string>user.id;
    }
    this.form.patchValue({
      userId: user,
    });
    this.initialValueSet = true;
  }

  @Output() get change(): Observable<User> {
    return this._change;
  }

  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptor: EncryptorService,
  ) {
    this.form.controls.userId.valueChanges.subscribe(userId => {
      if (userId === null) {
        return;
      }
      if (this.users === null) {
        this.lateSet.push(userId);
        return;
      }

      const user = (<User[]>this.users).filter(user => user.id === userId);

      this._change.next(user[0]);
    });
  }

  public async ngOnInit(): Promise<void> {
    this.userRepository.collection().subscribe(async users => {
      this.users = await Promise.all(users.toArray().map(async user => await this.encryptor.decryptEntity(user)));
      if (this.lateSet.length) {
        for (const userId of this.lateSet) {
          this.user = this.users.filter(user => user.id === userId)[0];
        }
      }
      if (!this.initialValueSet) {
        this.user = this.users[0];
      }
    });
  }
}
