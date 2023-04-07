import {Injectable} from '@angular/core';
import {DatabaseService} from "./database.service";
import {fromByteArray, toByteArray} from "base64-js";
import {AbstractEntity} from "./json-api/abstract.entity";
import {EncryptedValue} from "../dto/encrypted-value";

@Injectable({
  providedIn: 'root'
})
export class EncryptorService {

  constructor(
    private readonly database: DatabaseService,
  ) {
  }

  public async createKey(): Promise<void> {
    const key = await window.crypto.subtle.generateKey({
      name: 'RSA-OAEP',
      modulusLength: 4096,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: 'SHA-512'
    }, true, ['encrypt', 'decrypt']);
    await this.database.storeCryptoKey(key);
  }

  public async encrypt(value: string): Promise<string> {
    const key = await this.database.getCryptoKey();
    const encoder = new TextEncoder();
    const result = await window.crypto.subtle.encrypt({
      name: 'RSA-OAEP',
    }, key.publicKey, encoder.encode(value));

    return fromByteArray(new Uint8Array(result));
  }

  public async decrypt(value: string): Promise<string> {
    const key = await this.database.getCryptoKey();
    const decoder = new TextDecoder();

    const result = await window.crypto.subtle.decrypt({
      name: 'RSA-OAEP',
    }, key.privateKey, toByteArray(value));

    return decoder.decode(result);
  }

  public async decryptEntity<T extends AbstractEntity>(entity: T): Promise<T> {
    for (const key of Object.keys(entity.attributes)) {
      const attributeValue = (entity.attributes as any)[key];
      if (attributeValue instanceof EncryptedValue) {
        if (!attributeValue.isDecrypted) {
          attributeValue.decrypted = await this.decrypt(attributeValue.encrypted);
        }
      }
    }

    return entity;
  }

  public async exportKey() {
    const key = await this.database.getCryptoKey();
    const privateKey = key.privateKey;
    const publicKey = key.publicKey;

    const exportedPrivateKey = fromByteArray(new Uint8Array(await window.crypto.subtle.exportKey('pkcs8', privateKey)));
    const exportedPublicKey = fromByteArray(new Uint8Array(await window.crypto.subtle.exportKey('spki', publicKey)));

    return `${exportedPrivateKey}:::${exportedPublicKey}`;
  }
}
