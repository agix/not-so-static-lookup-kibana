const axios = require('axios');
const { IndexPatternNotFoundError } = require('./errors');

const pickAxios = client => {
  if (
    typeof client.defaults !== 'undefined' &&
    typeof client.defaults.baseURL !== 'undefined'
  ) {
    return client;
  }
  return axios.create({
    baseURL: process.env.NSSLKIBANA_KIBANA_URL || 'http://127.0.0.1:5601/',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'kbn-xsrf': 'nsslKibana',
    },
  });
};

const getIndexPattern = async (indexPattern, { client }) => {
  const axiosInstance = pickAxios(client);

  const { status, data } = await axiosInstance.get(
    `/api/saved_objects/_find?type=index-pattern&search_fields=title&search=${indexPattern}`,
  );

  // console.log(JSON.stringify(data, '', 2));
  // console.log(
  //   JSON.stringify(JSON.parse(data.saved_objects[0].attributes.fields), '', 2),
  // );
  // console.log(
  //   JSON.stringify(
  //     JSON.parse(data.saved_objects[0].attributes.fieldFormatMap),
  //     '',
  //     2,
  //   ),
  // );

  if (status !== 200) {
    throw new Error(data);
  }
  if (data.saved_objects.length !== 1) {
    throw new IndexPatternNotFoundError({
      saved_objects: data.saved_objects,
      indexPattern,
    });
  }
  const attributes = data.saved_objects[0].attributes;
  return {
    id: data.saved_objects[0].id,
    attributes,
  };
};

const setIndexPattern = async ({ id, attributes }, { client }) => {
  const axiosInstance = pickAxios(client);

  const { status, data } = await axiosInstance.put(
    `/api/saved_objects/index-pattern/${id}`,
    { attributes },
  );
  if (status !== 200) {
    throw new Error(data);
  }
  return {
    id: data.id,
    attributes: data.attributes,
  };
};

const refreshIndexPattern = async (indexPattern, { client }) => {
  const axiosInstance = pickAxios(client);
  const {
    status: statusSettings,
    data: dataSettings,
  } = await axiosInstance.get(`/api/kibana/settings`);
  if (statusSettings !== 200) {
    throw new Error(dataSettings);
  }
  const metaFields = dataSettings.settings.metaFields || [
    '_source',
    '_id',
    '_type',
    '_index',
    '_score',
  ];
  const { status: statusFields, data: dataFields } = await axiosInstance.get(
    `/api/index_patterns/_fields_for_wildcard?pattern=${indexPattern}&meta_fields=${JSON.stringify(
      metaFields,
    )}`,
  );

  if (statusFields !== 200) {
    throw new Error(dataFields);
  }

  const { id, attributes } = await getIndexPattern(indexPattern, { client });
  const fields = JSON.parse(attributes.fields);
  dataFields.fields.forEach(newField => {
    const currentFieldIndex = fields.findIndex(f => f.name === newField.name);
    if (currentFieldIndex !== -1) {
      Object.assign(fields[currentFieldIndex], newField);
    } else {
      fields.push({ ...newField, count: 0, scripted: false });
    }
  });

  attributes.fields = JSON.stringify(
    fields.filter(oldField => {
      const currentField = dataFields.fields.find(
        f => f.name === oldField.name,
      );
      return typeof currentField !== 'undefined';
    }),
  );

  return setIndexPattern({ id, attributes }, { client });
};

module.exports = {
  getIndexPattern,
  setIndexPattern,
  refreshIndexPattern,
};
