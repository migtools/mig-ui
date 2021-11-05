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
  const [isFullMigration, setIsFullMigration] = useState(true);

  const { values, touched, errors, resetForm } = useFormikContext<IFormValues>();

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
          isFetchingPVResources={isFetchingPVList}
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

  const onGoToStep: WizardStepFunctionType = ({ id, name }, { prevId, prevName }) => {
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
        });
        addAnalyticRequest(values.planName);
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

    // Remove steps after the currently clicked step
    // if (name === 'General') {
    //   //set migration type here
    //   setIsFirstStep(true);
    // }
    // else if (name === 'Create options' || name === 'Update options') {
    //   // setState({
    //   //   showReviewStep: false,
    //   //   showOptionsStep: false,
    //   // });
    // } else if (name.indexOf('Substep') > -1) {
    //   // setState({
    //   //   showReviewStep: false,
    //   // });
    // }
  };

  const getNextStep = (activeStep: any, callback?: any) => {
    if (activeStep.name === 'General' && values.migrationType.value === 'full') {
      console.log('activeStep is general');
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
    } else if (activeStep.name === 'General' && values.migrationType.value === 'state') {
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
    }
  };

  const getPreviousStep = (activeStep: any, callback: any) => {
    if (activeStep.name === 'General') {
      console.log('activeStep is general');
    }
  };

  const CustomFooter = (
    <WizardFooter>
      <WizardContextConsumer>
        {({ activeStep, goToStepByName, goToStepById, onNext, onBack, onClose }) => {
          const isNextEnabled = () => {
            switch (activeStep.name) {
              case 'General':
                return areFieldsTouchedAndValid([
                  'planName',
                  'sourceCluster',
                  'targetCluster',
                  'selectedStorage',
                ]);
              case 'Namespaces':
                return !errors.selectedNamespaces && !isFetchingNamespaceList;
              case 'Persistent Volumes':
                return (
                  !isFetchingPVList &&
                  currentPlanStatus.state !== 'Pending' &&
                  currentPlanStatus.state !== 'Critical'
                );
              case 'Hooks':
                return !isAddHooksOpen;
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
                // onClick={() => getNextStep(activeStep, onNext)}
                isDisabled={!isNextEnabled()}
              >
                {activeStep.name === 'Review' ? 'Finish' : 'Next'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => getPreviousStep(activeStep, onBack)}
                className={activeStep.name === 'Get Started' ? 'pf-m-disabled' : ''}
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
            // onNext={onMove}
            // onBack={onMove}
            title="Create a migration plan"
            onClose={handleClose}
            steps={steps}
            onSubmit={(event) => event.preventDefault()}
            footer={CustomFooter}
            onGoToStep={onGoToStep}
          />
        </Modal>
      )}
    </React.Fragment>
  );
};

export default WizardComponent;
