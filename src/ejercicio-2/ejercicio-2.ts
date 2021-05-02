#!/usr/bin/env node
const chalk = require('chalk');
const yargs = require('yargs');
const fs = require('fs');
import {FileAnalize} from './FileAnalize';
import {FileAnalizePipe} from './FileAnalizePipe';

/**
 * main. Función principal:
 *      Modulos FileAnalize y FileAnalizePipe
 *      Módulo yargs 
 *      Módulo chalk
 */
function main(): void {
    /**
     * Comando Analize
     *  --file | -f => Especificar ruta del archivo a analizar
     *  --method | -a => Especificar metodo a utilizar ( " " | "pipe" ) 
     *  --line | -l => Contar número de líneas ( OPCIONAL )
     *  --world | -w => Contar número de letras ( OPCIONAL )
     *  --character | -m => Contar número de caracteres ( OPCIONAL )
     *     * Debes elegir almenos un opcional.
     */
    yargs.command({
        command: 'analize',
        describe: 'Analize a File',
        builder: {
            file: {
                describe: 'File route',
                demandOption: true,
                type: 'string',
                alias: 'f',
            },
            method: {
                describe: 'Analize method',
                demandOption: true,
                type: 'string',
                alias: 'a',
            },
            lines: {
                describe: 'Number of lines of the File',
                demandOption: false,
                type: 'string',
                alias: 'l',
            },
            words: {
                describe: 'Number of words of the File',
                demandOption: false,
                type: 'string',
                alias: 'w',
            },
            chars: {
                describe: 'Number of characters of the File',
                demandOption: false,
                type: 'string',
                alias: 'm',
            },
        },
        handler(argv) {
            if ((typeof argv.file === 'string') && (typeof argv.method === 'string')) {
                let arg: string[] = []
                if (typeof argv.lines === 'string'){
                    arg.push('-l');
                }
                if (typeof argv.words === 'string'){
                    arg.push('-w');
                }
                if (typeof argv.chars === 'string'){
                    arg.push('-m');
                }
                if (argv.method == "pipe") {
                    const file = new FileAnalizePipe(argv.file, ...arg);
                } else {
                    const file = new FileAnalize(argv.file, ...arg);
                }
            } else {
                console.log(chalk.red("ERROR. Missing parameter."));
            }
        },
    });
    yargs.parse();
}

main();