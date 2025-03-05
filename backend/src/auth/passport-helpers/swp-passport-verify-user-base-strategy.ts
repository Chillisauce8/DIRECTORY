

export interface PassportBaseStrategyConfig<UserType, AuthData> {
    verifyUserStrategy: PassportVerifyUserBaseStrategy<UserType, AuthData>;
}


export interface PassportVerifyUserStrategyBaseConfig {
}


export interface VerifyUserError {
    [additionalField: string]: any;
    reason: number;
    message: string;
    userId?: string;
}


export abstract class PassportVerifyUserBaseStrategy<User extends unknown, AuthData extends unknown> {
    protected constructor(protected config: PassportVerifyUserStrategyBaseConfig) {}

    protected abstract findUser(req: Request, authData: AuthData): Promise<any>;
    protected abstract verifyUserSignInIsAllowed(req: Request, userData: User): Promise<boolean>;
    protected abstract getUserNotFoundError(): VerifyUserError;
    protected abstract getUserSignInDisallowedError(userId: string): VerifyUserError;

    public abstract verify(req: Request, authData: AuthData): Promise<any>;
}
