import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, Query, DocumentData } from 'firebase/firestore';
import { db } from '@/services/firebase';

export function useFirebaseCollection<T = DocumentData>(
  collectionName: string,
  queryConstraints?: Query<DocumentData>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const q = queryConstraints || query(collection(db, collectionName));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(`Error setting up listener for ${collectionName}:`, err);
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName]);

  return { data, loading, error };
}
