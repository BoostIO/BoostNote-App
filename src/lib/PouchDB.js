let PouchDB = require('pouchdb-browser')

// Enable memory adapter on test env
if (process.env.NODE_ENV === 'test') {
  PouchDB = PouchDB
    .plugin(require('pouchdb-adapter-memory'))
}

export default PouchDB
