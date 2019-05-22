const { Client } = require('@elastic/elasticsearch');
const esAdapter = require('./esAdapter');
const kibanaAdapter = require('./kibanaAdapter');
const { FieldNotFoundError, InvalidLookupEntriesError } = require('./errors');

const defaultClient = new Client({
  node: process.env.NSSLKIBANA_ES_URL || 'http://localhost:9200',
});

const jsonifiedFields = ['fieldFormatMap', 'fields'];

const pickAdapter = client => {
  if (client.name === 'elasticsearch-js') {
    return esAdapter;
  }
  return kibanaAdapter;
};

const getIndexPattern = async (
  indexPattern,
  { client, index } = { client: defaultClient },
) => {
  const adapter = pickAdapter(client);

  const indexPatternContent = await adapter.getIndexPattern(indexPattern, {
    client,
    index,
  });

  jsonifiedFields.forEach(field => {
    indexPatternContent.attributes[field] = JSON.parse(
      indexPatternContent.attributes[field],
    );
  });

  return indexPatternContent;
};

const setIndexPattern = async (
  indexPatternContent,
  { client, index } = { client: defaultClient },
) => {
  const adapter = pickAdapter(client);

  const jsonifiedIndexPatternContent = indexPatternContent;
  jsonifiedFields.forEach(field => {
    jsonifiedIndexPatternContent.attributes[field] = JSON.stringify(
      jsonifiedIndexPatternContent.attributes[field],
    );
  });

  return adapter.setIndexPattern(jsonifiedIndexPatternContent, {
    client,
    index,
  });
};

const getStaticLookup = async (
  indexPattern,
  fieldName,
  { client, index } = { client: defaultClient },
) => {
  const { id, attributes } = await getIndexPattern(indexPattern, {
    client,
    index,
  });

  const fieldExists = attributes.fields.find(
    field => field.name === fieldName && field.type === 'string',
  );
  if (typeof fieldExists === 'undefined') {
    throw new FieldNotFoundError({ fieldName, indexPattern });
  }

  if (typeof attributes.fieldFormatMap === 'undefined') {
    attributes.fieldFormatMap = {};
  }
  if (
    typeof attributes.fieldFormatMap[fieldName] !== 'undefined' &&
    attributes.fieldFormatMap[fieldName].id === 'static_lookup'
  ) {
    return {
      id,
      attributes,
      fieldFormat: attributes.fieldFormatMap[fieldName],
    };
  }
  return { id, attributes };
};

const setStaticLookup = async (
  indexPattern,
  fieldName,
  lookupEntries,
  { client, index } = { client: defaultClient },
) => {
  const cleanLookupEntries = lookupEntries.map(({ key, value }, i) => {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new InvalidLookupEntriesError({ lookupEntry: lookupEntries[i] });
    }
    return { key, value };
  });

  const { id, attributes } = await getStaticLookup(indexPattern, fieldName, {
    client,
    index,
  });

  attributes.fieldFormatMap[fieldName] = {
    id: 'static_lookup',
    params: {
      lookupEntries: cleanLookupEntries,
    },
  };

  return setIndexPattern(
    { id, attributes },
    {
      client,
      index,
    },
  );
};

const pushStaticLookup = async (
  indexPattern,
  fieldName,
  lookupEntry,
  { client, index } = { client: defaultClient },
) => {
  let lookupEntries;
  if (lookupEntry.constructor.name === 'Array') {
    lookupEntries = lookupEntry;
  } else {
    lookupEntries = [lookupEntry];
  }
  const cleanLookupEntries = lookupEntries.map(({ key, value }, i) => {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new InvalidLookupEntriesError({ lookupEntry: lookupEntries[i] });
    }
    return { key, value };
  });

  const { id, attributes, fieldFormat } = await getStaticLookup(
    indexPattern,
    fieldName,
    { client, index },
  );
  if (typeof fieldFormat === 'undefined') {
    attributes.fieldFormatMap[fieldName] = {
      id: 'static_lookup',
      params: {
        lookupEntries: cleanLookupEntries,
      },
    };
  } else {
    cleanLookupEntries.forEach(({ key, value }) => {
      const exists = fieldFormat.params.lookupEntries.findIndex(
        l => l.key === key,
      );
      if (typeof exists === 'undefined') {
        fieldFormat.params.lookupEntries.push({ key, value });
      } else {
        console.warn(
          `Key "${key}" with old value "${
            fieldFormat.params.lookupEntries[exists].value
          }" replaced with "${value}"`,
        );
        fieldFormat.params.lookupEntries[exists].value = value;
      }
    });
    attributes.fieldFormatMap[fieldName] = fieldFormat;
  }

  return setIndexPattern(
    { id, attributes },
    {
      client,
      index,
    },
  );
};

module.exports = {
  getIndexPattern,
  setIndexPattern,
  setStaticLookup,
  pushStaticLookup,
};
