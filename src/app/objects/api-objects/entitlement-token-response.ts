export interface EntitlementsTokenResponse {
  /** Used as the token in requests */
  accessToken: string;
  entitlements: unknown[];
  issuer: string;
  /** Player UUID */
  subject: string;
  /** Used as the entitlement in requests */
  token: string;
}
