import keytar from 'keytar';

export interface ICredentialService {
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<boolean>;
}

const SERVICE = 'code-review-ai';

class KeytarCredentialService implements ICredentialService {
  async set(key: string, value: string): Promise<void> {
    await keytar.setPassword(SERVICE, key, value);
  }

  async get(key: string): Promise<string | null> {
    return keytar.getPassword(SERVICE, key);
  }

  async delete(key: string): Promise<boolean> {
    return keytar.deletePassword(SERVICE, key);
  }
}

export const credentialService = new KeytarCredentialService();
