#!/usr/bin/env node

/* eslint-disable multiline-ternary */
/* eslint-disable no-ternary */
/* eslint-disable object-curly-spacing */
/* eslint-disable sort-keys */
/* eslint-disable init-declarations */
/* eslint-disable no-undef */
/* eslint-disable curly */

const URL = 'https://fourtytwowords.herokuapp.com';
const KEY = 'b972c7ca44dda72a5b482052b1f5e13470e01477f3fb97c85d5313b3c112627073481104fec2fb1a0cc9d84c2212474c0cbe7d8e59d7b95c7cb32a1133f778abd1857bf934ba06647fda4f59e878d164';
const RANDOM = `${URL}/words/randomWord?api_key=${KEY}`;
const fetch = require('node-fetch');
const inquirer = require('inquirer');
const chalk = require('chalk');
const log = console.log;

/**
 * get dictionary definitions
 * @param {string} word
 */

async function getWordDefinitions(word, noPrint = false) {
    let info = await fetch(`${URL}/word/${word}/definitions?api_key=${KEY}`);
    const result = await info.json();
    if (!noPrint) {
        log(chalk.redBright.bold('-----------definition(s)------------'));
        for (let index in result) log(chalk.greenBright(`(${parseInt(index) + 1})\t ${result[index].text}\n`))
        log(chalk.redBright.bold('-----------definition(s)------------'));
    }

    return result[0].text;
}

/**
 * get dictionary examples
 * @param {string} word
 */

async function getWordExamples(word) {
    let info = await fetch(`${URL}/word/${word}/examples?api_key=${KEY}`);
    const result = await info.json();
    log(chalk.redBright.bold('-----------example(s)------------'));
    const examples = result.examples;
    for (let index in examples) log(chalk.greenBright(`(${parseInt(index) + 1})\n${examples[index].text}\n`))
    log(chalk.redBright.bold('-----------example(s)------------'));
}


/**
 * get dictionary definitions
 * @param {string} word
 * @param {string} type
 */

async function getWordRelatedWords(word, type, noPrint = false) {
    log('')
    let info = await fetch(`${URL}/word/${word}/relatedWords?api_key=${KEY}`);
    const data = await info.json();
    let res;
    try {
        for (let datum of data) if (datum.relationshipType === type) res = datum.words;
    } catch (err) {
        log(err.message);
    }
    if (res) {
        if (!noPrint) {
            log(chalk.redBright.bold(`------antonym-----${type}s------------`));
            for (let index in res) log(chalk.greenBright(`(${parseInt(index) + 1})\t ${res[index]}\n`))
            log(chalk.redBright.bold(`-----------${type}s------------`));
        }

        return res;
    }
    log(chalk.yellow(`no ${type} found`));

    return false;
}

async function getRandomWord(noPrint = false) {
    let info = await fetch(RANDOM);
    const result = await info.json();
    if (!noPrint) log(chalk.yellowBright(`Random word of this request: ${result.word}`))
    const definition = await getWordDefinitions(result.word, noPrint);
    if (!noPrint) await getWordExamples(result.word);
    const synonym = await getWordRelatedWords(result.word, 'synonym', noPrint);
    const antonym = await getWordRelatedWords(result.word, 'antonym', noPrint);

    return {
        'word': result.word,
        definition,
        synonym,
        antonym
    };
}

async function launchGame() {
    const { word, definition, synonym, antonym } = await getRandomWord(true);
    log(
        chalk.redBright.bold('Definition: '),
        chalk.blueBright(`\n${definition}\n\n`),
        chalk.redBright.bold('Synonym: '),
        chalk.blueBright(`\n${synonym[0]}\n\n`),
        chalk.redBright.bold('Antonym: '),
        antonym ? chalk.blueBright(`\n${antonym[0]}\n\n`) : '**no antonyms found**'
    );
    const { answer } = await inquirer.prompt([
        {
            'type': 'input',
            'name': 'answer',
            'message': 'Guess the word??',
            'default': ''
        }
    ]);
    if (answer !== synonym[0] && synonym.indexOf(answer) > -1) {
        log(chalk.magenta.bold(`You won this round!!... The word is ${word}`));
    }


}
async function dict() {
    let option = '';
    let word = '';
    if (process.argv[3]) {
        option = process.argv[2];
        word = process.argv[3];
        switch (option) {
            case 'DEFN':
            case 'defn':
                await getWordDefinitions(word);
                break;
            case 'SYN':
            case 'syn':
                await getWordRelatedWords(word, 'synonym');
                break;
            case 'ANT':
            case 'ant':
                await getWordRelatedWords(word, 'antonym');
                break;
            case 'EX':
            case 'ex':
                await getWordExamples(word);
                break;
            default: log(chalk.yellowBright('no valid option given'));
        }
    } else if (process.argv[2]) {
        word = process.argv[2];
        if (word === 'play') {
            console.log('word game!');
            const answer = await inquirer.prompt([
                {
                    'type': 'confirm',
                    'name': 'game',
                    'message': 'Shall we start the game?',
                    'default': false
                }
            ]);
            if (answer.game === true) await launchGame();
        }
    } else {
        await getRandomWord();
    }
    console.log('option is:> ', option, ' ||word is:> ', word);
}

dict();

