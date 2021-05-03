#!/usr/bin/env node

/**
 * enumerable para colores {azul, rojo, amarillo y verde}
 */
export enum color {blue, red, yellow, green}
type Color = color;

/**
 * Interfaz que debe implementar nuestra clase Note.
 * @param title Titulo de la nota
 * @param body Contenido de la nota
 * @param colorType Color que tendrá la nota
 */
interface NoteStructure {
    title: string;
    body: string;
    colorType: color;
}

/**
 * Class Note . Implementa la Interfaz NoteStructure; 
 * representa una nota       
 * @param color String con el valor del color
 * @param title String con el nombre de la nota
 * @param body  String con el contenido de la nota
 * @param colorType Color Type con enumerable color
 *      { blue=0, red=1, yellow=2, green=3}
 */
export class Note implements NoteStructure {
    public colorType: color;
    constructor(
        public title: string,
        public body: string,
        public color: string = 'blue') {
            switch (color) {
                case 'blue':
                    let blue: Color = 0;
                    this.colorType = blue;
                    break;
                case 'red':
                    let red: Color = 1;
                    this.colorType = red;
                    break;
                case 'yellow':
                    let yellow: Color = 2;
                    this.colorType = yellow;
                    break;                
                case 'green':
                    let green: Color = 3;
                    this.colorType = green;
                    break;
            }
    }
}