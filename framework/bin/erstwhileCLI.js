#!/usr/bin/env node
const { exit } = require('process');
require('dotenv').config();
const ejs = require('ejs');
const chalk = require('chalk');
const axios = require('axios');

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
    console.log("Building Models...")
    if(!process.env.ERSTWHILE_API_URL) {
      console.log("Environment variable ERSTWHILE_API_URL missing. This should point to the URL of the server.")
    } else if(!process.env.ERSTWHILE_API_DESCRIPTION_PATH) {
      console.log("Environment variable ERSTWHILE_API_DESCRIPTION_PATH missing. This is the path to the API description, typically /describe.")
    } else {
      // let's grab  the config
      axios.get(`${process.env.ERSTWHILE_API_URL}${process.env.ERSTWHILE_API_DESCRIPTION_PATH}`)
      .then(function (apiResponse) {
        console.log("success", apiResponse)
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
    }
  }
}