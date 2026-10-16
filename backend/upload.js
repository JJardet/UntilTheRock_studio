const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers d'upload s'ils n'existent pas
const uploadDirs = [
  path.join(__dirname, '../frontend/assets/uploads/images'),
  path.join(__dirname, '../frontend/assets/uploads/audio'),
  path.join(__dirname, '../frontend/assets/uploads/videos'),
  path.join(__dirname, 'uploads/recording-demos')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'images'; // par défaut
    
    // Déterminer le dossier selon le type de fichier
    if (file.mimetype.startsWith('image/')) {
      folder = 'images';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'audio';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'videos';
    }
    
    const uploadPath = path.join(__dirname, `../frontend/assets/uploads/${folder}`);
    cb(null, uploadPath);
  },
  
  filename: function (req, file, cb) {
    // Nettoyer le nom du fichier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    
    cb(null, basename + '-' + uniqueSuffix + ext);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a'],
    video: ['video/mp4', 'video/mpeg', 'video/webm', 'video/ogg', 'video/quicktime']
  };
  
  const allAllowedTypes = [...allowedTypes.image, ...allowedTypes.audio, ...allowedTypes.video];
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};

// Configuration de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  }
});

const recordingDemoStorage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads/recording-demos'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();

    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const recordingDemoUpload = multer({
  storage: recordingDemoStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers audio et vidéo sont autorisés'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024
  }
}).single('demo');

// Middleware pour upload multiple
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

// Fonction pour supprimer un fichier
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(__dirname, '../frontend', filePath);
    
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        // ENOENT = fichier n'existe pas (pas grave)
        console.error('Erreur suppression fichier:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = { uploadFields, recordingDemoUpload, deleteFile };
