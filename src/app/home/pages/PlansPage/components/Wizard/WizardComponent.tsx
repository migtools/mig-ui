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
  const [isFirstStep, setIsFirstStep] = useState(false);
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
    enableNext: areFieldsTouchedAndValid([
      'planName',
      'sourceCluster',
      'targetCluster',
      'selectedStorage',
    ]),
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
    enableNext: !errors.selectedNamespaces && !isFetchingNamespaceList,
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
    enableNext:
      !isFetchingPVList &&
      currentPlanStatus.state !== 'Pending' &&
      currentPlanStatus.state !== 'Critical',
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
    enableNext: !isAddHooksOpen,
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
        onClose={handleClose}
      />
    ),
  };

  const onGoToStep: WizardStepFunctionType = ({ id, name }, { prevId, prevName }) => {
    // Remove steps after the currently clicked step
    if (name === 'General') {
      //set migration type here
      setIsFirstStep(true);
    }
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

  const steps = [generalStep];
  // const steps = [
  //   generalStep,
  //   namespacesStep,
  //   persistentVolumesStep,
  //   storageClassStep,
  //   ...(isFullMigration ? [migrationOptionsStep] : []),
  //   ...(isFullMigration ? [hooksStep] : []),
  //   resultsStep,
  // ];

  const onMove: WizardStepFunctionType = (newStep, prevStep) => {
    //stop pv polling when navigating
    pvUpdatePollStop();
    //
    if (stepIdReached < newStep.id) {
      setStepIdReached(newStep.id as number);
    }

    if (newStep.id === stepId.Namespaces && isEdit) {
      setCurrentPlan(editPlanObj);
    }

    if (prevStep.prevId === stepId.Namespaces && newStep.id !== stepId.General) {
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
    if (newStep.id === stepId.Results) {
      updateCurrentPlanStatus({ state: CurrentPlanState.Pending });
      //update plan & start status polling on results page
      validatePlanRequest(values);
    }
    if (newStep.id === stepId.Hooks) {
      fetchPlanHooksRequest();
    }

    if (prevStep.prevId === stepId.Hooks && newStep.id === stepId.StorageClass) {
      setIsAddHooksOpen(false);
    }
  };
  const getNextStep = (activeStep: any, callback: any) => {
    if (activeStep.name === 'Get started') {
      if (getStartedStepRadio === 'Create') {
        this.setState(
          {
            showCreateStep: true,
            showUpdateStep: false,
            showOptionsStep: false,
            showReviewStep: false,
          },
          () => {
            callback();
          }
        );
      } else {
        this.setState(
          {
            showCreateStep: false,
            showUpdateStep: true,
            showOptionsStep: false,
            showReviewStep: false,
          },
          () => {
            callback();
          }
        );
      }
    } else if (activeStep.name === 'Create options' || activeStep.name === 'Update options') {
      this.setState(
        {
          showOptionsStep: true,
          showReviewStep: false,
        },
        () => {
          callback();
        }
      );
    } else if (activeStep.name === 'Substep 3') {
      this.setState(
        {
          showReviewStep: true,
        },
        () => {
          callback();
        }
      );
    } else {
      callback();
    }
  };

  const getPreviousStep = (activeStep, callback) => {
    if (activeStep.name === 'Review') {
      this.setState(
        {
          showReviewStep: false,
        },
        () => {
          callback();
        }
      );
    } else if (activeStep.name === 'Substep 1') {
      this.setState(
        {
          showOptionsStep: false,
        },
        () => {
          callback();
        }
      );
    } else if (activeStep.name === 'Create options') {
      this.setState(
        {
          showCreateStep: false,
        },
        () => {
          callback();
        }
      );
    } else if (activeStep.name === 'Update options') {
      this.setState(
        {
          showUpdateStep: false,
        },
        () => {
          callback();
        }
      );
    } else {
      callback();
    }
  };

  const CustomFooter = (
    <WizardFooter>
      <WizardContextConsumer>
        {({ activeStep, goToStepByName, goToStepById, onNext, onBack, onClose }) => {
          return (
            <>
              <Button
                variant="primary"
                type="submit"
                onClick={() => getNextStep(activeStep, onNext)}
              >
                {activeStep.name === 'Review' ? 'Finish' : 'Next'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => this.getPreviousStep(activeStep, onBack)}
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
