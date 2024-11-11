export interface UserNameParts {
  firstName: string;
  lastName: string;
}


export function extractNamePartsFromFullName(fullName?: string): UserNameParts|null {
  if (!fullName) {
    return null;
  }

  const nameParts = fullName.trim().split(' ');

  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  return {firstName, lastName};
}
