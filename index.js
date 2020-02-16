#!/usr/bin/env node

const URL = 'https://fourtytwowords.herokuapp.com';
const KEY = 'b972c7ca44dda72a5b482052b1f5e13470e01477f3fb97c85d5313b3c112627073481104fec2fb1a0cc9d84c2212474c0cbe7d8e59d7b95c7cb32a1133f778abd1857bf934ba06647fda4f59e878d164';
const RANDOM = `${URL}/words/randomWord?api_key=${KEY}`;
const fetch = require('node-fetch');
const chalk = require('chalk');
const log = console.log;

function getWordDefinitionsUrl(word) {
    return `${URL}/word/${word}/definitions?api_key=${KEY}`;
}

function getWordExamplesUrl(word) {
    return `${URL}/word/${word}/examples?api_key=${KEY}`;
}

function getWordRelatedWordsUrl(word) {
    return `${URL}/word/${word}/relatedWords?api_key=${KEY}`;
}

async function dict() {
    let option = '';
    let word = '';
    if (process.argv[3]) {
        option = process.argv[2];
        word = process.argv[3];
        switch (option) {
            case 'defn':
            case 'DEFN': {
                // log(chalk.blue('definitions\n'), getWordDefinitionsUrl(word));

                // let info = await fetch(getWordDefinitionsUrl(word));
                // const result = await info.json();

                // log(result);
                break;
            }
            case 'SYN':
            case 'syn': {
                console.log('synonyms\n');
                break;
            }
            case 'ANT':
            case 'ant': {
                console.log('antonyms');
                break;
            }
            case 'EX':
            case 'ex': {
                let info = await fetch(getWordExamplesUrl(word));
                const result = await info.json();
                log(chalk.redBright.bgGreenBright(`examples for \n${word}\n`));
                for (let index in result.examples) {
                    log(chalk.greenBright(`(${parseInt(index) + 1})\n${result.examples[index].text}\n`))
                }
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
    console.log('option is:> ', option, 'word is:> ', word);
}

dict();

