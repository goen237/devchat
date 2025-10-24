import multer from 'multer';
import { MulterFile } from '../types/multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Upload-Verzeichnis sicherstellen
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Erlaubte Dateitypen
const allowedMimeTypes = {
  // Bilder
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  // Dokumente
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  // Archive
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
};

// Sichere Datei-Speicherung
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sicherer Dateiname: Zeitstempel + UUID + Original-Endung
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const originalExt = path.extname(file.originalname).toLowerCase();
    const safeName = `${timestamp}-${uniqueId}${originalExt}`;
    cb(null, safeName);
  }
});

// Erweiterte Datei-Validierung
const fileFilter = (req: any, file: MulterFile, cb: multer.FileFilterCallback) => {
  try {
    const mimeType = file.mimetype.toLowerCase();
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    // Prüfe MIME-Type
    if (!allowedMimeTypes[mimeType as keyof typeof allowedMimeTypes]) {
      return cb(new Error(`Dateityp ${mimeType} nicht erlaubt`));
    }
    
    // Prüfe Dateiendung gegen MIME-Type
    const allowedExtensions = allowedMimeTypes[mimeType as keyof typeof allowedMimeTypes];
    if (!allowedExtensions.includes(fileExt)) {
      return cb(new Error(`Dateiendung ${fileExt} passt nicht zum Dateityp ${mimeType}`));
    }
    
    // Prüfe Dateiname auf schädliche Zeichen
    const filename = file.originalname;
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(filename)) {
      return cb(new Error('Dateiname enthält nicht erlaubte Zeichen'));
    }
    
    cb(null, true);
  } catch (error) {
    cb(new Error('Fehler bei der Dateivalidierung'));
  }
};

// Optimierte Multer-Konfiguration
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Nur eine Datei pro Upload
    fieldNameSize: 100, // Feldname max 100 Zeichen
    fieldSize: 1024 * 1024, // Feldwert max 1MB
  },
  fileFilter,
});

// Helper-Funktionen
export const getAllowedFileTypes = () => Object.keys(allowedMimeTypes);
export const getMaxFileSize = () => '10MB';
export const isValidFileType = (mimeType: string) => 
  allowedMimeTypes.hasOwnProperty(mimeType.toLowerCase());