import { withFormik } from 'formik';
import WizardComponent from './WizardComponent';
import { PlanActions } from '../../duck/actions';
import planSelectors from '../../duck/selectors';
import { connect } from 'react-redux';
import utils from '../../../common/duck/utils';
import {
  IPlan,
  IPlanPersistentVolume,
  IPersistentVolumeResource,
  ISourceClusterNamespace,
  ICluster,
  PvCopyMethod,
} from './types';
import { ICurrentPlanStatus } from '../../duck/reducers';
import { IMigHook } from '../../../../client/resources/conversions';
import {
  defaultAddEditStatus,
  createAddEditStatus,
  AddEditState,
  AddEditMode,
  isAddEditButtonDisabled,
} from '../../../common/add_edit_state';

export interface IFormValues {
  planName: string;
  sourceCluster: string;
  targetCluster: string;
  selectedStorage: string;
  selectedNamespaces: string[];
  persistentVolumes: any[]; // TODO replace this with selections-only version after refactor
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

// TODO add more specific types instead of using `any`
export interface IOtherProps {
  clusterList: {
    MigCluster: ICluster;
    [key: string]: any;
  }[];
  planList: any[];
  storageList: any[];
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
  currentPlan: IPlan;
  currentPlanStatus: ICurrentPlanStatus;
  startPlanStatusPolling: (planName) => void;
  stopPlanStatusPolling: (planName) => void;
  pvUpdatePollStop: () => void;
  validatePlanRequest: (values) => void;
  planUpdateRequest: (values, isRerunPVDiscovery) => void;
  resetCurrentPlan: () => void;
  setCurrentPlan: (plan) => void;
  fetchNamespacesRequest: (clusterName, pageOffset, pageLimit) => void;
  getPVResourcesRequest: (
    persistentVolumes: IPlanPersistentVolume[],
    sourceClusterName: IFormValues['sourceCluster']
  ) => void;
  fetchHooksRequest: (currentPlanHooks) => void;
  addPlanRequest: (migPlan) => void;
  sourceClusterNamespaces: ISourceClusterNamespace[];
  pvResourceList: IPersistentVolumeResource[];
  onHandleWizardModalClose: () => void;
  editPlanObj?: any;
  isEdit: boolean;
  updateCurrentPlanStatus: any;
  addHookRequest: (migHook: IMigHook) => void;
  updateHookRequest: (migHook: IMigHook) => void;
  removeHookRequest: (hookName, migrationStep) => void;
  migHookList: IMigHook[];
  isFetchingHookList: boolean;
  watchHookAddEditStatus: () => void;
  hookAddEditStatus: any;
  cancelAddEditWatch: () => void;
  resetAddEditState: () => void;
}

const WizardContainer = withFormik<IOtherProps, IFormValues>({
  mapPropsToValues: ({ editPlanObj, isEdit }) => {
    const values: IFormValues = {
      planName: '',
      sourceCluster: null,
      targetCluster: null,
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

  validate: (values) => {
    const errors: any = {};

    if (!values.planName) {
      errors.planName = 'Required';
    } else if (!utils.testDNS1123(values.planName)) {
      errors.planName = utils.DNS1123Error(values.planName);
    }
    if (!values.sourceCluster) {
      errors.sourceCluster = 'Required';
    }
    if (!values.selectedNamespaces || values.selectedNamespaces.length === 0) {
      errors.selectedNamespaces = 'Required';
    }
    if (!values.targetCluster) {
      errors.targetCluster = 'Required';
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

const mapStateToProps = (state) => {
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
    newHookList: state.plan.newHookList,
    isFetchingHookList: state.plan.isFetchingHookList,
    hookAddEditStatus: state.plan.hookAddEditStatus,
    migHookList: state.plan.migHookList,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addPlanRequest: (migPlan) => dispatch(PlanActions.addPlanRequest(migPlan)),
    fetchNamespacesRequest: (clusterName, pageOffset, pageLimit) =>
      dispatch(PlanActions.namespaceFetchRequest(clusterName, pageOffset, pageLimit)),
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
    planUpdateRequest: (values, isRerunPVDiscovery) =>
      dispatch(PlanActions.planUpdateRequest(values, isRerunPVDiscovery)),
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardContainer);
