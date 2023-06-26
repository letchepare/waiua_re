export interface ValApiCompetitiveTierResponse {
  status: number;
  data: {
    uuid: string;
    assetObjectName: string;
    tiers: TierInformation[];
  }[];
}

export interface TierInformation {
  tier: number;
  tierName: string;
  division: string;
  divisionName: string;
  color: string;
  backgroundColor: string;
  smallIcon: string;
  largeIcon: string;
  rankTriangleDownIcon: string;
  rankTriangleUpIcon: string;
}
