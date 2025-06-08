import assert from 'assert';
import { filterText, splitIntoSentences, findNumbers, cleanContext } from '../textUtils.js';
import { numbers } from '../numbers.js';

assert.strictEqual(filterText('abc Примечания здесь'), 'abc');
assert.deepStrictEqual(splitIntoSentences('Привет. Как дела?'), ['Привет', ' Как дела']);
const found = findNumbers('один два три', numbers).map(n => n.number);
assert.deepStrictEqual(found, [1,2,3]);
assert.strictEqual(cleanContext('I один.'), 'один.');
console.log('All tests passed.');
