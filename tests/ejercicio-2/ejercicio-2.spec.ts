import 'mocha';
import {expect} from 'chai';
import {FileAnalize} from '../../src/ejercicio-2/FileAnalize';
import {FileAnalizePipe} from '../../src/ejercicio-2/FileAnalizePipe';

describe('Testing "FileAnalize Class"', () => {
    it('newFileAnalize is created successfully 1', () => {
        expect(new FileAnalize("helloworld.txt", "-l", "-w", "-m")).not.to.be.null;
    });
    it('newFileAnalize is not created successfully', () => {
        expect(new FileAnalize("helloworld.txt").error).to.equal(true);
    });
    it('newFileAnalize is not created successfully', () => {
        expect(new FileAnalize("helloworld.tt", "-l", "-w", "-m").error).to.be.equal(false);
    });
    it('newFileAnalize is an instance of Note Class', () => {
        const newFileAnalize = new FileAnalize("helloworld.txt", "-l", "-w", "-m");
        expect(newFileAnalize).to.be.instanceOf(FileAnalize);
    });
});

describe('Testing "FileAnalizePipe Class"', () => {
    it('newFileAnalizePipe is created successfully 1', () => {
        expect(new FileAnalizePipe("helloworld.txt", "-l", "-w", "-m")).not.to.be.null;
    });
    it('newFileAnalize is not created successfully', () => {
        expect(new FileAnalizePipe("helloworld.txt").error).to.equal(true);
    });
    it('newFileAnalize is not created successfully', () => {
        expect(new FileAnalizePipe("helloworld.tt", "-l", "-w", "-m").error).to.be.equal(false);
    });
    it('newFileAnalize is an instance of Note Class', () => {
        const newFileAnalizePipe = new FileAnalizePipe("helloworld.txt", "-l", "-w", "-m");
        expect(newFileAnalizePipe).to.be.instanceOf(FileAnalizePipe);
    });
});