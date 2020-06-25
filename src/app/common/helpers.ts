import { INameNamespaceRef } from './duck/types';

interface INameNamespaceRefSuperset extends INameNamespaceRef {
  [key: string]: any; // CRD metadata objects which might have more properties than just { name, namespace } are allowed
}

export const isSameResource = (
  metaA: INameNamespaceRefSuperset,
  metaB: INameNamespaceRefSuperset
) => metaA.name === metaB.name && metaA.namespace === metaB.namespace;
