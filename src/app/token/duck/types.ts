import { INameNamespaceRef, IStatusCondition } from '../../common/duck/types';

// NATODO
//   based on CRD here: https://github.com/konveyor/mig-controller/blob/non-admin/config/crds/migration_v1alpha1_migtoken.yaml#L16
//   some fields (*) are not present in the CRD but needed for our views
//   TODO: make sure they are real and double check the updated CRD later

export interface IMigToken {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string; // NATODO *
    type: string; // NATODO *
    expirationTimestamp?: string; // NATODO *
  };
  spec: {
    migClusterRef: INameNamespaceRef;
    migrationControllerRef?: INameNamespaceRef;
    secretRef: INameNamespaceRef;
  };
  status: {
    conditions: IStatusCondition[]; // NATODO *
    observedDigest: string;
  };
}

export interface IToken {
  MigToken: IMigToken;
  // NATODO what else?
}
