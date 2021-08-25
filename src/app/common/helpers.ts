import { useEffect, useState } from 'react';
import { INameNamespaceRef } from './duck/types';

interface INameNamespaceRefSuperset extends INameNamespaceRef {
  [key: string]: any; // CRD metadata objects which might have more properties than just { name, namespace } are allowed
}

export const isSameResource = (
  metaA: INameNamespaceRefSuperset,
  metaB: INameNamespaceRefSuperset
) => metaA.name === metaB.name && metaA.namespace === metaB.namespace;

export const validatedState = (touchedFieldVal: any, errorsFieldVal: any) => {
  return !(touchedFieldVal && errorsFieldVal) ? 'default' : 'error';
};
interface IDelayedQueryObject {
  name: string;
  row: any;
  fieldName: string;
  functionArgs: Array<any>;
}

export const useDelayValidation = (delayedFunction: any) => {
  const [query, setQuery] = useState<IDelayedQueryObject>({
    name: '',
    row: null,
    fieldName: null,
    functionArgs: null,
  });

  useEffect(() => {
    if ((query.name || query.name === '') && query.row && query.fieldName) {
      if (query.name === '') {
        delayedFunction(...query.functionArgs);
      } else {
        const timeOutId = setTimeout(() => delayedFunction(...query.functionArgs), 500);
        return () => clearTimeout(timeOutId);
      }
    }
  }, [query]);

  return { setQuery, query };
};
