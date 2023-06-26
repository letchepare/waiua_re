export interface ValAPIVersionResponse {
  status: number;
  data: {
    manifestId: string;
    branch: string;
    version: string;
    buildVersion: string;
    engineVersion: string;
    riotClientVersion: string;
    riotClientBuild: string;
    buildDate: Date | string;
  };
}
