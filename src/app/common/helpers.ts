import { INameNamespaceRef } from './duck/types';

interface INameNamespaceRefSuperset extends INameNamespaceRef {
  [key: string]: any; // CRD metadata objects which might have more properties than just { name, namespace } are allowed
}

export const isSameResource = (
  metaA: INameNamespaceRefSuperset,
  metaB: INameNamespaceRefSuperset
) => metaA.name === metaB.name && metaA.namespace === metaB.namespace;

const LS_KEY_ACTIVE_NAMESPACE = 'activeNamespace';
export const getActiveNamespaceFromStorage = (): string =>
  localStorage.getItem(LS_KEY_ACTIVE_NAMESPACE);
export const setActiveNamespaceInStorage = (namespace: string) =>
  localStorage.setItem(LS_KEY_ACTIVE_NAMESPACE, namespace);

export const validatedState = (touchedFieldVal: any, errorsFieldVal: any) => {
  return !(touchedFieldVal && errorsFieldVal) ? 'default' : 'error';
};
