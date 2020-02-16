#!/usr/bin/env node

/* eslint-disable init-declarations */
/* eslint-disable no-undef */
/* eslint-disable curly */

const URL = 'https://fourtytwowords.herokuapp.com';
const KEY = 'b972c7ca44dda72a5b482052b1f5e13470e01477f3fb97c85d5313b3c112627073481104fec2fb1a0cc9d84c2212474c0cbe7d8e59d7b95c7cb32a1133f778abd1857bf934ba06647fda4f59e878d164';
const RANDOM = `${URL}/words/randomWord?api_key=${KEY}`;
const fetch = require('node-fetch');
const chalk = require('chalk');
const log = console.log;

async function getWordDefinitions(word) {
    let info = await fetch(`${URL}/word/${word}/definitions?api_key=${KEY}`);
    const result = await info.json();
    log(chalk.redBright('-----------definition(s)------------'));
    for (let index in result) log(chalk.greenBright(`(${parseInt(index) + 1})\t ${result[index].text}\n`))
    log(chalk.redBright('-----------definition(s)------------'));
}

async function getWordExamples(word) {
    let info = await fetch(`${URL}/word/${word}/examples?api_key=${KEY}`);
    const result = await info.json();
    log(chalk.redBright('-----------example(s)------------'));
    const examples = result.examples;
    for (let index in examples) log(chalk.greenBright(`(${parseInt(index) + 1})\n${examples[index].text}\n`))
    log(chalk.redBright('-----------example(s)------------'));
}

async function getWordRelatedWords(word, type) {
    let info = await fetch(`${URL}/word/${word}/relatedWords?api_key=${KEY}`);
    const data = await info.json();
    log(chalk.redBright(`-----------${type}s------------`));
    let res;
    for (let datum of data) if (datum.relationshipType === type) res = datum.words;
    for (let index in res) log(chalk.greenBright(`(${parseInt(index) + 1})\t ${res[index]}\n`))
    log(chalk.redBright(`-----------${type}s------------`));
}

async function dict() {
    let option = '';
    let word = '';
    if (process.argv[3]) {
        option = process.argv[2];
        word = process.argv[3];
        switch (option) {
            case 'DEFN':
            case 'defn': {
                await getWordDefinitions(word);
                break;
            }
            case 'SYN':
            case 'syn': {
                await getWordRelatedWords(word, 'synonym');
                break;
            }
            case 'ANT':
            case 'ant': {
                await getWordRelatedWords(word, 'antonym');
                break;
            }
            case 'EX':
            case 'ex': {
                await getWordExamples(word);
                break;
            }
            default: {
                console.log('no valid option given');
            }
        }
    } else if (process.argv[2]) {
        word = process.argv[2];
        if (word === 'play') {
            console.log('word game!!');
        }
    } else {
        // random word all
        console.log('ramdom word all things...');
        console.log(RANDOM);
    }
    console.log('option is:> ', option, ' ||word is:> ', word);
}

dict();

