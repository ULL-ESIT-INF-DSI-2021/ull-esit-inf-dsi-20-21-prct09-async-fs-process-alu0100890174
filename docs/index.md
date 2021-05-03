### Ejercicios:

#### Ejercicio 1 


En este ejercicio se nos pide ejecutar la siguiente traza de código:

```ts
import {access, constants, watch} from 'fs';

if (process.argv.length !== 3) {
  console.log('Please, specify a file');
} else {
  const filename = process.argv[2];

  access(filename, constants.F_OK, (err) => {
    if (err) {
      console.log(`File ${filename} does not exist`);
    } else {
      console.log(`Starting to watch file ${filename}`);

      const watcher = watch(process.argv[2]);

      watcher.on('change', () => {
        console.log(`File ${filename} has been modified somehow`);
      });

      console.log(`File ${filename} is no longer watched`);
    }
  });
}
```

y observar en su ejecución el estado de la ```pila de llamadas```, el ```registro de eventos de la API```, la ```cola de manejadores``` de Node.js y la ```Terminal```. 

El programa se encarga de observar los cambios en un fichero, asique para ver su correcta ejecución debemos introducir cambios en el fichero indicado al programa en su ejecución, en este caso ```helloworld.csv```.

La ejecución si ignoramos las llamadas propias de los módulos de cada función y nos limitamos a nuestro programa se resuelve de la siguiente forma: 

***Ejecución***

1. Se inicializa nuestros módulos y nuestro programa. Este se empaqueta dentro de un callback main que entra a la pila.

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | main | -- | -- | -- |


2. Se lee el nombre del fichero en una constante. Se lee en la terminal con ```console.log()``` y entra dentro de la pila ```access()``` de ```fs```.

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | access | -- | -- | -- |
   | main | -- | -- | -- |

3. El programa se resuelve saliendo ```access()``` de la ```pila de llamadas```5. El callback de ```access()``` es recogido dentro de la ```API```.

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | main | access | -- | -- |

4. La llamada al no tener ningún retardo para su manejador pasa directamente a la ```Cola de manejadores``` a la espera de que la ```Pila de llamadas quede vacía```.

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | main | -- | access | -- |

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | -- | -- | access | -- |


5. El manejador de ```access()``` entra dentro de la ```pila de llamadas```.

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | access callback| -- | -- | -- |

6. Se ejecuta el código del manejador de ```access()```. 

   * ```console.log()```.
   * Nueva variable ```watch()``` de ```fs```.
   * Se invoca al proceso hijo ```on``` de ```watch()``` el cual se activa cuando detecta evento, en este caso según un tipo ```change```. el callback de ```watch()``` es recogido por la ```API``` y solo pasará a la ```cola de manejadores```  cuando detecte un cambio en el fichero.
   * Nuevo ```console.log()```.

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | watch.on | -- | -- | -- |
   | access() callback | -- | -- | Starting to watch file helloworld.csv is |
   | "" | "" | "" | File helloworld.csv is no longer watched |


7. La ```Pila de llamadas``` vuelve a vaciarse.

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | access callback | watch.on | -- | -- |

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | -- | watch.on | -- | -- |

8. En este momento nuestro programa sigue en ejecución en otro hilo ejecutando el proceso ```watch.on```, este está observando el fichero ```helloworld.csv``` en busca de modificaciónes. Si modificamos el mismo observaremos como la ```API``` devuelve una orden a la ```Cola de manejadores``` para ejecutar el manejador de ```watch.on```. Este hilo no dejará de ejecutarse hasta que no se cierre el programa.

   Por cada modificación que añadamos al archivo en observación, la ```API``` generará un nuevo manejador para ```watch()```. Modificamos pues ```helloworld.csv```.

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | -- | watch.on | watch.on | -- |

9. La nueva callback pasa a la ```Pila de llamadas``` y se ejecuta su contenido, un ```console.log()```.
   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | watch.on callback | watch.on | -- | File helloworld.csv has been modified somehow |


* El programa permanece activo hasta detectar el próximo cambio o hasta que lo detengamos.

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | -- | watch.on | -- | -- |



### Ejercicio 2:

Para este ejercicio debemos implementar una aplicación que nos permita por medio de parámetros por consola, obtener información relativa a un fichero; número de líneas, número de palabras, número de caracteres. Estos parámetros deben ser:
   * Nombre del fichero
   * Flags: --lines, --words, --chars.

Se nos pide además realizar este ejercicio de dos formas: 
   1. Haciendo uso del método pipe de un Stream para poder redirigir la salida de un comando hacia otro.
   2. Sin hacer uso del método pipe, solamente creando los subprocesos necesarios y registrando manejadores a aquellos eventos necesarios para implementar la funcionalidad solicitada.

##### Implementación

Para implementar este ejercicio he desarrollado 2 clases practicamente identicas con la diferencia de su metodo de filtrado y uso del comando "wc". (pensandolo mejor podría haber desarrollado una clase abstracta de la que partieran ambas, hubiera ahorrado código y respetaría mejor los principios solid).

El archivo ejercicio-2.ts implementa un menú por parametros usando ```yargs``` y ```chalk```.

**main**

```ts
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
```

**Clase FileAnalize**

```ts
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

```

**Clase FileAnalizePipe**

```ts
#!/usr/bin/env node
import * as fs from 'fs';
import {spawn} from 'child_process';
const chalk = require('chalk');

/**
 * Class FileAnalizePipe . Su función es analizar un archivo a través del comando "wc".
 * 
 * @param filename      Ruta y nombre del archivo a analizar.
 * @param error         Si el programa falla, se pone en "True".
 * @param arguments[]   Contiene los parámetros para el comando "wc":
 *     - "--line" => Numero de líneas
 *     - "--words" => Número de palabras
 *     - "--chars" => Número de caracteres
 */
export class FileAnalizePipe {
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
     * fileInfo . Se encarga de tratar la información recibida por el comando "cat" que ha trabajado como intermediario para
     * volcar la información de un archivo sobre el comando "wc" a través de su subproceso pipe heredado de "child-proccess".
     * su salida para a una variable que pasará a mostrarse por pantalla en el momento que se termine el proceso.
     * 
     * @param argument Flag que utilizará "wc" para tratar la información recibida por cat del archivo.
     */
    fileInfo ( argument: string ): void {
        fs.access(this.filename, fs.constants.F_OK, (err) => {
            if ((err) && (!this.error)){
                console.log(chalk.red(`File ${this.filename} does not exist.`));
                this.error = true;
                return;
            } else if (!this.error){
                let cat = spawn('cat', [this.filename]);
                let wc = spawn('wc', [argument]);
                cat.stdout.pipe(wc.stdin);
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
```

#### Ejecución 

**Tests:**

```bash
 Testing "FileAnalize Class"

    ✓ newFileAnalize is created successfully
File helloworld.txt has 3 words.
File helloworld.txt has 3 lines.
File helloworld.txt has 67 characters.

    ✓ newFileAnalize is not created successfully
At least, a file analyze and a command must be specified

    ✓ newFileAnalize is not created successfully
File helloworld.tt does not exist.

    ✓ newFileAnalize is an instance of FileAnalize Class
File helloworld.txt has 3 words.
File helloworld.txt has 3 lines.

  Testing "FileAnalizePipe Class"

    ✓ newFileAnalizePipe is created successfully 1
File helloworld.txt has 67 characters.
File helloworld.txt has 3 words.
File helloworld.txt has 3 lines.

    ✓ newFileAnalize is not created successfully
At least, a file analyze and a command must be specified

    ✓ newFileAnalize is not created successfully
File helloworld.tt does not exist.

    ✓ newFileAnalize is an instance of FileAnalizePipe Class
File helloworld.txt has 3 words.
File helloworld.txt has 3 lines.

  8 passing (278ms)
```

**Terminal:**

```bash
[~/ull-esit-inf-dsi-20-21-prct09-async-fs-process-alu0100890174(main)]$ node dist/ejercicio-2/ejercicio-2.js analize -f "./helloworld.txt" -alwm
File ./helloworld.txt has 3 words.
File ./helloworld.txt has 3 lines.
File ./helloworld.txt has 67 characters.

[~/ull-esit-inf-dsi-20-21-prct09-async-fs-process-alu0100890174(main)]$ node dist/ejercicio-2/ejercicio-2.js analize -f "./helloworld.txt" -al
File ./helloworld.txt has 3 lines.

[~/ull-esit-inf-dsi-20-21-prct09-async-fs-process-alu0100890174(main)]$ node dist/ejercicio-2/ejercicio-2.js analize -f "./helloworld.txt" -a "pipe" -wm
File ./helloworld.txt has 67 characters.
File ./helloworld.txt has 3 words.
```

### Ejercicio 3:

A partir de la práctica desarrollada anteriormente (Práctica 8), se nos pide implementar una nueva aplicación que nos permita monitorear las notas de un usuario, para ello utilizaremos la función ```watch``` de la API Callback de Fil System en Node.js.

No tenemos que modificar en absoluto dicha previa práctica, debemos pasar por parametros a la consola del programa el usuario y la ruta de su directorio de notas, con esta información nuestro programa será capaz de permanecer a la escucha de una modificación dentro del repositorio de notas.

##### Implementación

Para implementar el ejercicio he implementado una ```clase watcher``` que implementa la funcionalidad principal del ejercicio y un ```menú yargs``` que permite al usuario inicializar el programa y pasarle los parámetros a watcher.


**Clase Watcher**

```ts
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
```

**Main**

```ts
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
```

#### Ejecución 

**Tests:**

```bash
  Testing "Watcher Class"

Waiting an event to happen...

    ✓ newWatcher is created successfully

Waiting an event to happen...

    ✓ newWatcher is an instance of Note Class

ERROR. That note path doesn't exist.


ERROR. That note path doesn't exist.

    ✓ newWatcher is not created successfully

ERROR. That note path doesn't exist.


ERROR. That note path doesn't exist.

    ✓ newWatcher is not created successfully


  4 passing (278ms)
```

**Terminal:**

Terminal de la Aplicación Watcher:

```bash
[~/ull-esit-inf-dsi-20-21-prct09-async-fs-process-alu0100890174(main)]$ node dist/ejercicio-3/ejercicio-3.js watch -u "Yoda" -r "./Notes"

Waiting an event to happen...

Note StarWars3.json removed.

Waiting an event to happen...

Note StarWars3.json add.

Waiting an event to happen...

Note StarWars3.json modify.

Waiting an event to happen...

Note StarWars3.json modify.

Waiting an event to happen...

Note StarWars3.json modify.

Waiting an event to happen...

```

Terminal de la Aplicación noteApp: 

```bash
[~/ull-esit-inf-dsi-20-21-prct09-async-fs-process-alu0100890174(main)]$ node dist/ejercicio-3/noteApp.js remove -u "Yoda" -t "StarWars3"

Note removed.
[~/ull-esit-inf-dsi-20-21-prct09-async-fs-process-alu0100890174(main)]$ node dist/ejercicio-3/noteApp.js add -u "Yoda" -t "StarWars3" -b "Hello padawan" -c "green"

New note added.
[~/ull-esit-inf-dsi-20-21-prct09-async-fs-process-alu0100890174(main)]$ node dist/ejercicio-3/noteApp.js modify -u "Yoda" -t "StarWars3" -b "Goodbye padawann" -c "green"

The note has been modify successfuly
```

(Debido a la forma en la que trabaja la función fs.writeFileSync para crear un archivo y escribirlo, vemos como el Watcher detecta varios cambios en la ejecución de un solo comando en noteApp).