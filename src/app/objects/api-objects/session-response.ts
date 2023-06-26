export interface SessionsResponse {
  [key: string]: Session;
}

export interface Session {
  exitCode: number;
  exitReason: null;
  isInternal: boolean;
  launchConfiguration: {
    arguments: string[];
    executable: string;
    locale: string | null;
    voiceLocale: null;
    workingDirectory: string;
  };
  patchlineFullName: "VALORANT" | "riot_client";
  patchlineId: "" | "live" | "pbe";
  phase: string;
  productId: "valorant" | "riot_client";
  version: string;
}
