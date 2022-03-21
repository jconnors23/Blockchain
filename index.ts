// chain, add blocks to it, users can create wallets : public + private keys
// public and private
// private + data  = signature
// public + signature = boolean

/*class Serializable {
    toString() {
        return JSON.stringify(this); // string the whole current object
    }
} */

import crypto from 'crypto';

// sender, receiver, value
class Data {
    sender: string; // p? 
    receiver: string; // p? 
    value: any; // p?
    constructor(sender: string, receiver: string, value: any) {
        this.sender = sender;
        this.receiver = receiver;
        this.value = value;
    }

    // parsing passed in string 
    static from(iterate: string) {
        const obj = JSON.parse(iterate);
        return new Data(obj.sender, obj.receiver, obj.value)
    }
}

// create the Block B <- B <- B <- B, backwards references 

class Block {
    when: number;
    counter: number;
    data: Data;
    previous: string;
    current: string;

    constructor(when: number, data: Data, previous: string) {
        this.when = when;
        this.data = data;
        this.previous = previous;
        this.counter = 0;
        this.current = this.generateHash()
    }

    generateHash(): string {
        return crypto.createHash('sha512').update(JSON.stringify(this)).digest('hex')
    }
}

// holds blocks
class Chain {
    blocks: Block[];
    constructor() {
        this.blocks = [new Block(0, new Data('', '', ''), '')]; // origin block has when of zero 
    }
    // buffer? 
    appendBlock(block: Block, signature: Buffer): boolean {
        const isValid = crypto.createVerify('sha256').update(block.data.toString()).verify(block.data.sender, signature)
        if (!isValid) { return false }
        // hashing, block added has reference to last block in current blockchain 
        block.previous = this.blocks[this.blocks.length - 1].current;
        this.blocks.push(block);
        return true;
        // A  <- B
        //    b.prev = a.current
    }
}

class Wallet {
    publicKey: string;
    privateKey: string;
    constructor(publicKey?: string, privateKey?: string) {
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

    generate(receiver: string, value: any): [Block, Buffer] {
        const dataInstance = new Data(this.publicKey, receiver, value);
        const signature = crypto.createSign('sha256').update(dataInstance.toString()).sign(this.privateKey);
        return [new Block(Date.now(), new Data(this.publicKey, receiver, value), ''), signature]
    }
}

const b = new Block(1, new Data('', '', ''), '');
//console.log(b);

