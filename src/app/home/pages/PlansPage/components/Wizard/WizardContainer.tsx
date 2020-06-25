import { withFormik, FormikErrors } from 'formik';
import WizardComponent from './WizardComponent';
import { PlanActions } from '../../../../../plan/duck/actions';
import planSelectors from '../../../../../plan/duck/selectors';
import { connect } from 'react-redux';
import utils from '../../../../../common/duck/utils';
import { ICurrentPlanStatus } from '../../../../../plan/duck/reducers';
import { IMigHook } from '../../../../../../client/resources/conversions';
import {
  defaultAddEditStatus,
  createAddEditStatus,
  AddEditState,
  AddEditMode,
  IAddEditStatus,
} from '../../../../../common/add_edit_state';
import { ICluster } from '../../../../../cluster/duck/types';
import {
  PvCopyMethod,
  IPlanPersistentVolume,
  IMigPlan,
  IPersistentVolumeResource,
  ISourceClusterNamespace,
  IPlan,
} from '../../../../../plan/duck/types';
import { IStorage } from '../../../../../storage/duck/types';
import { IReduxState } from '../../../../../../reducers';
import { IToken } from '../../../../../token/duck/types';
import { INameNamespaceRef } from '../../../../../common/duck/types';

export interface IFormValues {
  planName: string;
  sourceCluster: string;
  sourceTokenRef: INameNamespaceRef;
  targetCluster: string;
  targetTokenRef: INameNamespaceRef;
  selectedStorage: string;
  selectedNamespaces: string[];
  persistentVolumes: any[]; // TODO replace this with selections-only version after https://github.com/konveyor/mig-ui/issues/797
  pvStorageClassAssignment: {
    [pvName: string]: {
      name: string;
      provisioner: string;
    };
  };
  pvVerifyFlagAssignment: {
    [pvName: string]: boolean;
  };
  pvCopyMethodAssignment: {
    [pvName: string]: PvCopyMethod;
  };
}

export interface IOtherProps {
  clusterList: ICluster[];
  planList: IPlan[];
  storageList: IStorage[];
  tokenList: IToken[];
  isFetchingPVList: boolean;
  isPVPolling: boolean;
  isPollingStatus: boolean;
  isPVError: boolean;
  isCheckingPlanStatus: boolean;
  isFetchingPVResources: boolean;
  isFetchingNamespaceList: boolean;
  isOpen: boolean;
  isPollingStorage: boolean;
  isPollingClusters: boolean;
  isPollingPlans: boolean;
  currentPlan: IMigPlan;
  currentPlanStatus: ICurrentPlanStatus;
  startPlanStatusPolling: (planName) => void;
  stopPlanStatusPolling: (planName) => void;
  pvUpdatePollStop: () => void;
  validatePlanRequest: (values) => void;
  pvDiscoveryRequest: (values) => void;
  resetCurrentPlan: () => void;
  setCurrentPlan: (plan) => void;
  fetchNamespacesRequest: (clusterName) => void;
  getPVResourcesRequest: (
    persistentVolumes: IPlanPersistentVolume[],
    sourceClusterName: IFormValues['sourceCluster']
  ) => void;
  fetchHooksRequest: (currentPlanHooks) => void;
  addPlanRequest: (migPlan) => void;
  sourceClusterNamespaces: ISourceClusterNamespace[];
  pvResourceList: IPersistentVolumeResource[];
  onHandleWizardModalClose: () => void;
  editPlanObj?: IMigPlan;
  isEdit: boolean;
  updateCurrentPlanStatus: (currentPlanStatus: ICurrentPlanStatus) => void;
  addHookRequest: (migHook: IMigHook) => void;
  updateHookRequest: (migHook: IMigHook) => void;
  removeHookRequest: (hookName, migrationStep) => void;
  migHookList: IMigHook[];
  isFetchingHookList: boolean;
  watchHookAddEditStatus: () => void;
  hookAddEditStatus: IAddEditStatus;
  cancelAddEditWatch: () => void;
  resetAddEditState: () => void;
  validatePlanPollStop: () => void;
}

const WizardContainer = withFormik<IOtherProps, IFormValues>({
  mapPropsToValues: ({ editPlanObj, isEdit }) => {
    const values: IFormValues = {
      planName: '',
      sourceCluster: null,
      sourceTokenRef: null,
      targetCluster: null,
      targetTokenRef: null,
      selectedNamespaces: [],
      selectedStorage: null,
      persistentVolumes: [],
      pvStorageClassAssignment: {},
      pvVerifyFlagAssignment: {},
      pvCopyMethodAssignment: {},
    };
    if (editPlanObj && isEdit) {
      values.planName = editPlanObj.metadata.name || '';
      values.sourceCluster = editPlanObj.spec.srcMigClusterRef.name || null;
      values.targetCluster = editPlanObj.spec.destMigClusterRef.name || null;
      values.selectedNamespaces = editPlanObj.spec.namespaces || [];
      values.selectedStorage = editPlanObj.spec.migStorageRef.name || null;
      // TODO need to look into this closer, but it was resetting form values after pv discovery is run & messing with the UI state
      // See https://github.com/konveyor/mig-ui/issues/797
      // values.persistentVolumes = editPlanObj.spec.persistentVolumes || [];
    }

    return values;
  },

  validate: (values, props) => {
    const errors: any = {}; // TODO figure out why using FormikErrors<IFormValues> here causes type errors below

    if (!values.planName) {
      errors.planName = 'Required';
    } else if (!utils.testDNS1123(values.planName)) {
      errors.planName = utils.DNS1123Error(values.planName);
    } else if (props.planList.some((plan) => plan.MigPlan.metadata.name === values.planName)) {
      errors.planName =
        'A plan with that name already exists. Enter a unique name for the migration plan.';
    }
    if (!values.sourceCluster) {
      errors.sourceCluster = 'Required';
    }
    if (!values.sourceTokenRef) {
      errors.sourceTokenRef = 'Required';
    }
    if (!values.selectedNamespaces || values.selectedNamespaces.length === 0) {
      errors.selectedNamespaces = 'Required';
    }
    if (!values.targetCluster) {
      errors.targetCluster = 'Required';
    }
    if (!values.targetTokenRef) {
      errors.targetTokenRef = 'Required';
    }
    if (!values.selectedStorage) {
      errors.selectedStorage = 'Required';
    }
    return errors;
  },

  handleSubmit: () => {
    return null;
  },
  validateOnBlur: false,
  enableReinitialize: true,
})(WizardComponent);

const mapStateToProps = (state: IReduxState) => {
  return {
    planName: '',
    sourceCluster: null,
    targetCluster: null,
    selectedNamespaces: [],
    selectedStorage: '',
    persistentVolumes: [],
    isPVPolling: state.plan.isPVPolling,
    isPollingPlans: state.plan.isPolling,
    isPollingClusters: state.cluster.isPolling,
    isPollingStorage: state.storage.isPolling,
    isPollingStatus: state.plan.isPollingStatus,
    isFetchingNamespaceList: state.plan.isFetchingNamespaceList,
    sourceClusterNamespaces: planSelectors.getFilteredNamespaces(state),
    isFetchingPVResources: state.plan.isFetchingPVResources,
    isPVError: state.plan.isPVError,
    currentPlan: planSelectors.getCurrentPlanWithStatus(state),
    currentPlanStatus: state.plan.currentPlanStatus,
    pvResourceList: state.plan.pvResourceList,
    hookList: planSelectors.getHooks(state),
    isFetchingHookList: state.plan.isFetchingHookList,
    hookAddEditStatus: state.plan.hookAddEditStatus,
    migHookList: state.plan.migHookList,
    tokenList: state.token.tokenList, // NATODO do we also need to bring in fetch/polling stuff for tokens to the wizard?
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addPlanRequest: (migPlan) => dispatch(PlanActions.addPlanRequest(migPlan)),
    fetchNamespacesRequest: (clusterName) =>
      dispatch(PlanActions.namespaceFetchRequest(clusterName)),
    getPVResourcesRequest: (pvList, clusterName) =>
      dispatch(PlanActions.getPVResourcesRequest(pvList, clusterName)),
    startPlanStatusPolling: (planName: string) =>
      dispatch(PlanActions.startPlanStatusPolling(planName)),
    stopPlanStatusPolling: (planName: string) =>
      dispatch(PlanActions.stopPlanStatusPolling(planName)),
    addHookRequest: (migHook) => dispatch(PlanActions.addHookRequest(migHook)),
    fetchHooksRequest: (currentPlanHooks) =>
      dispatch(PlanActions.hookFetchRequest(currentPlanHooks)),
    validatePlanRequest: (values) => dispatch(PlanActions.validatePlanRequest(values)),
    pvDiscoveryRequest: (values) => dispatch(PlanActions.pvDiscoveryRequest(values)),
    resetCurrentPlan: () => dispatch(PlanActions.resetCurrentPlan()),
    setCurrentPlan: (plan) => dispatch(PlanActions.setCurrentPlan(plan)),
    updateCurrentPlanStatus: (status) => dispatch(PlanActions.updateCurrentPlanStatus(status)),
    pvUpdatePollStop: () => dispatch(PlanActions.pvUpdatePollStop()),
    watchHookAddEditStatus: (hookName) => {
      // Push the add edit status into watching state, and start watching
      dispatch(
        PlanActions.setHookAddEditStatus(
          createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
        )
      );
      dispatch(PlanActions.watchHookAddEditStatus(hookName));
    },
    cancelAddEditWatch: () => dispatch(PlanActions.cancelWatchHookAddEditStatus()),
    resetAddEditState: () => {
      dispatch(PlanActions.setHookAddEditStatus(defaultAddEditStatus()));
    },
    removeHookRequest: (name, migrationStep) =>
      dispatch(PlanActions.removeHookRequest(name, migrationStep)),
    updateHookRequest: (migHook) => dispatch(PlanActions.updateHookRequest(migHook)),
    validatePlanPollStop: () => dispatch(PlanActions.validatePlanPollStop()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardContainer);
