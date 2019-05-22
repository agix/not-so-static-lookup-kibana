# not-so-static-lookup-kibana

Kibana `string static lookup table` (https://cinhtau.net/2018/08/27/static-lookup/) is a good way to make your logs more readable without indexing useless text.

This library try to reduce the "static" part by allowing setting this lookup table programmatically.

## Kibana or Elasticsearch adapter

Each function take as last parameter an optional `Connection` option (default to elasticsearch 7.10 client on `http://localhost:9200` (or `NSSLKIBANA_ES_URL` env) with `.kibana` index).

You can instead pass your own elasticsearch client with different version and change the index to whatever kibana index is.

```
const nsslKibana = require('nssl-kibana');
const { Client } = require('@elastic/elasticsearch');
const esClient = new Client({
  node: 'http://localhost:9200',
});

(async () => {
  const indexPatternContent = await nsslKibana.getIndexPattern('logstash-*', {client: esClient});
})()
```

If you prefer to communicate via kibana api, you can pass an axiosInstance as a client.

```
const nsslKibana = require('nssl-kibana');
const axios = require('axios');

const axiosInstance =  axios.create({
  baseURL: 'http://127.0.0.1:5601/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'kbn-xsrf': 'nssl-kibana',
    'Authorization': 'Bearer my-super-secret',
  },
});

(async () => {
  const indexPatternContent = await nsslKibana.getIndexPattern('logstash-*', {client: axiosInstance});
})()
```

If you specify a string as client, it will try to connect to kibana api on `http://localhost:9200` (or `NSSLKIBANA_KIBANA_URL` env)

## Methods

### getIndexPattern

Straight forward function which take `indexPattern` name and return `indexPatternContent`.

Format is `{id, attributes}`.

`id` is the id of the index-pattern document and `attributes` are specific to index-pattern kibana saved-objects.

### setIndexPattern

Straight forward function which take `indexPatternContent` object (as returned by `getIndexPattern`) and set it in kibana.

### setStaticLookup

This function takes an `indexPattern` name, a `fieldName` and an array of `lookupEntry` (`{key, value}`)

If the field exists as a string in the index-pattern, the `lookupEntries` array is set as static lookup for this field.

### pushStaticLookup

Instead of setting the third parameter as the new `lookupEntries` for the `fieldName`, it adds each lookup entry (`{key, value}`) in the existent lookup.

If key already exists, the old value is replaced.
