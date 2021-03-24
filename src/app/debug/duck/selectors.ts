import { createSelector } from 'reselect';
import { getResourceStatus } from './utils';

const debugRefsSelector = (state) => state.debug.debugRefs.map((r) => r);

const getDebugRefsWithStatus = createSelector([debugRefsSelector], (debugRefs) => {
  const refsWithStatus = debugRefs.map((ref) => {
    const statusObject = {
      ...getResourceStatus(ref?.data?.object),
      // ...filterDebugConditions(ref.status.conditions || []),
    };

    return { ...ref?.data?.object, DebugStatus: statusObject };
  });

  return refsWithStatus;
});

export default {
  getDebugRefsWithStatus,
};
