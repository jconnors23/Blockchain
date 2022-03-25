// chain, add blocks to it, users can create wallets : public + private keys
// public and private
// private + data  = signature
// public + signature = boolean
// Wallet creation - > JSON 
// Wallet balances?
// Mining? 

export class Serializable {
    toString() {
        return JSON.stringify(this); // string the whole current object
    }
} 

import crypto from 'crypto';

// sender, receiver, value
export class Data extends Serializable{
    sender: string; // p? 
    receiver: string; // p? 
    value: any; // p?
    constructor(sender: string, receiver: string, value: any) {
        super();
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

class Block extends Serializable {
    when: number;
    counter: number;
    data: Data;
    previous: string;
    current: string;

    constructor(when: number, data: Data, previous: string) {
        super();
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
class Chain extends Serializable {
    blocks: Block[];
    constructor() {
        super(); 
        this.blocks = [new Block(0, new Data('', '', ''), '')]; // origin block has when of zero 
    }
    // buffer? 
    appendBlock(block: Block, signature: Buffer): boolean {
        //console.log(block.data.toString());
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

//const b = new Block(1, new Data('', '', ''), '');
//console.log(b);
//const chain = new Chain(); 
//const [block, signature] = new Wallet().generate('hello', 'world');
//console.log(block, signature)
//block.data.value = Number.MAX_SAFE_INTEGER;
//console.log(block);

//console.log(chain.appendBlock(block, signature));

