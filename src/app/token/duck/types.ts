import { INameNamespaceRef } from '../../common/duck/types';

export interface IMigToken {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
  };
  spec: {
    migClusterRef: INameNamespaceRef;
    migrationControllerRef?: INameNamespaceRef;
    secretRef: INameNamespaceRef;
  };
  status: {
    observedDigest: string;
    type: string;
    expiresAt: string;
  };
}

export interface IToken {
  MigToken: IMigToken;
  // NATODO what else?
}
