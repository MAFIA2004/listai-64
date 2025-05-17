
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';

// Check if running in Capacitor (native) environment
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

// Request storage permissions
export const requestStoragePermissions = async (): Promise<boolean> => {
  if (!isNativePlatform()) {
    return true; // Web platform uses browser permissions
  }
  
  try {
    // For modern Android, we don't need to explicitly request storage permissions
    // They are requested when needed by the Filesystem plugin
    return true;
  } catch (error) {
    console.error('Error requesting storage permissions:', error);
    toast.error('No se pudo obtener permisos de almacenamiento');
    return false;
  }
};

// Example function to write a file
export const writeToFile = async (fileName: string, data: string): Promise<string | null> => {
  if (!isNativePlatform()) {
    console.log('Running in browser - file operations not available');
    return null;
  }
  
  try {
    const result = await Filesystem.writeFile({
      path: fileName,
      data: data,
      directory: Directory.Documents,
      encoding: 'utf8'
    });
    
    toast.success(`Archivo guardado: ${fileName}`);
    return result.uri;
  } catch (error) {
    console.error('Error writing file:', error);
    toast.error('Error al guardar el archivo');
    return null;
  }
};

// Example function to read a file
export const readFromFile = async (fileName: string): Promise<string | null> => {
  if (!isNativePlatform()) {
    console.log('Running in browser - file operations not available');
    return null;
  }
  
  try {
    const result = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Documents,
      encoding: 'utf8'
    });
    
    return result.data;
  } catch (error) {
    console.error('Error reading file:', error);
    toast.error('Error al leer el archivo');
    return null;
  }
};
