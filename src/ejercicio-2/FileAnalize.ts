#!/usr/bin/env node
import * as fs from 'fs';
import {spawn} from 'child_process';
const chalk = require('chalk');

/**
 * Class FileAnalize . Su función es analizar un archivo a través del comando "wc".
 * 
 * @param filename      Ruta y nombre del archivo a analizar.
 * @param error         Si el programa falla, se pone en "True".
 * @param arguments[]   Contiene los parámetros para el comando "wc":
 *     - "--line" => Numero de líneas
 *     - "--words" => Número de palabras
 *     - "--chars" => Número de caracteres
 */
export class FileAnalize {
    private arguments: string[];
    private _error: boolean = true;

    constructor (
        private filename: string,
        ...argument: string[]
    ) {
        this.arguments = argument;
        this.error = this.fileCheck();
        if (!this.error) {
            argument.forEach((arg) => {
                this.fileInfo(arg);
            });
        }
    }

    /**
     * fileCheck . Comprueba si la lectura del archivo puede ejecutarse de forma correcta:
     *      - Comprueba si se puede acceder a él.
     *      - Comprueba si el número de facilitados es correcto.
     */
    fileCheck ( ): boolean {
        if ((this.arguments.length < 1) || (this.arguments.length > 3)) {
            console.log(chalk.red('At least, a file analyze and a command must be specified'));
            return true;
        } else {
            return false;
        }
    }

    /**
     * fileInfo . Se encarga de tratar la información del archivo, recibe el nombre y el flag para "wc"
     * y a través de su proceso child-process envia su salida a una variable que pasará a mostrarse por pantalla
     * en el momento que se termine el proceso.
     * 
     * @param argument Flag que utilizará "wc" para tratar la información recibida del archivo.
     */
    fileInfo ( argument: string ) {
        fs.access(this.filename, fs.constants.F_OK, (err) => {
            if ((err) && (!this.error)){
                console.log(chalk.red(`File ${this.filename} does not exist.`));
                this.error = true;
                return;
            } else if (!this.error){
                let wc = spawn('wc', [argument, this.filename]);
                let info = '';
                wc.stdout.on('data', (output) => {
                    info += output;
                });
                wc.on('close', () => {
                    let infoArray = info.split(/\s+/);
                    switch (argument) {
                        case ('-l' || '--lines'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` lines.`);
                            break;
                        case ('-w' || '--words'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` words.`);
                            break;
                        case ('-m' || '--chars'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` characters.`);
                            break;
                    }
                });
            }
        });
    }

    public get error(): boolean {
        return this._error;
    }
    public set error(value: boolean) {
        this._error = value;
    }
}
