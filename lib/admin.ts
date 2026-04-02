export const ADMIN_EMAIL = '02230295.cst@rub.edu.bt'

export function isAdminEmail(emails: string[]): boolean {
  return emails.includes(ADMIN_EMAIL)
}
