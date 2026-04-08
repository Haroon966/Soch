import type { SourceFile } from '../types';

export const getFileType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['docx', 'doc', 'txt', 'md'].includes(ext)) return 'document';
  if (['url', 'webloc'].includes(ext)) return 'link';
  if (['json', 'csv'].includes(ext)) return 'data';
  if (['mp4', 'mp3', 'wav', 'webm'].includes(ext)) return 'media';
  return 'unknown';
};

export const scanDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<SourceFile[]> => {
  const sources: SourceFile[] = [];
  
  async function scan(handle: FileSystemDirectoryHandle, currentPath: string = '') {
    // @ts-ignore
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
        
        sources.push({
          id: fullPath,
          name: file.name,
          type: getFileType(file.name),
          size: file.size,
          lastModified: file.lastModified,
          handle: fileHandle,
        });
      } else if (entry.kind === 'directory') {
        const dirHandle = entry as FileSystemDirectoryHandle;
        // avoid hidden dirs like .git
        if (!entry.name.startsWith('.')) {
          await scan(dirHandle, currentPath ? `${currentPath}/${entry.name}` : entry.name);
        }
      }
    }
  }

  await scan(dirHandle);
  return sources;
};

export const startPolling = (dirHandle: FileSystemDirectoryHandle, onUpdate: (sources: SourceFile[]) => void) => {
  const interval = setInterval(async () => {
    const newSources = await scanDirectory(dirHandle);
    onUpdate(newSources);
  }, 5000);
  
  return () => clearInterval(interval);
};
