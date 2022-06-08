import crypto from 'crypto';
import { Serializable } from './serializable';

// sender, receiver, value
export class Data extends Serializable {
    sender: string; 
    receiver: string; 
    value: any; 
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

export class Block extends Serializable {
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
export class Chain extends Serializable {
    static from(obj: any) {
        const chain = new Chain();
        chain.blocks = obj.blocks; 
        return chain; 
    }
    blocks: Block[];
    constructor() {
        super(); 
        this.blocks = [new Block(0, new Data('', '', ''), '')]; // origin block has 'when' of zero 
    }
    appendBlock(block: Block, signature: Buffer): boolean {
        const isValid = crypto.createVerify('sha256').update(block.data.toString()).verify(block.data.sender, signature)
        if (!isValid) { return false }
        // hashing, block added has reference to last block in current blockchain 
        block.previous = this.blocks[this.blocks.length - 1].current;
        this.blocks.push(block);
        return true;
        //    b.prev <- a.current
    }
}


