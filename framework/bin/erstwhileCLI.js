#!/usr/bin/env node
const { exit } = require('process');
require('dotenv').config();
const ejs = require('ejs');
const chalk = require('chalk');
const { buildApplication, buildModels, buildStyles } = require("../static/ErstwhileCompiler")

const { theme } = require('../../app/config/app');

/**
 * This is the command matrix for Erstwhile
 */
const arguments = process.argv.slice(2);
const argumentMatrix = {
    "build": {
        "subcommands": {
            "models": {
              "requiresSubcommands": false,
              "description": "This subcommand attempts to connect to an Erstwhile-compatible server and build out the Models."
            },
            "application": {
              "requiresSubcommands": false,
              "description": "This subcommand creates the working directory needed for compilation of the application."
            },
            "styles": {
              "requiresSubcommands": false,
              "description": "This subcommand creates stylesheets for the application."
            }
        },
        "description": `This command outputs files into the project structure.`,
        "requiresSubcommands": true
    }
}

let primaryCommand = false;
let subCommand = false;

console.log("\n" +chalk.green("Erstwhile CLI"))
if(arguments.length == 0) {
    console.log("Like any good function, we need some arguments!\n\nUsage:");
    for(let command in argumentMatrix) {
        console.log(`${command}: ${argumentMatrix[command].description}`)
    }
    console.log('')
    process.exit()
} else {
  primaryCommand = arguments[0];
  if(arguments.length == 1 && argumentMatrix[primaryCommand].requiresSubcommands) {
    console.log(`The "${primaryCommand}" command needs a little more.\n\nUsage:`);
    for(let command in argumentMatrix[primaryCommand].subcommands) {
      console.log(`${primaryCommand} ${command}: ${argumentMatrix[primaryCommand].subcommands[command].description}`)
    }
    console.log('');
    process.exit()
  } else if(arguments.length >1) {
    subCommand = arguments[1];
  } 
}

/**
 * Let's get going!
 */
if(primaryCommand == 'build') {
  if(subCommand == "models") {
    buildModels();
  } else if(subCommand == "styles") {
    buildStyles();
  } else if(subCommand == "application") {
    buildApplication();
  }
}