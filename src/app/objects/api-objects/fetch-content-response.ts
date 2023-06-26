export interface FetchContentResponse {
  DisabledIDs: unknown[];
  Seasons: {
    /** UUID */
    ID: string;
    Name: string;
    Type: "episode" | "act";
    /** Date in ISO 8601 format */
    StartTime: string;
    /** Date in ISO 8601 format */
    EndTime: string;
    IsActive: boolean;
  }[];
  Events: {
    /** UUID */
    ID: string;
    Name: string;
    /** Date in ISO 8601 format */
    StartTime: string;
    /** Date in ISO 8601 format */
    EndTime: string;
    IsActive: boolean;
  }[];
}
