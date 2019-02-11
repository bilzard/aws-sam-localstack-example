/* eslint-env mocha */

const fs = require('fs');
const path = require('path');
const assert = require('power-assert');
const parseMailHeader = require('core/parseMailHeader');

/*
 * test suits
 */
describe('core/parseMailHeader test suit', () => {
  // shared variables over the test suit
  let message;

  /*
   * starup
  */
  before(async () => {
    message = fs.readFileSync(path.join(__dirname, '..', '..', 'fixture', 'mail', 'message.txt'));
  });

  /*
   * test cases
  */
  it('successfully parse message', async () => {
    const parsed = await parseMailHeader({ message });
    assert.deepEqual(parsed, {
      From: {
        Address: 'from-address@example.com',
        Name: 'John Smith',
      },
      Subject: 'Greeting Message',
    });
  });
});
