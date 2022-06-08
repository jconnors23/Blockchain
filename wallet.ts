import crypto from 'crypto';
import { Block } from 'typescript';
import { Data, Serializable } from './blockchain';
import wallet from './walletstorage.json'

// creates, stores, pub & priv keys, 
// generate new data with signatures that can be verified 

export class Wallet extends Serializable {
    publicKey: string;
    privateKey: string;
    constructor(publicKey?: string, privateKey?: string) {
        super(); 
        if (publicKey && privateKey) {
            this.publicKey = publicKey;
            this.privateKey = privateKey;
            return;
        }
        // generate public + private keys using rsa 
        const keys = crypto.generateKeyPairSync('rsa', {
            modulusLength: 512,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        })
        this.publicKey = keys.publicKey;
        this.privateKey = keys.privateKey;
    }

    generate(receiver: string, value: any): [number, Data, Buffer] {
        const dataInstance = new Data(this.publicKey, receiver, value);
        const signature = crypto.createSign('sha256').update(dataInstance.toString()).end().sign(this.privateKey); // str, hash for data, security
        return [Date.now(), new Data(this.publicKey, receiver, value), signature];
    }

    // given obj, returns wallet instance. need this bc generate fails when given random object 
    static from (iterate: any) {
        return new Wallet(iterate.publicKey, iterate.privateKey)
    }
}
