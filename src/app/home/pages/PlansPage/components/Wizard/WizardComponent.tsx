import React, { useState, useEffect, useContext } from 'react';
import {
  Button,
  Modal,
  Wizard,
  WizardContextConsumer,
  WizardFooter,
  WizardStepFunctionType,
} from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import NamespacesForm from './NamespacesForm';
import VolumesForm from './VolumesForm';
import CopyOptionsForm from './CopyOptionsForm';
import HooksStep from './HooksStep';
import ResultsStep from './ResultsStep';
import { useFormikContext } from 'formik';
import { IOtherProps, IFormValues } from './WizardContainer';
import { CurrentPlanState } from '../../../../../plan/duck/reducers';
import WizardStepContainer from './WizardStepContainer';
import MigrationOptionsForm from './MigrationOptions/MigrationOptionsForm';

const WizardComponent = (props: IOtherProps) => {
  const [stepIdReached, setStepIdReached] = useState(1);
  const [isAddHooksOpen, setIsAddHooksOpen] = useState(false);

  const { values, touched, errors, resetForm, setFieldValue } = useFormikContext<IFormValues>();

  const {
    clusterList,
    currentPlan,
    currentPlanStatus,
    storageList,
    isOpen,
    isFetchingPVList,
    isFetchingNamespaceList,
    isPVError,
    isPollingStatus,
    fetchNamespacesRequest,
    sourceClusterNamespaces,
    fetchPlanHooksRequest,
    allHooks,
    currentPlanHooks,
    isFetchingHookList,
    isUpdatingGlobalHookList,
    isAssociatingHookToPlan,
    getPVResourcesRequest,
    startPlanStatusPolling,
    stopPlanStatusPolling,
    pvDiscoveryRequest,
    validatePlanRequest,
    pvResourceList,
    addPlanRequest,
    addAnalyticRequest,
    setCurrentPlan,
    resetCurrentPlan,
    onHandleWizardModalClose,
    isEdit,
    editPlanObj,
    updateCurrentPlanStatus,
    pvUpdatePollStop,
    addHookRequest,
    updateHookRequest,
    associateHookToPlan,
    watchHookAddEditStatus,
    hookAddEditStatus,
    cancelAddEditWatch,
    resetAddEditState,
    removeHookFromPlanRequest,
    validatePlanPollStop,
    isFetchingPVResources,
  } = props;

  enum stepId {
    General = 1,
    Namespaces,
    PersistentVolumes,
    StorageClass,
    MigrationOptions,
    Hooks,
    Results,
  }
  const handleClose = () => {
    onHandleWizardModalClose();
    setStepIdReached(stepId.General);
    resetForm();
    resetCurrentPlan();
    stopPlanStatusPolling(values.planName);
    validatePlanPollStop();
    pvUpdatePollStop();
    setShowHooksStep(false);
    setShowMigrationOptionsStep(false);
    setShowNamespacesStep(false);
    setShowPersistentVolumesStep(false);
    setShowStorageClassStep(false);
  };

  const areFieldsTouchedAndValid = (fieldKeys: (keyof IFormValues)[]) =>
    fieldKeys.every((fieldKey) => !errors[fieldKey] && (touched[fieldKey] || isEdit === true));

  const generalStep = {
    id: stepId.General,
    name: 'General',
    component: (
      <WizardStepContainer title="General">
        <GeneralForm clusterList={clusterList} storageList={storageList} isEdit={isEdit} />
      </WizardStepContainer>
    ),
  };
  const namespacesStep = {
    id: stepId.Namespaces,
    name: 'Namespaces',
    component: (
      <WizardStepContainer title="Namespaces">
        <NamespacesForm
          isFetchingNamespaceList={isFetchingNamespaceList}
          fetchNamespacesRequest={fetchNamespacesRequest}
          sourceClusterNamespaces={sourceClusterNamespaces}
        />
      </WizardStepContainer>
    ),
    canJumpTo: stepIdReached >= stepId.Namespaces,
  };
  const persistentVolumesStep = {
    id: stepId.PersistentVolumes,
    name: 'Persistent volumes',
    component: (
      <WizardStepContainer title="Persistent volumes">
        <VolumesForm
          currentPlan={currentPlan}
          isPVError={isPVError}
          getPVResourcesRequest={getPVResourcesRequest}
          pvResourceList={pvResourceList}
          isFetchingPVResources={isFetchingPVResources}
          isFetchingPVList={isFetchingPVList}
          isPollingStatus={isPollingStatus}
          pvDiscoveryRequest={pvDiscoveryRequest}
          currentPlanStatus={currentPlanStatus}
        />
      </WizardStepContainer>
    ),
    canJumpTo: stepIdReached >= stepId.PersistentVolumes,
  };
  const storageClassStep = {
    id: stepId.StorageClass,
    name: 'Copy options',
    component: (
      <WizardStepContainer title="Copy options">
        <CopyOptionsForm
          currentPlan={currentPlan}
          isFetchingPVList={isFetchingPVList}
          clusterList={clusterList}
        />
      </WizardStepContainer>
    ),
    canJumpTo: stepIdReached >= stepId.StorageClass,
  };
  const migrationOptionsStep = {
    id: stepId.MigrationOptions,
    name: 'Migration options',
    component: (
      <WizardStepContainer title="Migration options">
        <MigrationOptionsForm isEdit={isEdit} currentPlan={currentPlan} clusterList={clusterList} />
      </WizardStepContainer>
    ),
    canJumpTo: stepIdReached >= stepId.MigrationOptions,
  };
  const hooksStep = {
    id: stepId.Hooks,
    name: 'Hooks',
    component: (
      <WizardStepContainer title="Hooks">
        <HooksStep
          removeHookFromPlanRequest={removeHookFromPlanRequest}
          addHookRequest={addHookRequest}
          updateHookRequest={updateHookRequest}
          isFetchingHookList={isFetchingHookList}
          isUpdatingGlobalHookList={isUpdatingGlobalHookList}
          isAssociatingHookToPlan={isAssociatingHookToPlan}
          currentPlanHooks={currentPlanHooks}
          allHooks={allHooks}
          fetchPlanHooksRequest={fetchPlanHooksRequest}
          watchHookAddEditStatus={watchHookAddEditStatus}
          hookAddEditStatus={hookAddEditStatus}
          currentPlan={currentPlan}
          isAddHooksOpen={isAddHooksOpen}
          setIsAddHooksOpen={setIsAddHooksOpen}
          associateHookToPlan={associateHookToPlan}
          cancelAddEditWatch={cancelAddEditWatch}
          resetAddEditState={resetAddEditState}
        />
      </WizardStepContainer>
    ),
    canJumpTo: stepIdReached >= stepId.Hooks,
    hideBackButton: isAddHooksOpen,
    hideCancelButton: isAddHooksOpen,
    nextButtonText: 'Finish',
  };
  const resultsStep = {
    id: stepId.Results,
    name: 'Results',
    isFinishedStep: true,
    component: (
      <ResultsStep
        currentPlan={currentPlan}
        currentPlanStatus={currentPlanStatus}
        isPollingStatus={isPollingStatus}
        startPlanStatusPolling={startPlanStatusPolling}
        // onClose={handleClose}
      />
    ),
  };

  const [showNamespacesStep, setShowNamespacesStep] = useState(false);
  const [showPersistentVolumesStep, setShowPersistentVolumesStep] = useState(false);
  const [showStorageClassStep, setShowStorageClassStep] = useState(false);
  const [showMigrationOptionsStep, setShowMigrationOptionsStep] = useState(false);
  const [showHooksStep, setShowHooksStep] = useState(false);
  const [showResultsStep, setShowResultsStep] = useState(false);

  const steps = [
    generalStep,
    ...(showNamespacesStep ? [namespacesStep] : []),
    ...(showPersistentVolumesStep ? [persistentVolumesStep] : []),
    ...(showStorageClassStep ? [storageClassStep] : []),
    ...(showMigrationOptionsStep ? [migrationOptionsStep] : []),
    ...(showHooksStep ? [hooksStep] : []),
    ...(showResultsStep ? [resultsStep] : []),
  ];

  const onMove: WizardStepFunctionType = ({ id, name }, { prevId, prevName }) => {
    pvUpdatePollStop();
    //
    if (stepIdReached < id) {
      setStepIdReached(id as number);
    }

    if (id === stepId.Namespaces && isEdit) {
      setCurrentPlan(editPlanObj);
    }

    if (prevId === stepId.Namespaces && id !== stepId.General) {
      // We must create the plan here so that the controller can evaluate the
      // requested namespaces and discover related PVs

      if (!currentPlan && !isEdit) {
        addPlanRequest({
          planName: values.planName,
          sourceCluster: values.sourceCluster,
          targetCluster: values.targetCluster,
          selectedStorage: values.selectedStorage,
          namespaces: values.selectedNamespaces,
          migrationType: values.migrationType.value,
        });
        addAnalyticRequest(values.planName);
      }
    }
    if (prevId === stepId.PersistentVolumes) {
      //SKIP ALL UNSELECTED PVS
      if (currentPlan !== null && values.persistentVolumes) {
        const newPVs = values.persistentVolumes.map((currentPV, index) => {
          const isSelected = values.selectedPVs.find((selectedPV) => selectedPV === currentPV.name);
          if (!isSelected) {
            return {
              ...currentPV,
              selection: {
                ...currentPV.selection,
                action: 'skip',
              },
            };
          } else {
            //If the PV is selected and the action is not set to move, the PV needs to have a copy action set
            return {
              ...currentPV,
              selection: {
                ...currentPV.selection,
                ...(currentPV.selection.action !== 'move' && {
                  action: 'copy',
                }),
              },
            };
          }
        });
        setFieldValue('persistentVolumes', newPVs);
      }
    }
    if (id === stepId.Results) {
      updateCurrentPlanStatus({ state: CurrentPlanState.Pending });
      //update plan & start status polling on results page
      validatePlanRequest(values);
    }
    if (id === stepId.Hooks) {
      fetchPlanHooksRequest();
    }

    if (prevId === stepId.Hooks && id === stepId.StorageClass) {
      setIsAddHooksOpen(false);
    }
  };

  const getNextStep = (activeStep: any, callback?: any) => {
    if (activeStep.name === 'General' && values.migrationType.value === 'full') {
      setShowNamespacesStep(true);
      setShowPersistentVolumesStep(true);
      setShowResultsStep(true);
      setShowStorageClassStep(true);
      setShowMigrationOptionsStep(true);
      setShowHooksStep(true);
      setTimeout(() => {
        //using set timeout instead of a setState callback. Is there a react friendly way to do this?
        callback();
      });
    } else if (
      activeStep.name === 'General' &&
      (values.migrationType.value === 'scc' || values.migrationType.value === 'state')
    ) {
      setShowNamespacesStep(true);
      setShowPersistentVolumesStep(true);
      setShowStorageClassStep(true);
      setShowMigrationOptionsStep(false);
      setShowHooksStep(false);
      setShowResultsStep(false);
      setTimeout(() => {
        //using set timeout instead of a setState callback. Is there a react friendly way to do this?
        callback();
      });
    } else {
      setTimeout(() => {
        //using set timeout instead of a setState callback. Is there a react friendly way to do this?
        callback();
      });
    }
  };

  const getPreviousStep = (activeStep: any, callback: any) => {
    setTimeout(() => {
      //using set timeout instead of a setState callback. Is there a react friendly way to do this?
      callback();
    });
  };

  const CustomFooter = (
    <WizardFooter>
      <WizardContextConsumer>
        {({ activeStep, goToStepByName, goToStepById, onNext, onBack, onClose }) => {
          const isNextEnabled = () => {
            switch (activeStep.name) {
              case 'General':
                {
                  if (
                    values.migrationType.value === 'full' ||
                    values.migrationType.value == 'state'
                  ) {
                    return areFieldsTouchedAndValid([
                      'planName',
                      'sourceCluster',
                      'targetCluster',
                      'selectedStorage',
                    ]);
                  } else if (values.migrationType.value === 'scc') {
                    return areFieldsTouchedAndValid(['planName', 'sourceCluster']);
                  }
                }
                break;
              case 'Namespaces':
                return !errors.selectedNamespaces && !isFetchingNamespaceList;
              case 'Persistent volumes':
                return (
                  !isFetchingPVList &&
                  currentPlanStatus.state !== 'Pending' &&
                  currentPlanStatus.state !== 'Critical'
                );
              case 'Hooks':
                return !isAddHooksOpen;
              default:
                true;
            }
          };

          return (
            <>
              <Button
                variant="primary"
                type="submit"
                onClick={(event) => {
                  getNextStep(activeStep, onNext);
                }}
                isDisabled={!isNextEnabled()}
              >
                {activeStep.name === 'Review' ? 'Finish' : 'Next'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => getPreviousStep(activeStep, onBack)}
                className={activeStep.name === 'General' ? 'pf-m-disabled' : ''}
              >
                Back
              </Button>
              <Button variant="link" onClick={onClose}>
                Cancel
              </Button>
            </>
          );
        }}
      </WizardContextConsumer>
    </WizardFooter>
  );

  return (
    <React.Fragment>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          width="95%"
          showClose={false}
          hasNoBodyWrapper
          aria-label="wizard-modal-wrapper-id"
        >
          <Wizard
            onNext={onMove}
            onBack={onMove}
            title="Create a migration plan"
            onClose={handleClose}
            footer={CustomFooter}
            steps={steps}
            height={900}
          />
        </Modal>
      )}
    </React.Fragment>
  );
};

export default WizardComponent;
