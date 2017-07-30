const fs = require('fs')
const path = require('path')
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

const { ConfigParser } = require('./ConfigParser')
const configParser = new ConfigParser

const questions = [
    {
        property: 'results.path',
        message: 'Where are your test results located? ',
        default: './results',
    },
    {
        property: 'results.formats',
        message: 'What are the formats of your test results? ',
        default: 'xml'
    },
    {
        property: 'remote',
        message: 'What is the URL to your repository? ',
        default: 'https://github.com/host/repository.git'
    },
    {
        property: 'repoPath',
        message: 'Where do you want to place the repository? ',
        default: 'C:/dev/temp_repo'
    },
    {
        property: 'tests.path',
        message: 'Where are your tests located? ',
        default: './tests'
    },
    {
        property: 'tests.formats',
        message: 'What are the formats of your test? ',
        default: 'js'
    },
    {
        property: 'maxFailures',
        message: 'Starting from what amount of failures should the tests be disabled? ',
        default: '3'
    },
]

const answers = {}

const setupConfig = () => ({
    tests: {
        path: answers['tests.path'],
        formats: answers['tests.formats'].split(', ')
    },
    results: {
        path: answers['results.path'],
        formats: answers['results.formats'].split(', ')
    },
    remote: answers['remote'],
    repoPath: answers['repoPath'],
    maxFailures: parseInt(answers['maxFailures'])
})

class ConfigurationHelper {
    constructor() {
        this.overwrite = false
        this.prefix = '\u001b[1;36m'
        this.suffix = '\u001b[0m'
    }

    askQuestions (i) {
        const self = this
        i = i || 0

        rl.question(`${this.prefix}${questions[i].message}${this.suffix}`, function(data) {
            answers[questions[i].property] = data
            if (i !== questions.length - 1) {
                self.askQuestions(++i)
            } else {
                rl.close()
            }
        });

        rl.write(questions[i].default)
    }

    askForOverwrite (question = `${this.prefix}Config file already exists, are you sure you want to overwrite this?\n${this.suffix}`) {
        const self = this

        rl.question(question +
            '[yes]\n' +
            '[no]\n'
            , function (answer) {
            switch (answer) {
            case 'yes':
                self.overwrite = true
                self.askQuestions()
                break;
            case 'no':
                self.overwrite = false
                rl.close()
                return;
            default:
                self.overwrite = false
                self.askForOverwrite('Choice not recognised, please answer yes or no.\n')
            }
        });
    }

    init () {
        const self = this
        const argv = process.argv.slice(2);

        if (argv[0] === 'config') {
            if (fs.existsSync(path.join(__dirname, '../../config.json'))) {
                self.askForOverwrite()
            } else {
                self.askQuestions()
            }

            rl.on('close', function () {
                if (self.overwrite === undefined || self.overwrite === true) {
                    configParser.createConfig(setupConfig())
                }
            });
        }
    }
}
module.exports.ConfigurationHelper = ConfigurationHelper

// function askQuestions(i) {
//     i = i || 0

//     rl.question('\u001b[1;36m' + questions[i].message + '\u001b[0m', data => {
//         answers[questions[i].property] = data
//         if (i !== questions.length - 1) {
//             askQuestions(++i)
//         } else {
//             rl.close()
//         }
//     });

//     rl.write(questions[i].default)
// }

// let overwrite;
// const prefix = '\u001b[1;36m'
// const suffix = '\u001b[0m'
// function askForOverwrite(question = `${prefix}Config file already exists, are you sure you want to overwrite this?\n${suffix}`) {
//     rl.question(question +
//         '[yes]\n' +
//         '[no]\n'
//         , (answer) => {
//         switch (answer) {
//         case 'yes':
//             overwrite = true
//             askQuestions()
//             break;
//         case 'no':
//             overwrite = false
//             rl.close()
//             return;
//         default:
//             overwrite = false
//             askForOverwrite('Choice not recognised, please answer yes or no.\n')
//         }
//     });
// }

// const argv = process.argv.slice(2);

// if (argv[0] === 'config') {
//     if (fs.existsSync(path.join(__dirname, '../../config.json'))) {
//         askForOverwrite()
//     } else {
//         askQuestions()
//     }

//     rl.on('close', () => {
//         if (overwrite === undefined || overwrite === true) {
//             configParser.createConfig(setupConfig())
//         }
//     });
// }