import chai from 'chai';

import * as Terminal from '..';

describe('Given the Terminal library', () =>
{
  it('should define all API functions', () =>
  {
    chai.assert.isDefined(Terminal.ReactTerminal);
    chai.assert.isDefined(Terminal.ReactThemes);
    chai.assert.isDefined(Terminal.ReactOutputRenderers);
  });
});
