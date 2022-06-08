export class Serializable {
    toString() {
        return JSON.stringify(this, undefined, '  '); // string the whole current object
    }
} 
