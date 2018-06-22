process.env.NODE_ENV = 'development';
process.env.PUBLIC_URL = '';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({silent: true});

const argv = process.argv.slice(2);

// TODO: Work in progress... jsdoc2md doesn't seem to output everything.
// For now, running jsdoc2md on a file by file basis and linking to 
// each in SUMMARY.md for Gitbook.

// const exec = require('child_process').exec;
// const cmd = 'jsdoc2md --configure jsdoc.json --files src/**/*.js > docs/api.md';
// const child = exec(cmd,
//     (error, stdout, stderr) => {
//         console.log(`stdout: ${stdout}`);
//         console.log(`stderr: ${stderr}`);
//         if (error !== null) {
//             console.log(`exec error: ${error}`);
//         }
// });