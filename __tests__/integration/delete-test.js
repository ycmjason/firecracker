import { firestore, clearCollection } from '../helpers/firebase.js';
import firecracker, {
  // eslint-disable-next-line no-unused-vars
  Firecracker, FirecrackerCollection, FirecrackerDocument
} from '../..';

const COLLECTION_NAME = 'integration-delete';

describe('Integration - Delete', () => {
  let db;
  let $collection;

  beforeAll(() => {
    db = firecracker();
    $collection = firestore.collection(COLLECTION_NAME);
  });

  beforeEach(async () => {
    await clearCollection($collection);
  });

  afterAll(async () => {
    await clearCollection($collection);
  });

  describe('FirecrackerDocument.delete', () => {
    it('should be able to delete document', async () => {
      const $docRef = await $collection.add({ wow: 3, f: 'hello' });

      const doc = await db.collection(COLLECTION_NAME).findById($docRef.id);
      await doc.delete();

      const $docSnapshot = await $docRef.get();
      expect($docSnapshot.exists).toBe(false);
    });
  });
});
