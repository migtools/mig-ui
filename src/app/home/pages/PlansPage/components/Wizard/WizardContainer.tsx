import React, { useEffect } from 'react';
import WizardComponent from './WizardComponent';
import { PlanActions } from '../../../../../plan/duck/actions';
import planSelectors from '../../../../../plan/duck/selectors';
import { connect, useDispatch } from 'react-redux';
import { ICurrentPlanStatus, setCurrentPlan } from '../../../../../plan/duck/reducers';
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
  IMigPlanStorageClass,
} from '../../../../../plan/duck/types';
import { IStorage } from '../../../../../storage/duck/types';
import {
  IEditedNamespaceMap,
  IEditedPVsMap,
  INameNamespaceRef,
} from '../../../../../common/duck/types';
import WizardFormik from './WizardFormik';
import { IMigHook } from '../../../HooksPage/types';
import { DefaultRootState } from '../../../../../../configureStore';
import { OptionWithValue } from '../../../../../common/components/SimpleSelect';
const _ = require('lodash');

export interface IFormValues {
  planName: string;
  migrationType: OptionWithValue;
  sourceCluster: string;
  sourceTokenRef: INameNamespaceRef;
  targetCluster: string;
  targetTokenRef: INameNamespaceRef;
  selectedStorage: string;
  selectedNamespaces: string[];
  selectedPVs: any[];
  editedNamespaces: IEditedNamespaceMap[];
  editedPVs: IEditedPVsMap[];
  persistentVolumes: IPlanPersistentVolume[];
  pvStorageClassAssignment: {
    [pvName: string]: IMigPlanStorageClass;
  };
  pvVerifyFlagAssignment: {
    [pvName: string]: boolean;
  };
  pvCopyMethodAssignment: {
    [pvName: string]: PvCopyMethod;
  };
  indirectImageMigration?: boolean;
  indirectVolumeMigration?: boolean;
  currentTargetNamespaceName?: {
    name: string;
    srcName: string;
    id: string;
  };
  currentTargetPVCName?: {
    name: string;
    srcPVName: string;
  };
}

export interface IOtherProps {
  clusterList?: ICluster[];
  planList?: IPlan[];
  storageList?: IStorage[];
  isFetchingPVList?: boolean;
  isPVPolling?: boolean;
  isPollingStatus?: boolean;
  isPVError?: boolean;
  isCheckingPlanStatus?: boolean;
  isFetchingPVResources?: boolean;
  isFetchingNamespaceList?: boolean;
  isOpen?: boolean;
  isPollingStorage?: boolean;
  isPollingClusters?: boolean;
  isPollingPlans?: boolean;
  currentPlan?: IMigPlan;
  currentPlanStatus?: ICurrentPlanStatus;
  startPlanStatusPolling?: (planName: string) => void;
  stopPlanStatusPolling?: (planName: string) => void;
  pvUpdatePollStop?: () => void;
  validatePlanRequest?: (values: any) => void;
  pvDiscoveryRequest?: (values: any) => void;
  resetCurrentPlan?: () => void;
  setCurrentPlan?: (plan: IMigPlan) => void;
  fetchNamespacesRequest?: (clusterName: string) => void;
  getPVResourcesRequest?: (
    persistentVolumes: IPlanPersistentVolume[],
    sourceClusterName: IFormValues['sourceCluster']
  ) => void;
  fetchPlanHooksRequest?: () => void;
  addPlanRequest?: (migPlan: any) => void;
  addAnalyticRequest?: (planName: string) => void;
  sourceClusterNamespaces?: ISourceClusterNamespace[];
  pvResourceList?: IPersistentVolumeResource[];
  onHandleWizardModalClose?: () => void;
  editPlanObj?: IMigPlan;
  isEdit?: boolean;
  updateCurrentPlanStatus?: (currentPlanStatus: ICurrentPlanStatus) => void;
  addHookRequest?: (migHook: IMigHook) => void;
  updateHookRequest?: (migHook: IMigHook) => void;
  removeHookFromPlanRequest?: (hookName: string, migrationStep: any) => void;
  associateHookToPlan?: (hookvalues: any, migHook: IMigHook) => void;
  currentPlanHooks?: IMigHook[];
  allHooks?: IMigHook[];
  isFetchingHookList?: boolean;
  isUpdatingGlobalHookList?: boolean;
  isAssociatingHookToPlan?: boolean;
  watchHookAddEditStatus?: () => void;
  hookAddEditStatus?: IAddEditStatus;
  cancelAddEditWatch?: () => void;
  resetAddEditState?: () => void;
  validatePlanPollStop?: () => void;
}

export const defaultInitialValues: IFormValues = {
  planName: '',
  sourceCluster: null,
  sourceTokenRef: null,
  targetCluster: null,
  targetTokenRef: null,
  editedNamespaces: [],
  selectedNamespaces: [],
  selectedPVs: [],
  selectedStorage: null,
  persistentVolumes: [],
  editedPVs: [],
  pvStorageClassAssignment: {},
  pvVerifyFlagAssignment: {},
  pvCopyMethodAssignment: {},
  migrationType: { value: '', toString: () => '' },
  currentTargetPVCName: null,
};

const WizardContainer: React.FunctionComponent<IOtherProps> = (props: IOtherProps) => {
  const { editPlanObj, isEdit, planList, sourceClusterNamespaces, isOpen } = props;

  const getMigrationType = (type: string): OptionWithValue<string> => {
    switch (type) {
      case 'full':
        return {
          value: 'full',
          toString: () =>
            'Full migration - migrate namespaces, persistent volumes (PVs) and Kubernetes resources from one cluster to another',
        };
      case 'state':
        return {
          value: 'state',
          toString: () =>
            'State migration - migrate only PVs and Kubernetes resources between namespaces in the same cluster or different clusters',
        };
      case 'scc':
        return {
          value: 'scc',
          toString: () =>
            'Storage class conversion - convert PVs to a different storage class within the same cluster and namespace',
        };

      default:
        return;
    }
  };
  const initialValues = { ...defaultInitialValues };
  if (editPlanObj && isEdit && isOpen) {
    let pvStorageClassAssignment = {};
    const migPlanPvs = editPlanObj.spec.persistentVolumes;
    if (migPlanPvs) {
      const storageClasses = editPlanObj?.status?.destStorageClasses || [];
      pvStorageClassAssignment = migPlanPvs.reduce((assignedScs, pv) => {
        const suggestedStorageClass = storageClasses.find(
          (sc) => (sc !== '' && sc.name) === pv.selection.storageClass
        );
        return {
          ...assignedScs,
          [pv.name]: suggestedStorageClass ? suggestedStorageClass : '',
        };
      }, {});
      initialValues.pvStorageClassAssignment = pvStorageClassAssignment;
    }

    initialValues.migrationType =
      editPlanObj.metadata.annotations &&
      getMigrationType(
        editPlanObj.metadata.annotations['migration.openshift.io/selected-migplan-type']
      );
    initialValues.planName = editPlanObj.metadata.name || '';
    initialValues.sourceCluster = editPlanObj.spec.srcMigClusterRef.name || null;
    initialValues.targetCluster = editPlanObj.spec.destMigClusterRef.name || null;
    const editedNamespaces: IEditedNamespaceMap[] = [];
    const editedPVs: IEditedPVsMap[] = [];
    const mappedNamespaces = editPlanObj?.spec?.namespaces
      ? editPlanObj.spec.namespaces.map((ns) => {
          const includesMapping = ns.includes(':');
          if (includesMapping) {
            const mappedNsArr = ns.split(':');
            const associatedSrcNamespace = sourceClusterNamespaces.find(
              (srcNS) => mappedNsArr[0] === srcNS.name
            );
            editedNamespaces.push({
              oldName: mappedNsArr[0],
              newName: mappedNsArr[1],
              id: associatedSrcNamespace?.id || '',
            });
            return mappedNsArr[0];
          } else {
            return ns;
          }
        })
      : [];
    initialValues.selectedNamespaces = mappedNamespaces || [];

    //Initial selected PVs are set those with copy or move actions set
    const mappedPVs =
      editPlanObj?.spec?.persistentVolumes &&
      editPlanObj?.spec?.persistentVolumes
        .filter((pv) => pv.selection.action === 'copy' || pv.selection.action === 'move')
        .map((pv) => pv.name);

    initialValues.selectedPVs = mappedPVs || [];
    const isIntraClusterPlan =
      editPlanObj.spec.destMigClusterRef.name === editPlanObj.spec.srcMigClusterRef.name;

    const filteredPlanPVs =
      editPlanObj.spec?.persistentVolumes?.filter((pv) => pv.selection.action !== 'move') || [];
    if (isIntraClusterPlan) {
      const newEditedPVs = filteredPlanPVs.map((pv, index) => {
        const sourcePVCName = pv.pvc.name;
        const includesMapping = sourcePVCName?.includes(':');
        const mappedPVCNameArr = includesMapping && sourcePVCName?.split(':');

        return {
          oldPVCName: includesMapping ? mappedPVCNameArr[0] : pv.pvc.name,
          newPVCName: includesMapping
            ? `${mappedPVCNameArr[0]}-${_.uniqueId()}`
            : `${pv.pvc.name}-${_.uniqueID()}`,
          pvName: pv.name,
        };
      });
      initialValues.editedPVs = newEditedPVs;
    }

    initialValues.editedPVs = editedPVs || [];

    initialValues.editedNamespaces = editedNamespaces || [];
    initialValues.selectedStorage = editPlanObj.spec.migStorageRef.name || null;
    initialValues.targetTokenRef = editPlanObj.spec.destMigTokenRef || null;
    initialValues.sourceTokenRef = editPlanObj.spec.srcMigTokenRef || null;
    // Only set initial plan values for DIM/DVM if property exists on the plan spec.
    // If the value doesn't exist on the spec, this means it was set to false & has disappeared from the spec.
    if (editPlanObj.spec.hasOwnProperty('indirectImageMigration')) {
      initialValues.indirectImageMigration = editPlanObj.spec.indirectImageMigration;
    }
    if (editPlanObj.spec.hasOwnProperty('indirectVolumeMigration')) {
      initialValues.indirectVolumeMigration = editPlanObj.spec.indirectVolumeMigration;
    }

    // TODO need to look into this closer, but it was resetting form values after pv discovery is run & messing with the UI state
    // See https://github.com/konveyor/mig-ui/issues/797
    initialValues.persistentVolumes = editPlanObj.spec.persistentVolumes || [];
  }
  return (
    <WizardFormik
      initialValues={initialValues}
      isEdit={isEdit}
      planList={planList}
      sourceClusterNamespaces={sourceClusterNamespaces}
    >
      <WizardComponent {...props} />
    </WizardFormik>
  );
};

const mapStateToProps = (state: DefaultRootState): any => {
  return {
    planName: '',
    sourceCluster: null,
    targetCluster: null,
    editedNamespaces: [],
    selectedNamespaces: [],
    selectedPVs: [],
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
    allHooks: planSelectors.getHooksWithStatus(state),
    currentPlanHooks: state.plan.currentPlanHooks,
    isFetchingHookList: state.plan.isFetchingHookList,
    isUpdatingGlobalHookList: state.plan.isUpdatingGlobalHookList,
    isAssociatingHookToPlan: state.plan.isAssociatingHookToPlan,
    hookAddEditStatus: state.plan.hookAddEditStatus,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    addPlanRequest: (migPlan: IPlan) => dispatch(PlanActions.addPlanRequest(migPlan)),
    addAnalyticRequest: (planName: string) => dispatch(PlanActions.addAnalyticRequest(planName)),
    fetchNamespacesRequest: (clusterName: string) =>
      dispatch(PlanActions.namespaceFetchRequest(clusterName)),
    getPVResourcesRequest: (pvList: any, clusterName: string) =>
      dispatch(PlanActions.getPVResourcesRequest(pvList, clusterName)),
    startPlanStatusPolling: (planName: string) =>
      dispatch(PlanActions.startPlanStatusPolling(planName)),
    stopPlanStatusPolling: (planName: string) =>
      dispatch(PlanActions.stopPlanStatusPolling(planName)),
    addHookRequest: (migHook: IMigHook) => dispatch(PlanActions.addHookRequest(migHook)),
    fetchPlanHooksRequest: () => dispatch(PlanActions.fetchPlanHooksRequest()),
    validatePlanRequest: (values: any) => dispatch(PlanActions.validatePlanRequest(values)),
    pvDiscoveryRequest: (values: any) => dispatch(PlanActions.pvDiscoveryRequest(values)),
    resetCurrentPlan: () => dispatch(PlanActions.resetCurrentPlan()),
    setCurrentPlan: (plan: IMigPlan) => dispatch(PlanActions.setCurrentPlan(plan)),
    updateCurrentPlanStatus: (status: any) => dispatch(PlanActions.updateCurrentPlanStatus(status)),
    pvUpdatePollStop: () => dispatch(PlanActions.pvUpdatePollStop()),
    watchHookAddEditStatus: (hookName: string) => {
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
    removeHookFromPlanRequest: (name: string, migrationStep: any) =>
      dispatch(PlanActions.removeHookFromPlanRequest(name, migrationStep)),
    updateHookRequest: (migHook: IMigHook) => dispatch(PlanActions.updateHookRequest(migHook)),
    associateHookToPlan: (hookValues: any, migHook: IMigHook) =>
      dispatch(PlanActions.associateHookToPlan(hookValues, migHook)),
    validatePlanPollStop: () => dispatch(PlanActions.validatePlanPollStop()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardContainer);
