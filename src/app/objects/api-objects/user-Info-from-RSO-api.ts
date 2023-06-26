export interface userInfoFromRSOApi {
  country: string;
  /** Player UUID */
  sub: string;
  email_verified: boolean;
  player_plocale?: unknown | null;
  /** Milliseconds since epoch */
  country_at: number;
  pw: {
    /** Milliseconds since epoch */
    cng_at: number;
    reset: boolean;
    must_reset: boolean;
  };
  phone_number_verified: boolean;
  account_verified: boolean;
  ppid?: unknown | null;
  federated_identity_providers: string[];
  player_locale: string;
  acct: {
    type: number;
    state: string;
    adm: boolean;
    game_name: string;
    tag_line: string;
    /** Milliseconds since epoch */
    created_at: number;
  };
  age: number;
  jti: string;
  affinity: {
    [x: string]: string;
  };
}
