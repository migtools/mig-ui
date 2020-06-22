export interface IMigMeta {
  clusterApi?: string;
  namespace?: string;
  configNamespace?: string;
  oauth?: {
    clientId?: string;
    redirectUrl?: string;
    userScope?: string;
    clientSecret?: string;
  };
}
