import djs from 'discord.js';
import { Block, Chain } from './index'; 
import fs from 'fs'; 
import { Wallet } from './wallet';
require('dotenv').config();

const client = new djs.Client({intents: [djs.Intents.FLAGS.GUILDS, djs.Intents.FLAGS.GUILD_MESSAGES]})
const CHAIN = fs.existsSync('blockchain.json') 
    ? Chain.from(JSON.parse(fs.readFileSync('blockchain.json').toString()))
    : new Chain() 

let wallets: Record<string, Wallet> = {  }

if (fs.existsSync('wallets.json')) {
    const rawwallets = JSON.parse(fs.readFileSync('wallets.json').toString())
    for (const [key, value] of Object.entries(rawwallets)) {
        // set key of wallets(abc) = def , 2 notations for reading and writing 
        wallets[key] = Wallet.from(value); 
    }
}

client.on('ready', () => {
    console.log('collector logged in', client.user?.tag)
})

client.on('message', (msg) => {
    if (msg.author === client.user) { return }
    if (msg.content.includes('#balance')) {
        const balance = getUserBalance(msg.author.id);
        msg.reply('Current Balance:' + balance); 



        return;
    }
    let value = 0.05;
    if (msg.content.includes('http')) {
        value = 0.2;
    }
    addUserCoins(msg.author.id, value)
})

function addUserCoins(id: string, value: number) {
    const botwallet = getUserWallet(client.user!.id);
    const userwallet = getUserWallet(id);
    const result = botwallet.generate(userwallet.publicKey, {amount: value});
    CHAIN.appendBlock(new Block(result[0], result[1], ''), result[2])
    fs.writeFileSync('blockchain.json', JSON.stringify(CHAIN, undefined, '  ')); 
}

function getUserBalance(id: string): number {
    
    return 0; 
}

function getUserWallet(id: string): Wallet {
    if (id in wallets) {
        return wallets[id]; 
    }
    let current = new Wallet();
    // key id val current
    wallets[id] = current; 
    fs.writeFileSync('wallets.json', JSON.stringify(wallets, undefined, '  ')); 
    return current;
}

client.login(process.env.discord_token)

// get coins
// see coins
// blockified 