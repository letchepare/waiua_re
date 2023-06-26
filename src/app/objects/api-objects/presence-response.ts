export interface PresencesResponse {
  presences: {
    actor?: string | null;
    basic: string;
    details?: string | null;
    game_name: string;
    game_tag: string;
    location?: string | null;
    msg?: string | null;
    name: string;
    patchline?: string | null;
    pid: string;
    platform?: string | null;
    private: string;
    privateJwt?: object | null;
    product: "valorant" | "league_of_legends";
    /** Player UUID */
    puuid: string;
    region: string;
    resource: string;
    state: "mobile" | "dnd" | "away";
    summary: string;
    /** Milliseconds since epoch */
    time: number;
  }[];
}

export interface PresencePrivate {
  isValid: boolean;
  sessionLoopState: string;
  partyOwnerSessionLoopState: string;
  customGameName: string;
  customGameTeam: string;
  partyOwnerMatchMap: string;
  partyOwnerMatchCurrentTeam: string;
  partyOwnerMatchScoreAllyTeam: number;
  partyOwnerMatchScoreEnemyTeam: number;
  partyOwnerProvisioningFlow: string;
  provisioningFlow: string;
  matchMap: string;
  partyId: string;
  isPartyOwner: boolean;
  partyState: string;
  partyAccessibility: string;
  maxPartySize: number;
  queueId: string;
  partyLFM: boolean;
  partyClientVersion: string;
  partySize: number;
  tournamentId: string;
  rosterId: string;
  partyVersion: string;
  queueEntryTime: string;
  playerCardId: string;
  playerTitleId: string;
  accountLevel: number;
  competitiveTier: number;
  leaderboardPosition: number;
  isIdle: boolean;
}
