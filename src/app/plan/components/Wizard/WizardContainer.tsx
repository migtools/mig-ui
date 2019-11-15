import { withFormik, FormikProps } from 'formik';
import WizardComponent from './WizardComponent';
import planOperations from '../../duck/operations';
import { PlanActions } from '../../duck/actions';
import planSelectors from '../../duck/selectors';
import { connect } from 'react-redux';
import utils from '../../../common/duck/utils';
export interface IFormValues {
  planName: string;
  sourceCluster: string;
  targetCluster: string;
  selectedStorage: string;
  selectedNamespaces: any[];
}
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
  currentPlan: any;
  currentPlanStatus: any;
  startPlanStatusPolling: (planName) => void;
  planUpdateRequest: (values, isRerunPVDiscovery) => void;
  resetCurrentPlan: () => void;
  setCurrentPlan: (plan) => void;
  fetchNamespacesForCluster: () => void;
  getPVResourcesRequest: () => void;
  addPlan: (planValues) => void;
  sourceClusterNamespaces: any[];
  pvResourceList: any[];
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
      values.persistentVolumes = editPlanObj.spec.persistentVolumes || [];
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
})(WizardComponent);

const mapStateToProps = state => {
  const allSourceClusterNamespaces = state.plan.sourceClusterNamespaces;
  const filteredSourceClusterNamespaces = allSourceClusterNamespaces.filter(ns => {
    const rejectedRegex = [
      RegExp('^kube-.*', 'i'),
      RegExp('^openshift-.*', 'i'),
      RegExp('^openshift$', 'i'),
      RegExp('^velero$', 'i'),
      RegExp('^default$', 'i'),
    ];

    // Short circuit the regex check if any of them match a rejected regex and filter it out
    return !rejectedRegex.some(rx => rx.test(ns.metadata.name));
  });

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
    sourceClusterNamespaces: filteredSourceClusterNamespaces,
    isFetchingPVResources: state.plan.isFetchingPVResources,
    isPVError: state.plan.isPVError,
    currentPlan: planSelectors.getCurrentPlan(state),
    currentPlanStatus: state.plan.currentPlanStatus,
    pvResourceList: state.plan.pvResourceList,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    addPlan: (plan) => dispatch(planOperations.addPlan(plan)),
    fetchNamespacesForCluster: clusterName => {
      dispatch(planOperations.fetchNamespacesForCluster(clusterName));
    },
    getPVResourcesRequest: (pvList, clusterName) => dispatch(PlanActions.getPVResourcesRequest(pvList, clusterName)),
    startPlanStatusPolling: (planName) => dispatch(PlanActions.startPlanStatusPolling(planName)),
    planUpdateRequest: (values, isRerunPVDiscovery) =>
      dispatch(PlanActions.planUpdateRequest(values, isRerunPVDiscovery)),
    resetCurrentPlan: () => dispatch(PlanActions.resetCurrentPlan()),
    setCurrentPlan: (plan) => dispatch(PlanActions.setCurrentPlan(plan)),
    updateCurrentPlanStatus: (status) => dispatch(PlanActions.updateCurrentPlanStatus(status)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WizardContainer);
