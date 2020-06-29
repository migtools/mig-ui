import { IReduxState } from '../../../reducers';

const tenantNamespacesSelector = (state: IReduxState) => state.auth.tenantNamespaceList;

export default {
  tenantNamespacesSelector,
};
