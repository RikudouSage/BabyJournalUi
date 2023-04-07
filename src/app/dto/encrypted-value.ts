export class EncryptedValue {
  private _decrypted: string | null = null;
  constructor(
    public readonly encrypted: string,
  ) {
  }

  get isDecrypted() {
    return this._decrypted !== null;
  }

  set decrypted(value: string) {
    this._decrypted = value;
  }

  get decrypted(): string {
    if (this._decrypted === null) {
      throw new Error("Trying to get decrypted value before decrypting");
    }

    return this._decrypted;
  }
}
