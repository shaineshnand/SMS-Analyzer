export async function collectFilesFromDataTransfer(data: DataTransfer): Promise<File[]> {
  const items = Array.from(data.items ?? []);
  const nested: File[] = [];

  for (const item of items) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) {
      await walkEntry(entry, nested);
    }
  }

  if (nested.length) return nested;
  return Array.from(data.files ?? []);
}

async function walkEntry(entry: FileSystemEntry, files: File[]): Promise<void> {
  if (entry.isFile) {
    const file = await readFileEntry(entry as FileSystemFileEntry);
    files.push(file);
    return;
  }

  if (entry.isDirectory) {
    const children = await readDirectory(entry as FileSystemDirectoryEntry);
    for (const child of children) {
      await walkEntry(child, files);
    }
  }
}

function readFileEntry(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

function readDirectory(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  const reader = entry.createReader();
  return new Promise((resolve, reject) => {
    const all: FileSystemEntry[] = [];
    const readBatch = () => {
      reader.readEntries((batch) => {
        if (!batch.length) {
          resolve(all);
          return;
        }
        all.push(...batch);
        readBatch();
      }, reject);
    };
    readBatch();
  });
}
