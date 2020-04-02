import { withFormik, FormikProps } from 'formik';
import WizardComponent from './WizardComponent';
import { PlanActions } from '../../duck/actions';
import planSelectors from '../../duck/selectors';
import { connect } from 'react-redux';
import utils from '../../../common/duck/utils';
import { IPlan, IPlanPersistentVolume, IPersistentVolumeResource, ISourceClusterNamespace } from './types';
import { ICurrentPlanStatus } from '../../duck/reducers';
export interface IFormValues {
  planName: string;
  sourceCluster: string;
  targetCluster: string;
  selectedStorage: string;
  selectedNamespaces: any[];
  persistentVolumes: any[]; // TODO replace this with selections-only version after refactor
}

// TODO add more specific types instead of using `any`
export interface IOtherProps {
  clusterList: any[];
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
  planUpdateRequest: (values, isRerunPVDiscovery) => void;
  resetCurrentPlan: () => void;
  setCurrentPlan: (plan) => void;
  fetchNamespacesRequest: (clusterName) => void;
  getPVResourcesRequest: (
    persistentVolumes: IPlanPersistentVolume[],
    sourceClusterName: IFormValues['sourceCluster']
  ) => void;
  addPlanRequest: (migPlan) => void;
  sourceClusterNamespaces: ISourceClusterNamespace[];
  pvResourceList: IPersistentVolumeResource[];
  onHandleWizardModalClose: () => void;
  editPlanObj?: any;
  isEdit: boolean;
  updateCurrentPlanStatus: any;
}

const WizardContainer = withFormik<IOtherProps, IFormValues>({
  mapPropsToValues: ({ editPlanObj, isEdit }) => {
    const values = {
      planName: '',
      sourceCluster: null,
      targetCluster: null,
      selectedNamespaces: [],
      selectedStorage: null,
      persistentVolumes: [],
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

  validate: values => {
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

const mapStateToProps = state => {
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
    currentPlan: planSelectors.getCurrentPlan(state),
    currentPlanStatus: state.plan.currentPlanStatus,
    pvResourceList: state.plan.pvResourceList,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    addPlanRequest: migPlan => dispatch(PlanActions.addPlanRequest(migPlan)),
    fetchNamespacesRequest: clusterName => dispatch(PlanActions.namespaceFetchRequest(clusterName)),
    getPVResourcesRequest: (pvList, clusterName) =>
      dispatch(PlanActions.getPVResourcesRequest(pvList, clusterName)),
    startPlanStatusPolling: (planName: string) =>
      dispatch(PlanActions.startPlanStatusPolling(planName)),
    stopPlanStatusPolling: (planName: string) =>
      dispatch(PlanActions.stopPlanStatusPolling(planName)),
    planUpdateRequest: (values, isRerunPVDiscovery) =>
      dispatch(PlanActions.planUpdateRequest(values, isRerunPVDiscovery)),
    resetCurrentPlan: () => dispatch(PlanActions.resetCurrentPlan()),
    setCurrentPlan: plan => dispatch(PlanActions.setCurrentPlan(plan)),
    updateCurrentPlanStatus: status => dispatch(PlanActions.updateCurrentPlanStatus(status)),
    pvUpdatePollStop: () => dispatch(PlanActions.pvUpdatePollStop()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardContainer);
