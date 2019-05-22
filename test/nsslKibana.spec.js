require('dotenv').config({ path: './config/env' });
const axios = require('axios');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = require('chai').should();
const expect = require('chai').expect;
const spies = require('chai-spies');
const nsslKibana = require('../');
const { IndexPatternNotFoundError } = require('../lib/errors');
const kibanaMock = require('./kibana.mock');
const esMock = require('./es.mock');

chai.should();
chai.use(chaiAsPromised);
chai.use(spies);

const fakeAxiosGet = async mockName => {
  return { status: 200, data: kibanaMock[mockName] };
};

const fakeAxiosPut = async () => {
  return {};
};

const fakeAxiosCreate = mockName => ({
  get: fakeAxiosGet.bind(this, mockName),
  put: fakeAxiosPut.bind(this, mockName),
});

const fakeESSearch = async mockName => {
  return {warnings: null, statusCode: 200, body: esMock[mockName]};
};

const fakeESUpdate = async () => {
  return {};
};

const fakeESClientConstructor = mockName => {
  console.log('coucou')
  return ({
    search: fakeESSearch.bind(this, mockName),
    update: fakeESUpdate.bind(this, mockName),
  })
}

const sandbox = chai.spy.sandbox();

describe('nsslKibana - kibana adapter', async () => {
  describe('getIndexPattern', async () => {
    it('valid indexPattern should returns index-pattern object', async () => {
      const mockName = 'normalGet';

      chai.spy.on(axios, 'create', fakeAxiosCreate.bind(this, mockName));
      const { id, attributes } = await nsslKibana.getIndexPattern('test', {
        client: 'kibana',
      });
      id.should.equal('98e908c0-6695-11e9-bd10-cf1d074cfdaa');
      attributes.title.should.equal('test');
      attributes.fields.length.should.equal(8);
      should.exist(attributes.fieldFormatMap.type);
      chai.spy.restore(axios);
    });

    it('invalid indexPattern should throw IndexPatternNotFoundError', async () => {
      const mockName = 'invalidGet';

      chai.spy.on(axios, 'create', fakeAxiosCreate.bind(this, mockName));
      await expect(
        (async () => {
          const { id, attributes } = await nsslKibana.getIndexPattern(
            'invalid',
            { client: 'kibana' },
          );
        })(),
      ).to.eventually.be.rejectedWith(IndexPatternNotFoundError);
      chai.spy.restore(axios);
    });
  });
});

describe('nsslKibana - es adapter', async () => {
  describe('getIndexPattern', async () => {
    it('valid indexPattern should returns index-pattern object', async () => {
      const mockName = 'normalGet';

      const { id, attributes } = await nsslKibana.getIndexPattern('test', {
        client: {
          search: fakeESSearch.bind(this, mockName),
          update: fakeESUpdate.bind(this, mockName),
          name: 'elasticsearch-js'
        }
      });
      id.should.equal('98e908c0-6695-11e9-bd10-cf1d074cfdaa');
      attributes.title.should.equal('test');
      attributes.fields.length.should.equal(8);
      should.exist(attributes.fieldFormatMap.type);

    });

    it('invalid indexPattern should throw IndexPatternNotFoundError', async () => {
      const mockName = 'invalidGet';
      await expect((async () => {

        const {id, attributes} = await nsslKibana.getIndexPattern('invalid', {
        client: {
          search: fakeESSearch.bind(this, mockName),
          update: fakeESUpdate.bind(this, mockName),
          name: 'elasticsearch-js'
        }
      });

      })()).to.eventually.be.rejectedWith(IndexPatternNotFoundError);
    });
  });
});
