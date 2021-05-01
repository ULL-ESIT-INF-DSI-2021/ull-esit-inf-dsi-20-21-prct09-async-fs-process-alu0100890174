### Ejercicio 1:

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

3. El programa se resuelve saliendo ```access()``` y ```main()``` de la ```pila de llamadas``` en ese orden. El callback de ```access()``` es recogido dentro de la ```API```.

   | Call Stack | Web API | Node.js Queue | Terminal |
   | -- | -- | -- | -- |
   | main | access | -- | -- |

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