import { createHash } from 'crypto';

export class DelphiCryptoUtil {
  static deriveKey(password: string, salt: string): Buffer {
    return createHash('sha256')
      .update(password + salt, 'utf8')
      .digest();
  }

  static xorTransform(data: Buffer, key: Buffer): Buffer {
    const result = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ key[i % key.length];
    }
    return result;
  }

  static encryptString(
    plainText: string,
    password: string,
    salt: string,
  ): string {
    const data = Buffer.from(plainText, 'utf8');
    const key = this.deriveKey(password, salt);
    const enc = this.xorTransform(data, key);
    return enc.toString('base64');
  }

  static decryptString(
    cipherTextB64: string,
    password: string,
    salt: string,
  ): string {
    const data = Buffer.from(cipherTextB64, 'base64');
    const key = this.deriveKey(password, salt);
    const dec = this.xorTransform(data, key);
    return dec.toString('utf8');
  }
}
