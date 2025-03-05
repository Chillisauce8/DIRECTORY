import {coreServiceLocator} from '../serviceLocator';
const cloudinary = require('cloudinary');


const privateSettings = coreServiceLocator.get('privateSettings');


export function configProjectCloudinary(req) {
    const configSettings = req.appSettings.cloudinarySettings ?
        {...privateSettings.CLOUDINARY, ...req.appSettings.cloudinarySettings} : privateSettings.CLOUDINARY;

    cloudinary.config(configSettings);
}
