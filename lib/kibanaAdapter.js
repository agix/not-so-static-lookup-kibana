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

module.exports = {
  getIndexPattern,
  setIndexPattern,
};
