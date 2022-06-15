import { Wallet } from './wallet';
import djs from 'discord.js';
import { Block, Chain } from './blockchain'; 
import fs from 'fs'; 
require('dotenv').config();

const client = new djs.Client({intents: [djs.Intents.FLAGS.GUILDS, djs.Intents.FLAGS.GUILD_MESSAGES]})
const botjunkid = '967116099927801906'; 
const CHAIN = fs.existsSync('blockchain.json')  
    ? Chain.from(JSON.parse(fs.readFileSync('blockchain.json').toString()))
    : new Chain() 

let wallets: Record<string, Wallet> = {  }

/*
if (fs.existsSync('wallets.json')) {
    const rawwallets = JSON.parse(fs.readFileSync('wallets.json').toString())
    for (const [key, value] of Object.entries(rawwallets)) {
        wallets[key] = Wallet.from(value); 
    }
}
*/
client.on('ready', () => {
    console.log('collector logged in', client.user?.tag)
})

client.on('message', (msg) => {
    if (msg.author === client.user) { return }
    if (msg.content.includes('#balance')) {
        const balance = getTransactions(msg.author.id);
        msg.reply('Current Balance: ' + balance + ' Coins'); 
        return;
    }
    let value = 0.05;
    if (msg.content.includes('http')) {
        value = 0.2;
    }
    let currentBalance = Math.floor(getTransactions(msg.author.id)); 
    addUserCoins(msg.author, value)
    let updatedBalance = Math.floor(getTransactions(msg.author.id)); 
    if (currentBalance != updatedBalance) { // will trigger if they lose coins 
        client.channels.fetch(botjunkid).then((channel) => { // bot will send msg to this channel 
            // @ts-ignore
            if (channel.isText()) {
                // @ts-ignore
                channel.send('Hello, <@' + msg.author.id + '> you have earned a Moogle Coin!');
            }
        })
    }
})

function addUserCoins(author: djs.User, value: number) {
    const botwallet = getUserWallet(client.user!.id);
    const userwallet = getUserWallet(author.id);
    const result = botwallet.generate(userwallet.publicKey, {amount: value});
    CHAIN.appendBlock(new Block(result[0], result[1], ''), result[2])
    fs.writeFileSync('blockchain.json', JSON.stringify(CHAIN, undefined, '  ')); 
    // read from transaction, parse into json [], add to end of json, add back  

    let empty = [];
    empty = JSON.parse(fs.readFileSync('transactions.json').toString());
    empty.push(
        {
            sender: client.user?.tag,
            receiver: author?.tag,
            value: value,
            timestamp: new Date (result[0]).toISOString()
        }
    );
    fs.writeFileSync('transactions.json', JSON.stringify(empty));
}

function getTransactions(id: string): number {
    const userwallet = getUserWallet(id);
    let balance = 0; 
    for (let i = 0; i < CHAIN.blocks.length; i++) {
        const block = CHAIN.blocks[i]; 
        if (block.data.sender === block.data.receiver) {
            continue; 
        } else if (block.data.sender === userwallet.publicKey) {
            balance -= block.data.value.amount; 
        } else if (block.data.receiver === userwallet.publicKey) {
            balance += block.data.value.amount; 
        }
    }
    return balance; 
}

function getUserWallet(id: string): Wallet {
    if (id in wallets) {
        return wallets[id]; 
    }
    let current = new Wallet();
    wallets[id] = current; 
    fs.writeFileSync('wallets.json', JSON.stringify(wallets, undefined, '  ')); 
    return current;
}

client.login(process.env.discord_token)