import jsonwebtoken  from 'jsonwebtoken';
import crypto from 'crypto';
import InvalidTokenException from '../exception/invalidToken.js';

class JwsService {

    #keyPairs;

    constructor() {
        this.#keyPairs = {};
    }

    generateJws(payload, keyName, lifeTimeInMillis) {
        return jsonwebtoken.sign(
            {body: payload},
            this.#getOrGenerateKeyPair(keyName).privateKey,
            {
                algorithm: 'RS256',
                expiresIn: lifeTimeInMillis,
                jwtid: crypto.randomUUID()
            }
        );
    }

    parseJws(jws, keyName) {
        try {
            if(jws.startsWith('Bearer ')) jws = jws.substring(7);

            return jsonwebtoken.verify(
                jws,
                this.#getOrGenerateKeyPair(keyName).publicKey,
                {
                    algorithm: 'RS256'
                }
            ).body;
        } catch(err) {
            const exception = new InvalidTokenException(`Invalid jws='${jws}'`);
            exception.cause = err;
            throw exception;
        }
    }

    #getOrGenerateKeyPair(keyName) {
        if(this.#keyPairs[keyName]) {
            return this.#keyPairs[keyName];
        } else {
            const keyPair = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: {
                  type: 'spki',
                  format: 'pem'
                },
                privateKeyEncoding: {
                  type: 'pkcs8',
                  format: 'pem',
                }
            });
            this.#keyPairs[keyName] = keyPair;
            return keyPair;
        }
    }
};

export default JwsService;