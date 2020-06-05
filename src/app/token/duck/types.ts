import { INameNamespaceRef } from '../../common/duck/types';

export interface IMigToken {
  apiVersion: string;
  kind: string;
  metadata: {
    // NATODO
  };
  spec: {
    migClusterRef: INameNamespaceRef;
    migrationControllerRef?: INameNamespaceRef;
    secretRef: INameNamespaceRef;
  };
  status: {
    observedDigest: string;
  };
}

export interface IToken {
  MigToken: IMigToken;
  // NATODO what else?
}
