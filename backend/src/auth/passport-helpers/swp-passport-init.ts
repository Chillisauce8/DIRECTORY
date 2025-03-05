import passport from 'passport';
import {swpPassportLocalStrategyFactory} from './swp-password-local-strategy-factory';


export function initPassport(app: any) {
    const passportLocalStrategy = swpPassportLocalStrategyFactory();

    passport.use('local', passportLocalStrategy);

    app.use(passport.initialize());
}
