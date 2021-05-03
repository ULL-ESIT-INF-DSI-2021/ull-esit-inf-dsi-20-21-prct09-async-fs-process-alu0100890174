#!/usr/bin/env node
const chalk = require('chalk');
const yargs = require('yargs');
const fs = require('fs');
import {Watcher} from './watcher';

/**
 * main. Función principal:
 *      Modulos FileAnalize y FileAnalizePipe
 *      Módulo yargs 
 *      Módulo chalk
 */
 function main(): void {

    /**
     * Comando watch
     *  --user | -u => Especificar usuario propietario
     *  --rute | -r => Especificar el directorio de las notas
     */
     yargs.command({
        command: 'watch',
        describe: 'Watch a User Directory Notes',
        builder: {
            user: {
                describe: 'User Name',
                demandOption: true,
                type: 'string',
                alias: 'u',
            },
            rute: {
                describe: 'User\'s note rute',
                demandOption: true,
                type: 'string',
                alias: 'r',
            },  
        },
        handler(argv) {
            if (typeof argv.user === 'string' && 
                typeof argv.rute === 'string') {
                    const newWatcher = new Watcher(argv.user, argv.rute);
            } else {
                console.log(chalk.red("ERROR. Missing command."));
            }
        },
     });
     yargs.parse();
 }

 main();

