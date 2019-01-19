import FiresCollection from './FiresCollection';

const _checkFirestoreConfig = $firestore => {
  if (!$firestore._config.settings.timestampsInSnapshots) {
    throw Error('Fires: Firestore must set `timestampsInSnapshots` to `true`. Please add this line before initiating Fires `firebase.firestore().settings({ timestampsInSnapshots: true });`');
  }

  return;
};

export default class Fires {
  constructor ($firestore, opts = {}) {
    _checkFirestoreConfig($firestore);

    this.$firestore = $firestore;
    this.collectionMap = new Map();
    this.opts = opts;
  }

  collection (name) {
    const { collectionMap, $firestore, opts } = this;

    if (collectionMap.has(name)) {
      return collectionMap.get(name);
    }

    const collection = new FiresCollection(
      $firestore.collection(name),
      opts,
    );
    collectionMap.set(name, collection);
    return collection;
  }
}
