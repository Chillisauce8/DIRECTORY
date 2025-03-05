import { UserRegistrationSettings } from '../../auth';
import { coreServiceLocator } from '../../serviceLocator';
import { wrapDefaultDataResponse } from '../../utils';


const registrationManagement = coreServiceLocator.get('registrationManagement');
const userHelper = coreServiceLocator.get('userHelper');


const registerAndLogInClientHandler = async (req: Request, res) => {
    const userData: any = req.body;

    userData.type = 'customer';

    wrapDefaultDataResponse(res, (async () => {
        const userNode = await registrationManagement.registerAndLogInSwpUser(req, res, userData);
        return userHelper.prepareInternalUserData(req, userNode, null);
    })());
};


const registerStaffHandler = async (req: Request, res) => {
    const userData: any = req.body;

    userData.type = 'staff';
    userData.roles = [];

    wrapDefaultDataResponse(res, (async () => {
        const userNode = await registrationManagement.registerUser(req, userData,
            {enforcePassword: true});

        return userHelper.prepareInternalUserData(req, userNode, null);
    })());
};


const registerAppUserHandler = async (req: Request, res) => {
    const userData = req.body;


    wrapDefaultDataResponse(res, (async () => {
        const registrationSettings: UserRegistrationSettings = req.body['settings'] || {};

        registrationSettings.selfRegistration = registrationSettings?.selfRegistration ?? true;

        const userNode = await registrationManagement.registerAppUser(req, res, userData, registrationSettings);

        return userHelper.prepareInternalUserData(req, userData, null,
            {skipCustomSettings: true});
    })());
};


const registerUserUsingFormHandler = async (req: Request, res) => {
    const userData: any = req.body;

    const registrationData = {
        ...userData,
        generatePassword: true,
        emailValidation: {
            isEmailValid: true,
            isValidationOverridden: true,
        },
    };

    const userNode = await registrationManagement
      .registerUser(req, registrationData, {enforcePassword: true});

    wrapDefaultDataResponse(res, userHelper.prepareInternalUserData(req, userNode, null));
};


module.exports = function(app, callback) {
    app.post('/api/register/swp-client', registerAndLogInClientHandler);
    app.post('/api/register/swp-staff', registerStaffHandler);
    app.post('/api/register/app-user', registerAppUserHandler);
    app.post('/api/registration/form', registerUserUsingFormHandler);

    callback();
};
