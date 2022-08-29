const {
    execSync
} = require('child_process');
const fs = require("fs");

const main = async () => {
    try {
        const config = require('./config.json')
        await compileAll(config);
    }
    catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            console.error("Error loading config.json")
            throw e;
        }
        else {
            console.error(e) 
        }
    }
}

const compileAll = async (config) => {
    /*
      Re-compiles all the files.
      ?Can change to compile only changed files
    */
    const output = execSync('npm run docs', {
        encoding: 'utf-8'
    });
    let compiledContents = require('./_docs/contents.json');
    compiledContents = compiledContents.contents;

    const date = new Date(); //? Use the same date for all files compiled in the same batch

    for (let i = 0; i < compiledContents.length; i++) {
        // get proper md file. we will need it's meta info
        let currentPostText = (fs.readFileSync(`./docs/${compiledContents[i].path}`));
        currentPostText = currentPostText.toString();

        let objToAppend = {}

        if (config.posts && config.posts[i]) { // Already have some post information
            objToAppend.filename = compiledContents[i].url;
            objToAppend.id = compiledContents[i].id;
            objToAppend.date = {}
            objToAppend.date.UTCDate = (config.posts[i].date.UTCDate ? config.posts[i].date.UTCDate : Date.now());
            objToAppend.date.dateString = (config.posts[i].date.dateString ? config.posts[i].date.dateString : Date);
            objToAppend.date.monthDayYear = (config.posts[i].date.monthDayYear ? config.posts[i].date.monthDayYear : [date.getMonth(), date.getDate(), date.getFullYear()]);

        } else { // we have to add the post from 0
            objToAppend.filename = compiledContents[i].url;
            objToAppend.id = compiledContents[i].id;
            objToAppend.date = {}
            objToAppend.date.UTCDate = date.getUTCDate();
            objToAppend.date.dateString = date.toString();
            objToAppend.date.monthDayYear = [date.getMonth(), date.getDate(), date.getFullYear()];
        }
        // add the user-decided meta data
        try {
            const postMetaInfo = await JSON.parse(currentPostText.substring(currentPostText.indexOf('{'), currentPostText.indexOf('}') + 1)) // cut out the JSON_text meta information
            function isValidWordData(object) {
                const valid = RegExp(/^[\w !-]*$/)
                let validTitle = object.title.match(valid) != null
                let validAuthor = object.author.match(valid) != null
                let validTags = true
                for (tag of object.tags) {
                    const arr = tag.match(valid)
                    validTags = validTags && arr != null
                }
                return validTags && validAuthor && validTitle
            }
            if (isValidWordData(postMetaInfo)) {
                objToAppend.title = postMetaInfo.title;
                objToAppend.author = postMetaInfo.author;
                objToAppend.tags = postMetaInfo.tags;
            } else {
                throw "Invalid name - only letter, numbers, underscores, spaces, ! and - allowed"
            }
        } catch (error) {
            console.error('It is likely that the meta information for ' + objToAppend.filename + 
            ' has not been properly formatted, please look at our templates/metaTagtemplate.md and try again!');
            console.error(error);
            objToAppend.title = "None"
            objToAppend.author = "None"
            objToAppend.tags = []
        }

        // add or replace the current data to config
        if (config.posts && config.posts[i]) {
            config.posts[i] = objToAppend;
        } else {
            config.posts.push(objToAppend);
        }

    }

    // console.log(config);
    // save to file
    fs.writeFile('config.json', JSON.stringify(config), (err) => {
        if (err) console.error(err);
        console.log('Successfully compiled!');
    });

}

main();