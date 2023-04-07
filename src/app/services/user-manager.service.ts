import { Injectable } from '@angular/core';
import {BehaviorSubject, lastValueFrom, Observable} from "rxjs";
import {User, UserRepository} from "../entity/user.entity";

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {
  private previousState = false;
  private readonly localStorageUserIdName = 'userId';
  private readonly _isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    localStorage.getItem(this.localStorageUserIdName) !== null
  );

  constructor(
    private readonly userRepository: UserRepository,
  ) {
  }

  public isLoggedIn(): boolean {
    const newState = localStorage.getItem(this.localStorageUserIdName) !== null;

    if (newState !== this.previousState) {
      this._isLoggedIn.next(newState);
      this.previousState = newState;
    }

    return newState;
  }

  public getUserId(): string {
    return localStorage.getItem(this.localStorageUserIdName) ?? '';
  }

  public login(userId: string) {
    localStorage.setItem(this.localStorageUserIdName, userId);
    this.isLoggedIn();
  }

  public async getCurrentUser(): Promise<User> {
    return await lastValueFrom(this.userRepository.get('me', {
      include: ['selectedChild'],
    }));
  }
  get isLoggedInChanged(): Observable<boolean> {
    return this._isLoggedIn;
  }
}
