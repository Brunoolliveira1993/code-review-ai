const keytar = require('keytar');

const SERVICE = 'code-review-ai';

class CredentialService {

    async set(key, value) {
        return keytar.setPassword(SERVICE, key, value);
    }

    async get(key) {
        return keytar.getPassword(SERVICE, key);
    }

    async delete(key) {
        return keytar.deletePassword(SERVICE, key);
    }
}

module.exports = new CredentialService();