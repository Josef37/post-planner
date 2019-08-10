import { Utils } from '../src/utils';
import { expect } from 'chai';

describe('test url validation', (): void => {
    it('should return true for https://createrawvision.de', (): void => {
        expect(Utils.isvalidURL('https://createrawvision.de')).to.be.true;
    });
    it('should return false for createrawvision/category', (): void => {
        expect(Utils.isvalidURL('createrawvision/category')).to.be.false;
    });
});