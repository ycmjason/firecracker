import firestore from './$firestore';
import Fires from './Fires';

export { default as FiresCollection } from './FiresCollection';
export { default as FiresDocument } from './FiresDocument';
export { Fires };

let firesSingleton;

export default (opts) => {
  if (firesSingleton) return firesSingleton;

  firesSingleton = new Fires(firestore(), opts);
  return firesSingleton;
};
