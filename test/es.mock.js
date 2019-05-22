module.exports = {
  invalidGet: {
  "took": 0,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 0,
      "relation": "eq"
    },
    "max_score": null,
    "hits": []
  }
}
,
  normalGet: {
    took: 0,
    timed_out: false,
    _shards: {
      total: 1,
      successful: 1,
      skipped: 0,
      failed: 0,
    },
    hits: {
      total: {
        value: 1,
        relation: 'eq',
      },
      max_score: 0.4677335,
      hits: [
        {
          _index: '.kibana_1',
          _type: '_doc',
          _id: 'index-pattern:98e908c0-6695-11e9-bd10-cf1d074cfdaa',
          _score: 0.4677335,
          _source: {
            'index-pattern': {
              title: 'test',
              timeFieldName: 'date',
              fields: JSON.stringify([
                {
                  name: '_id',
                  type: 'string',
                  count: 0,
                  scripted: false,
                  searchable: true,
                  aggregatable: true,
                  readFromDocValues: false,
                },
                {
                  name: '_index',
                  type: 'string',
                  count: 0,
                  scripted: false,
                  searchable: true,
                  aggregatable: true,
                  readFromDocValues: false,
                },
                {
                  name: '_score',
                  type: 'number',
                  count: 0,
                  scripted: false,
                  searchable: false,
                  aggregatable: false,
                  readFromDocValues: false,
                },
                {
                  name: '_source',
                  type: '_source',
                  count: 0,
                  scripted: false,
                  searchable: false,
                  aggregatable: false,
                  readFromDocValues: false,
                },
                {
                  name: '_type',
                  type: 'string',
                  count: 0,
                  scripted: false,
                  searchable: true,
                  aggregatable: true,
                  readFromDocValues: false,
                },
                {
                  name: 'comment',
                  type: 'string',
                  count: 0,
                  scripted: false,
                  searchable: true,
                  aggregatable: false,
                  readFromDocValues: false,
                },
                {
                  name: 'data.activity._id',
                  type: 'string',
                  count: 0,
                  scripted: false,
                  searchable: true,
                  aggregatable: true,
                  readFromDocValues: true,
                },
                {
                  name: 'type',
                  type: 'string',
                  count: 0,
                  scripted: false,
                  searchable: true,
                  aggregatable: true,
                  readFromDocValues: true,
                },
              ]),
              fieldFormatMap: JSON.stringify({
                type: {
                  id: 'static_lookup',
                  params: {
                    lookupEntries: [
                      {
                        key: 'ERR1',
                        value: 'This is a big problem',
                      },
                    ],
                  },
                },
              }),
            },
            type: 'index-pattern',
            references: [],
            migrationVersion: {
              'index-pattern': '6.5.0',
            },
            updated_at: '2019-05-22T18:13:46.630Z',
          },
        },
      ],
    },
  },
};
