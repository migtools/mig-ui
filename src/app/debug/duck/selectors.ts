import { createSelector } from 'reselect';
import { IDebugRef } from './types';
import { getResourceStatus } from './utils';

const debugRefsSelector = (state) => state.debug.debugRefs.map((r) => r);

const getDebugRefsWithStatus = createSelector([debugRefsSelector], (debugRefs): IDebugRef[] => {
  const refsWithStatus = debugRefs.map((ref) => {
    const statusObject = {
      ...getResourceStatus(ref?.data?.object),
    };

    return { ...ref?.data?.object, refName: ref?.data?.name, debugResourceStatus: statusObject };
  });

  return refsWithStatus;
});

export default {
  getDebugRefsWithStatus,
};
