import 'mocha';
import {expect} from 'chai';
import {Watcher} from '../../src/ejercicio-3/watcher';

describe('Testing "Watcher Class"', () => {
    it('newWatcher is created successfully', () => {
        expect(new Watcher("Yoda", "./Notes")).not.to.be.null;
    });
    it('newWatcher is an instance of Note Class', () => {
        expect(new Watcher("Yoda", "./Notes")).to.be.instanceOf(Watcher);
    });
    it('newWatcher is not created successfully', () => {
        expect(new Watcher("Yoda", "./Notario").watchNote()).to.be.equal(-1);
    });
    it('newWatcher is not created successfully', () => {
        expect(new Watcher("Doraemon", "./Notes").watchNote()).to.be.equal(-1);
    });
});