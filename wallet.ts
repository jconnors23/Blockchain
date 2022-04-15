import crypto from 'crypto';
import { Block } from 'typescript';
import { Data, Serializable } from '.';
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
        console.log(this.privateKey, this.publicKey);
        const dataInstance = new Data(this.publicKey, receiver, value);
        const signature = crypto.createSign('sha256').update(dataInstance.toString()).end().sign(this.privateKey); // str, hash for data, security
        return [Date.now(), new Data(this.publicKey, receiver, value), signature];
    }

    // given obj, returns wallet instance. need this bc generate fails when given random object 
    static from (iterate: any) {
        return new Wallet(iterate.publicKey, iterate.privateKey)
    }
}

if (process.argv[2] === 'new') { // if running new, generate new wallet
    console.log(JSON.stringify(new Wallet));
} else { // else wallet parameters expected 
    const current = Wallet.from(wallet as any)
    //const current = Wallet.from(JSON.parse(new Wallet().toString()));
    let values  = current.generate(process.argv[3], process.argv[4]);
    const signature = values[2].toString('hex'); // converts buffer to hex values 
    // @ts-ignore
    console.log(JSON.stringify(values[0], values[1], signature))
}

// command line interface: run command in terminal: process name, what to execute (filemane ex), arguments: arg1 arg2 (do things based on args), testing purposes
// terminal user interface: after user does something, prompted
// people that chat get Moogle coins added to their wallet 