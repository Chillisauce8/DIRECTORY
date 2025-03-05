import { coreServiceLocator } from '../serviceLocator';


export function isMediaLinked(req: Request, mediaId) {
    const associationsHelper = coreServiceLocator.get('associationsHelper');
    return associationsHelper.hasAssociationsFromSource(req, mediaId);
}
