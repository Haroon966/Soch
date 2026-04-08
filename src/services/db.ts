import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Project, SourceFile } from '../types';

interface EvidenceDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
  };
  sources: {
    key: string;
    value: Omit<SourceFile, 'handle'> & { handle?: any }; 
  };
  canvasState: {
    key: string;
    value: { projectId: string; nodes: any[]; edges: any[] };
  };
  snapshots: {
    key: string;
    value: { id: string; projectId: string; timestamp: number; name: string; nodes: any[]; edges: any[] };
  };
  settings: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<EvidenceDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<EvidenceDB>('EvidenceCanvasDB', 2, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sources')) {
          db.createObjectStore('sources', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('canvasState')) {
          db.createObjectStore('canvasState', { keyPath: 'projectId' });
        }
        if (!db.objectStoreNames.contains('snapshots')) {
          const snapshotStore = db.createObjectStore('snapshots', { keyPath: 'id' });
          snapshotStore.createIndex('projectId', 'projectId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
};

export const saveProject = async (project: Project) => {
  const db = await initDB();
  await db.put('projects', project);
};

export const getProject = async (id: string) => {
  const db = await initDB();
  return await db.get('projects', id);
};

export const saveSource = async (source: SourceFile) => {
  const db = await initDB();
  await db.put('sources', source);
};

export const saveSetting = async (key: string, value: any) => {
  const db = await initDB();
  await db.put('settings', value, key);
};

export const getSetting = async (key: string) => {
  const db = await initDB();
  return await db.get('settings', key);
};

export const saveCanvasState = async (projectId: string, nodes: any[], edges: any[]) => {
  const db = await initDB();
  await db.put('canvasState', { projectId, nodes, edges });
};

export const getCanvasState = async (projectId: string) => {
  const db = await initDB();
  return await db.get('canvasState', projectId);
};

export const saveSnapshot = async (id: string, projectId: string, name: string, nodes: any[], edges: any[]) => {
  const db = await initDB();
  await db.put('snapshots', { id, projectId, name, timestamp: Date.now(), nodes, edges });
};

export const getSnapshots = async (projectId: string) => {
  const db = await initDB();
  const tx = db.transaction('snapshots', 'readonly');
  const index = tx.store.index('projectId');
  return await index.getAll(projectId);
};
