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
}

export const useDelayValidation = (delayedFunction: any) => {
  const [query, setQuery] = useState<IDelayedQueryObject>({ name: '', row: null, fieldName: null });

  useEffect(() => {
    const timeOutId = setTimeout(
      () =>
        delayedFunction(query.fieldName, {
          name: query.name,
          srcName: query.row.cells[0],
        }),
      500
    );
    return () => clearTimeout(timeOutId);
  }, [query]);

  return { setQuery, query };

  // return (
  //   <>
  //     <input
  //       type="text"
  //       value={query}
  //       onChange={event => setQuery(event.target.value)}
  //     />
  //     <p>{displayMessage}</p>
  //   </>
  // );
};
