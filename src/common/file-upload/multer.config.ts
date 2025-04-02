import { diskStorage } from 'multer';
import * as path from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: 'uploads/',
    filename: (_, file, cb) => {
      if (!file) return cb(null, null);
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      cb(null, fileName);
    },
  }),
};

export const fileFilter = (req, file, callback) => {
  // Allow only image files
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    return callback(
      new Error(
        'File hanya boleh gambar dengan ekstensi .jpg, .jpeg atau .png',
      ),
      false,
    );
  }
  callback(null, true);
};
