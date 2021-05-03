#!/usr/bin/env node
const fs = require('fs');
const chalk = require('chalk');

/**
 * class Watcher . Crea una instancia que apunta a un directorio de notas 
 * esperando observar cambios en su contenido.
 * 
 * @param name      Nombre del usuario propietario de las notas
 * @param rute      Ruta donde se alojan las notas del usuario
 */
export class Watcher {
    constructor(
        private name: string, 
        private rute: string
    ) {
        this.watchNote();
    }

    /**
     * watchNote . Función encargada de la funcionalidad principal,
     * utiliza la función asincrona 'watch' de la 'Callback API' de
     * File System de 'Node.js' para monitorizar cambios en un directorio 
     * de notas para un usuario dado.
     * 
     * @returns value -1 => Error.
     */
    watchNote () {
        let check = this.checkDir(this.name, this.rute);
        if (check == false) {
            console.log(chalk.red(
                '\nERROR. That note path doesn\'t exist.\n'));
                return -1;
        } else {
            console.log(chalk.green(`\nWaiting an event to happen...\n`));
            const watcher = fs.watch(`${this.rute}/${this.name}`);
            let event: boolean = false;
            watcher.on('change', (eventType, filename) => {
                switch (eventType) {
                    case 'rename':
                        check = this.checkDir(filename, `${this.rute}/${this.name}`);
                        if (check) {
                            console.log(`Note ${filename} add.`);
                        } else {
                            console.log(`Note ${filename} removed.`);
                        }
                        break;
                    case 'change':
                        console.log(`Note ${filename} modify.`);
                        break;  
                }
                console.log(chalk.green(`\nWaiting an event to happen...\n`));
            });
            return;
        }
    }

    /**
     * Comprueba si un directorio existe utilizando 'accessSync' 
     * función síncrona de la API Syncrona de File System en Node.js.
     * @param name Nombre del usuario.
     * @param rute Nombre de la ruta de notas.
     * @returns True    =>  Existe el directorio del usuario.
     *          False   =>  No existe el directorio del usuario.
     */
    checkDir (name: string, rute: string): boolean {
        try {
            fs.accessSync(`${rute}/${name}`, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }
}