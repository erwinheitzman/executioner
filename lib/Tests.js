const fs = require('fs')
const Files = require('./Files').Files
const files = new Files
const Results = require('./Results').Results
const results = new Results
const ConfigParser = require('./utils/ConfigParser').ConfigParser
const configParser = new ConfigParser

configParser.config = 'rapid.json'
const { testsPath } = configParser.config

module.exports.Tests = class {
    get () {
        return files.get(testsPath, ['js'], true)
    }

    disable () {
        results.process()
        
        this.get().forEach(file => {
            fs.readFile(file, 'utf8', (err, data) => {
                let newData = false
                if (err) throw err

                for (const test in results.failedTests) {

                    // Matches (arrow) function(s) declaration/expression(s) with and without parameters/values
                    const regex = new RegExp('(it|test)(\\([\'|"]' + test + '[\'|"],\\s?' +
                        '(?:function\\s?\\((?:[\'|"]?\\w+)?[\'|"]?\\)\\s?{' + '|' +
                        '\\w+\\);?' + '|' +
                        '\\(?(?:[\'|"]?\\w+)?[\'|"]?\\)?\\s?=>\\s?{?))', 'g')
                    
                    if (results.failedTests[test].failed >= 3) {
                        if (data.match(regex)) {
                            data = data.replace(regex, '$1.skip$2')
                            newData = true;
                        }
                    }
                }

                if (newData) {
                    fs.writeFile(file, data, 'utf8', err => {
                        if (err) throw err
                    })
                }
            })
        })
    }
}