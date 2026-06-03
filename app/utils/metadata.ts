import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

const GRAIN_TYPE_PRICES_METADATA_KEY = 'rates';

export type Metadata = {
  key: string;
  value: unknown;
  description?: string;
};

export type GrainTypePricesMetadataValue = {
  rates?: GrainTypePricesMetadata;
  metadata?: {
    rates: GrainTypePricesMetadata;
  };
};

export type MetadataWithId = Metadata & {
  id: string;
  createdAt: number;
  updatedAt: number;
  rawData?: Record<string, unknown>;
};

export type GrainTypePricesMetadata = {
  'Gahu Pith': number;
  'Gahu Dalan': number;
  'Jwari Pith': number;
  'Jwari Dalan': number;
  'Bajari Pith': number;
  'Bajari Dalan': number;
};

type FirestoreMetadata = Metadata & {
  createdAt?: number | null;
  updatedAt?: number | null;
};

const getCreatedAtValue = (createdAt?: number | null) =>
  typeof createdAt === 'number' ? createdAt : Date.now();

const getUpdatedAtValue = (updatedAt?: number | null) =>
  typeof updatedAt === 'number' ? updatedAt : Date.now();

export const saveMetadata = async (metadata: Metadata) => {
  const db = getFirestoreDb();

  await addDoc(collection(db, 'metadata'), {
    ...metadata,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  return {
    message: 'Metadata saved successfully.'
  };
};

export const getMetadataById = async (id: string): Promise<MetadataWithId> => {
  const db = getFirestoreDb();
  const metadataSnapshot = await getDoc(doc(db, 'metadata', id));

  if (!metadataSnapshot.exists()) {
    throw new Error('Metadata not found.');
  }

  const metadata = metadataSnapshot.data() as FirestoreMetadata;

  return {
    id: metadataSnapshot.id,
    key: metadata.key,
    value: metadata.value,
    description: metadata.description,
    createdAt: getCreatedAtValue(metadata.createdAt),
    updatedAt: getUpdatedAtValue(metadata.updatedAt)
  };
};

export const getMetadataByKey = async (key: string): Promise<MetadataWithId | null> => {
  const db = getFirestoreDb();
  const metadataQuery = query(
    collection(db, 'metadata'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(metadataQuery);

  for (const metadataDoc of snapshot.docs) {
    const metadata = metadataDoc.data() as FirestoreMetadata;
    
    if (metadataDoc.id === key || metadata.key === key) {
      return {
        id: metadataDoc.id,
        key: metadata.key ?? key,
        value: metadata.value,
        description: metadata.description,
        createdAt: getCreatedAtValue(metadata.createdAt),
        updatedAt: getUpdatedAtValue(metadata.updatedAt),
        rawData: metadata as Record<string, unknown>
      };
    }
  }

  return null;
};

export const getAllMetadata = async (): Promise<MetadataWithId[]> => {
  const db = getFirestoreDb();
  const metadataQuery = query(collection(db, 'metadata'));
  const snapshot = await getDocs(metadataQuery);

  return snapshot.docs.map((metadataDoc) => {
    const metadata = metadataDoc.data() as FirestoreMetadata;

    return {
      id: metadataDoc.id,
      key: metadata.key,
      value: metadata.value,
      description: metadata.description,
      createdAt: getCreatedAtValue(metadata.createdAt),
      updatedAt: getUpdatedAtValue(metadata.updatedAt),
      rawData: metadata as Record<string, unknown>
    };
  });
};

export const updateMetadata = async (id: string, metadata: Metadata) => {
  const db = getFirestoreDb();

  await updateDoc(doc(db, 'metadata', id), {
    ...metadata,
    updatedAt: Date.now()
  });

  return {
    message: 'Metadata updated successfully.'
  };
};

export const setMetadataByKey = async (metadata: Metadata) => {
  const db = getFirestoreDb();
  const metadataRef = doc(db, 'metadata', metadata.key);

  await setDoc(metadataRef, {
    ...metadata,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  return {
    message: 'Metadata saved successfully.'
  };
};

export const getGrainTypePrices = async (): Promise<GrainTypePricesMetadata | null> => {
  try {
    const allMetadata = await getAllMetadata();

    if (!allMetadata || allMetadata.length === 0) {
      return null;
    }

    for (const meta of allMetadata) {
      if (meta.id === GRAIN_TYPE_PRICES_METADATA_KEY || meta.key === GRAIN_TYPE_PRICES_METADATA_KEY) {
        if (meta.value && typeof meta.value === 'object') {
          const metadataValue = meta.value as GrainTypePricesMetadataValue;

          if (metadataValue.metadata && typeof metadataValue.metadata === 'object' && metadataValue.metadata.rates) {
            return metadataValue.metadata.rates;
          }

          if (metadataValue.rates) {
            return metadataValue.rates;
          }
        }

        if (meta.rawData && typeof meta.rawData === 'object') {
          const rawData = meta.rawData as Record<string, unknown>;

          if ('metadata' in rawData && typeof rawData.metadata === 'object' && rawData.metadata !== null) {
            const metadataField = rawData.metadata as Record<string, unknown>;
            if ('rates' in metadataField) {
              return metadataField.rates as GrainTypePricesMetadata;
            }
          }

          if ('Gahu Pith' in rawData) {
            return rawData as GrainTypePricesMetadata;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching grain type prices:', error);
    return null;
  }
};

export const getAllRatesInfo = async () => {
  try {
    const allMetadata = await getAllMetadata();

    if (!allMetadata || allMetadata.length === 0) {
      return [];
    }

    const ratesInfo = allMetadata
      .map((meta) => {
        let rates: GrainTypePricesMetadata | null = null;

        if (meta.value && typeof meta.value === 'object') {
          const metadataValue = meta.value as GrainTypePricesMetadataValue;

          if (metadataValue.metadata && typeof metadataValue.metadata === 'object' && metadataValue.metadata.rates) {
            rates = metadataValue.metadata.rates;
          } else if (metadataValue.rates) {
            rates = metadataValue.rates;
          }
        }

        if (!rates && meta.rawData && typeof meta.rawData === 'object') {
          const rawData = meta.rawData as Record<string, unknown>;

          if ('metadata' in rawData && typeof rawData.metadata === 'object' && rawData.metadata !== null) {
            const metadataField = rawData.metadata as Record<string, unknown>;
            if ('rates' in metadataField) {
              rates = metadataField.rates as GrainTypePricesMetadata;
            }
          }
        }

        return {
          id: meta.id,
          key: meta.key,
          description: meta.description,
          rates,
          createdAt: meta.createdAt,
          updatedAt: meta.updatedAt
        };
      })
      .filter((item) => item.rates !== null);

    return ratesInfo;
  } catch (error) {
    console.error('Error fetching all rates info:', error);
    return [];
  }
};

export const setGrainTypePrices = async (prices: GrainTypePricesMetadata) => {
  return setMetadataByKey({
    key: GRAIN_TYPE_PRICES_METADATA_KEY,
    value: {
      metadata: {
        rates: prices
      }
    },
    description: 'Price per unit for each grain type'
  });
};
