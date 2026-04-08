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
  settings: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<EvidenceDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<EvidenceDB>('EvidenceCanvasDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sources')) {
          db.createObjectStore('sources', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('canvasState')) {
          db.createObjectStore('canvasState', { keyPath: 'projectId' });
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
