class FieldNotFoundError extends Error {
  constructor(args) {
    super(args);
    this.name = this.constructor.name;
    this.args = args;
    this.message = `string ${args.fieldName} not found in index-pattern ${
      args.indexPattern
    }`;
  }
}

class InvalidLookupEntriesError extends Error {
  constructor(args) {
    super(args);
    this.name = this.constructor.name;
    this.args = args;
    this.message = `Invalid lookupEntries ${JSON.stringify(args.lookupEntry)}`;
  }
}

class IndexPatternNotFoundError extends Error {
  constructor(args) {
    super(args);
    this.name = this.constructor.name;
    this.args = args;
    this.message = `${args.saved_objects.length} index pattern found for ${
      args.indexPattern
    }`;
  }
}

class UnsupportedFunctionError extends Error {
  constructor(args) {
    super(args);
    this.name = this.constructor.name;
    this.args = args;
    this.message = `${args.function} is not supported yet on adapter ${
      args.adapter
    }`;
  }
}

module.exports = {
  FieldNotFoundError,
  InvalidLookupEntriesError,
  IndexPatternNotFoundError,
  UnsupportedFunctionError,
};
