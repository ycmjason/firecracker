import { firestore, clearCollection } from './helpers/firebase.js';
import firecracker, {
  // eslint-disable-next-line no-unused-vars
  Firecracker, FirecrackerCollection, FirecrackerDocument
} from '..';

jest.setTimeout(10000);

const COLLECTION_NAME = 'e2e-read';

describe('e2e - Read', () => {
  let db;
  let $collection;

  beforeAll(() => {
    db = firecracker();
    $collection = firestore.collection(COLLECTION_NAME);
  });

  beforeEach(async () => {
    await clearCollection($collection);
  });

  describe('FirecrackerCollection.findById', () => {
    it('should find the document with a specific ID', async () => {
      await $collection.doc('someId').set({ yo: false });

      const doc = await db.collection(COLLECTION_NAME).findById('someId');

      expect(doc).toBeInstanceOf(FirecrackerDocument);
      expect(doc.yo).toBe(false);
    });
  });

  describe('FirecrackerCollection.findAll', () => {
    it('should retrieve all documents', async () => {
      await $collection.add({ count: 100 });
      await $collection.add({ hello: 'world' });
      await $collection.doc('someId').set({ yo: false });

      const docs = await db.collection(COLLECTION_NAME).findAll();

      expect(docs).toBeInstanceOf(Array);
      expect(docs).toHaveLength(3);
      expect(docs).toEqual(expect.arrayContaining([
        expect.objectContaining({ count: 100 }),
        expect.objectContaining({ hello: 'world' }),
        expect.objectContaining({ yo: false }),
      ]));
    });
  });

  describe('FirecrackerCollection.find', () => {
    it('should retrieve document with matching query', async () => {
      await $collection.add({ count: 0 });
      await $collection.add({ count: 20 });
      await $collection.add({ count: 40 });
      await $collection.add({ count: 60, show: 'yes' });
      await $collection.add({ count: 80 });
      await $collection.add({ count: 100, show: 'yes' });
      await $collection.add({ say: 'what' });
      const docs = await db.collection(COLLECTION_NAME).find({
        count: ['>', 50],
        show: ['==', 'yes'],
      });

      expect(docs).toBeInstanceOf(Array);
      expect(docs).toHaveLength(2);
      expect(docs).toEqual(expect.arrayContaining([
        expect.objectContaining({ count: 60 }),
        expect.objectContaining({ count: 100 }),
      ]));
    });

    it('should retrieve document with matching nested query', async () => {
      const createDoc = count => ({ nest: { count } });
      await $collection.add(createDoc(0));
      await $collection.add(createDoc(20));
      await $collection.add(createDoc(40));
      await $collection.add(createDoc(60));
      await $collection.add(createDoc(80));
      await $collection.add(createDoc(100));
      await $collection.add({ say: 'what' });

      const docs = await db.collection(COLLECTION_NAME).find({
        nest: {
          count: ['>', 50],
        },
      });

      expect(docs).toBeInstanceOf(Array);
      expect(docs).toHaveLength(3);
      expect(docs).toEqual(expect.arrayContaining([
        expect.objectContaining(createDoc(60)),
        expect.objectContaining(createDoc(80)),
        expect.objectContaining(createDoc(100)),
      ]));
    });

    // testing range operators
    [
      {
        initialCounts: [0, 20, 40, 60, 80, 100],
        query: ['range[]', 0, 80],
        expectedCounts: [0, 20, 40, 60, 80],
      },
      {
        initialCounts: [0, 20, 40, 60, 80, 100],
        query: ['range[)', 0, 80],
        expectedCounts: [0, 20, 40, 60],
      },
      {
        initialCounts: [0, 20, 40, 60, 80, 100],
        query: ['range(]', 0, 80],
        expectedCounts: [20, 40, 60, 80],
      },
      {
        initialCounts: [0, 20, 40, 60, 80, 100],
        query: ['range()', 0, 80],
        expectedCounts: [20, 40, 60],
      },
    ].forEach(({ initialCounts, query, expectedCounts }) => {
      it(`should retrieve document with matching ${query[0]}`, async () => {
        await Promise.all(
          initialCounts.map(async count => {
            await $collection.add({ count });
          })
        );
        await $collection.add({ say: 'what' });

        const docs = await db.collection(COLLECTION_NAME).find({
          count: query,
        });

        expect(docs).toBeInstanceOf(Array);
        expect(docs).toHaveLength(expectedCounts.length);
        expect(docs).toEqual(expect.arrayContaining(
          expectedCounts.map(count => expect.objectContaining({ count })),
        ));
      });
    });
  });
});
