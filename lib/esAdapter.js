const { IndexPatternNotFoundError } = require('./errors');

const getIndexPattern = async (indexPattern, { client, index = '.kibana' }) => {
  const { warnings, statusCode, body } = await client.search({
    index,
    body: {
      query: {
        bool: {
          must: [
            { term: { type: 'index-pattern' } },
            { term: { 'index-pattern.title': indexPattern } },
          ],
        },
      },
    },
  });

  // console.log(warnings);
  // console.log(statusCode);
  // console.log(JSON.stringify(body, '', 2));

  if (warnings) {
    warnings.forEach(warning => console.warn(warning));
  }
  if (statusCode !== 200) {
    throw new Error(body);
  }
  if (body.hits.hits.length !== 1) {
    throw new IndexPatternNotFoundError({
      saved_objects: body.hits.hits,
      indexPattern,
    });
  }
  const attributes = body.hits.hits[0]._source['index-pattern'];
  return {
    id: body.hits.hits[0]._id.split(':')[1],
    attributes,
  };
};

const setIndexPattern = async (
  { id, attributes },
  { client, index = '.kibana' },
) => {
  const { warnings, statusCode, body } = await client.update({
    id: `index-pattern:${id}`,
    index,
    body: {
      doc: {
        'index-pattern': attributes,
        updated_at: new Date().toISOString(),
      },
    },
  });
  if (warnings) {
    warnings.forEach(warning => console.warn(warning));
  }
  if (statusCode !== 200 || body.result !== 'updated') {
    throw new Error(body);
  }

  return {
    id,
    attributes,
  };
};

module.exports = {
  getIndexPattern,
  setIndexPattern,
};
