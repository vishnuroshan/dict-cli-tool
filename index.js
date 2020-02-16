#!/usr/bin/env node

/* eslint-disable multiline-ternary */
/* eslint-disable no-ternary */
/* eslint-disable object-curly-spacing */
/* eslint-disable sort-keys */
/* eslint-disable init-declarations */
/* eslint-disable no-undef */
/* eslint-disable curly */

require('dotenv').config();
const chalk = require('chalk');
const log = console.log;
const CONFIG = require('./constants');
if (!CONFIG.KEY || !CONFIG.URL) {
    log(chalk.bold.redBright('Missing configuration file. please read readme.md to configure .env file'))
    process.exit(0);
}
const RANDOM = `${CONFIG.URL}/words/randomWord?api_key=${CONFIG.KEY}`;
const fetch = require('node-fetch');
const inquirer = require('inquirer');


/**
 * get dictionary definitions for `word`
 * @param {string} word
 * @param {boolean} [noPrint] wether to print to console or not. default value is `false`
 */

async function getWordDefinitions(word, noPrint = false) {
    let info = await fetch(`${CONFIG.URL}/word/${word}/definitions?api_key=${CONFIG.KEY}`);
    const result = await info.json();
    if (!noPrint) {
        log(chalk.redBright.bold('-----------definition(s)------------'));
        for (let index in result) log(chalk.greenBright(`(${parseInt(index) + 1})\t ${result[index].text}\n`))
        log(chalk.redBright.bold('-----------definition(s)------------'));
    }

    return result[0].text;
}

/**
 * get dictionary examples for `word`
 * @param {string} word
 */

async function getWordExamples(word) {
    let info = await fetch(`${CONFIG.URL}/word/${word}/examples?api_key=${CONFIG.KEY}`);
    const result = await info.json();
    log(chalk.redBright.bold('-----------example(s)------------'));
    const examples = result.examples;
    for (let index in examples) log(chalk.greenBright(`(${parseInt(index) + 1})\n${examples[index].text}\n`))
    log(chalk.redBright.bold('-----------example(s)------------'));
}

/**
 * get synonyms or antonyms based on the parameter `type`.
 * @param {string} word
 * @param {string} type It accepts 2 words, `antonym` or `synonym`
 * @param {boolean} [noPrint] wether to print to console or not. default value is `false`
 */

async function getWordRelatedWords(word, type, noPrint = false) {
    log('')
    let info = await fetch(`${CONFIG.URL}/word/${word}/relatedWords?api_key=${CONFIG.KEY}`);
    const data = await info.json();
    let res;
    try {
        for (let datum of data) if (datum.relationshipType === type) res = datum.words;
    } catch (err) {
        log(err.message);
    }
    if (res) {
        if (!noPrint) {
            log(chalk.redBright.bold(`-----------${type}(s)------------`));
            for (let index in res) log(chalk.greenBright(`(${parseInt(index) + 1})\t ${res[index]}\n`))
            log(chalk.redBright.bold(`-----------${type}(s)------------`));
        }

        return res;
    }
    log(chalk.yellow(`no ${type} found`));

    return false;
}

/**
 * get random word from dictionary
 * @param {boolean} [noPrint] wether to print to console or not. default value is `false`
 */

async function getRandomWord(noPrint = false) {
    let info = await fetch(RANDOM);
    const { word } = await info.json();
    if (!noPrint) log(chalk.yellowBright(`Random word of this request: ${word}`))
    const definition = await getWordDefinitions(word, noPrint);
    if (!noPrint) await getWordExamples(word);
    const synonym = await getWordRelatedWords(word, 'synonym', noPrint);
    const antonym = await getWordRelatedWords(word, 'antonym', noPrint);

    return {
        word,
        definition,
        synonym,
        antonym
    };
}

/**
 * prompt answers recursively (3 retrys) until right answer is given
 */

async function promptForAnswer(synonym, word, count = 3) {
    if (count >= 1) {
        const { answer } = await inquirer.prompt([
            {
                'type': 'input',
                'name': 'answer',
                'message': 'Guess the word??',
                'default': ''
            }
        ]);
        // eslint-disable-next-line no-mixed-operators
        if (answer && answer !== synonym[0] && synonym.indexOf(answer) > -1 || answer === word) {
            log(chalk.magenta.bold(`You won this round!!... The word is ${word}`));
            process.exit(0);
        } else {
            await promptForAnswer(synonym, word, count - 1);
        }
    }
    log('You lost!. Better luck next time!!...');
    process.exit(0);
}

/**
 * launch the game if user selects **yes**
 */

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
    log(word);
    await promptForAnswer(synonym, word);
}

/**
 * main function to invoke dictionary
 */

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
        } else {
            await getWordDefinitions(word);
            await getWordExamples(word);
            await getWordRelatedWords(word, 'synonym');
            await getWordRelatedWords(word, 'antonym');
        }
    } else {
        await getRandomWord();
    }
    console.log('option is:> ', option, ' ||word is:> ', word);
}
// starting point
dict();

