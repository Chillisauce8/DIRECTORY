import { CoreServiceLocator } from '../serviceLocator';
import type { UserNode } from '../auth/user-data.interfaces';


export class UserHelper {
  constructor(private coreServiceLocator: CoreServiceLocator) {}

  readonly EVER_LOGGED_IN_USER_COOKIE_NAME = 'everLoggedInUsers';

  getEverLoggedInUser(req: Request): Array<string> {
    const cookieValue = req['cookies'][this.EVER_LOGGED_IN_USER_COOKIE_NAME];
    return cookieValue ? JSON.parse(cookieValue) : [];
  }

  setEverLoggedInUserCookie(req: Request, res, user) {
    const userId = user._doc;
    const usersList = this.getEverLoggedInUser(req);

    if (usersList.indexOf(userId) !== -1) {
      return;
    }

    usersList.push(userId);

    res.cookie(this.EVER_LOGGED_IN_USER_COOKIE_NAME, JSON.stringify(usersList), {
      maxAge: 100 * 365 * 24 * 60 * 60 * 1000, // 100 years
      httpOnly: true
    });
  }

  getCurrentUserEverLoggedIn(req: Request) {
    let everLoggedInUsers = this.getEverLoggedInUser(req);

    if (!everLoggedInUsers || !everLoggedInUsers.length) {
      return;
    }

    return everLoggedInUsers[everLoggedInUsers.length - 1];
  }

  //synchronous function to get current user data from request
  getCurrentUserSync(req: Request) {
    return req['userDetails'];
  }

  getCurrentUserIdSync(req: Request): string {
    return req['userDetails']?.id;
  }

  isUserCustomer(user: UserNode) {
    return user.type === 'customer';
  }

  getUserTypeString(user: UserNode) {
    if (!user) {
      return 'auto';
    }

    return user.type;
  }

  correctUserNameFields(user: UserNode) {
    user.firstName = this.nameToTitleCase(user.firstName.trim());
    user.lastName = this.nameToTitleCase(user.lastName.trim());
  }

  public async needToLogSessionForUser(...args): Promise<boolean> {
    // TODO: need to implement the method
    return false;
  }

  private nameToTitleCase(name: string): string {
    return name.replace(/[A-Za-z]+[\S\-\.$]{1}/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}


