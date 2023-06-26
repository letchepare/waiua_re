export interface PlayerMMRResponse {
  Version: number;
  /** Player UUID */
  Subject: string;
  NewPlayerExperienceFinished: boolean;
  QueueSkills: {
    [
      x in
        | "competitive"
        | "deathmatch"
        | "ggteam"
        | "newmap"
        | "onefa"
        | "premier"
        | "seeding"
        | "snowball"
        | "spikerush"
        | "swiftplay"
        | "unrated"
    ]: {
      TotalGamesNeededForRating: number;
      TotalGamesNeededForLeaderboard: number;
      CurrentSeasonGamesNeededForRating: number;
      SeasonalInfoBySeasonID: {
        [x: string]: {
          /** Season ID */
          SeasonID: string;
          NumberOfWins: number;
          NumberOfWinsWithPlacements: number;
          NumberOfGames: number;
          Rank: number;
          CapstoneWins: number;
          LeaderboardRank: number;
          CompetitiveTier: number;
          RankedRating: number;
          WinsByTier: {
            [x: string]: number;
          };
          GamesNeededForRating: number;
          TotalWinsNeededForRank: number;
        };
      };
    };
  };
  LatestCompetitiveUpdate: {
    /** Match ID */
    MatchID: string;
    /** Map ID */
    MapID: string;
    /** Season ID */
    SeasonID: string;
    MatchStartTime: number;
    TierAfterUpdate: number;
    TierBeforeUpdate: number;
    RankedRatingAfterUpdate: number;
    RankedRatingBeforeUpdate: number;
    RankedRatingEarned: number;
    RankedRatingPerformanceBonus: number;
    CompetitiveMovement: "MOVEMENT_UNKNOWN";
    AFKPenalty: number;
  };
  IsLeaderboardAnonymized: boolean;
  IsActRankBadgeHidden: boolean;
}
