import fileUpload from 'express-fileupload';
import UploadException from '../exception/uploadException.js'
import newLogger from '../conf/logConf.js';
import path from 'path';
import mime from 'mime-types';

const logger = newLogger('info', 'imageController.js', 'AuthServise');

class ImageController {

    constructor() {}

    settingsMiddleWare() {
        return fileUpload({
            limits: {
                fileSize: process.env.MAX_IMAGE_SIZE_MB * 1000000,
                files: 1,
                fields: 0
            },
            createParentPath: true,
            abortOnLimit: true,
            limitHandler: (req, res, next) => {
                next(new UploadException( `Image file can not be larger than ${process.env.MAX_IMAGE_SIZE_MB} MB.`));
            },
            parseNested: true
        });
    }

    async upload(req, res, next) {
        logger.info('user with id=%s upload image', req.userIdFromJws);

        if(!req.files || Object.keys(req.files).length === 0) {
            next(new UploadException('No files were uploaded.'));
        } else if(!['jpg', 'png'].includes(mime.extension(req.files.imageField.mimetype))) {
            next(new UploadException('File MIME-type must be png or jpg.'));
        } else {
            const file = req.files.imageField;
            const fileName = file.md5 + '.' + mime.extension(file.mimetype);
            const uploadPath = path.join(process.cwd(), process.env.RELATED_PATH_TO_IMAGE_STORE, fileName);
            file.mv(uploadPath, err => {
                if(err) next(err);
                else res.status(200).send({ name: fileName });
            });
        }
    }
};

export default ImageController;