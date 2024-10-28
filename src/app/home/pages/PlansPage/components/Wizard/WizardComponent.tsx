import {
  Button,
  Modal,
  Wizard,
  WizardContextConsumer,
  WizardFooter,
  WizardStepFunctionType,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DefaultRootState } from '../../../../../../configureStore';
import { clusterSelectors } from '../../../../../cluster/duck';
import { PlanActions } from '../../../../../plan/duck';
import { storageSelectors } from '../../../../../storage/duck';
import CopyOptionsForm from './CopyOptionsForm';
import GeneralForm from './GeneralForm';
import HooksStep from './HooksStep';
import LiveMigrationForm from './LiveMigrationForm';
import MigrationOptionsForm from './MigrationOptions/MigrationOptionsForm';
import NamespacesForm from './NamespacesForm';
import ResultsStep from './ResultsStep';
import VolumesForm from './VolumesForm';
import { IFormValues, IOtherProps } from './WizardContainer';
import WizardStepContainer from './WizardStepContainer';

const WizardComponent = (props: IOtherProps) => {
  const dispatch = useDispatch();
  const clusterList = useSelector((state: DefaultRootState) =>
    clusterSelectors.getAllClusters(state)
  );
  const storageList = useSelector((state: DefaultRootState) =>
    storageSelectors.getAllStorage(state)
  );
  const {
    currentPlan,
    currentPlanStatus,
    isFetchingPVList,
    isFetchingNamespaceList,
    isPollingStatus,
    isFetchingPVResources,
  } = useSelector((state: DefaultRootState) => state.plan);

  const [stepIdReached, setStepIdReached] = useState(1);
  const [isAddHooksOpen, setIsAddHooksOpen] = useState(false);

  const { values, touched, errors, resetForm, setFieldValue, submitForm } =
    useFormikContext<IFormValues>();

  const {
    isOpen,
    isEdit,
    editPlanObj,
    onHandleWizardModalClose,
    setInitialValues,
    defaultInitialValues,
  } = props;

  enum stepId {
    General = 1,
    Namespaces,
    PersistentVolumes,
    CopyOptions,
    LiveMigration,
    MigrationOptions,
    Hooks,
    Results,
  }
  const handleClose = () => {
    onHandleWizardModalClose();
    setStepIdReached(stepId.General);
    resetForm();
    dispatch(PlanActions.resetCurrentPlan());
    dispatch(PlanActions.stopPlanStatusPolling(values.planName));
    dispatch(PlanActions.validatePlanPollStop());
    dispatch(PlanActions.pvUpdatePollStop());
    setShowHooksStep(false);
    setShowMigrationOptionsStep(false);
    setShowNamespacesStep(false);
    setShowPersistentVolumesStep(false);
    setShowCopyOptionsStep(false);
    setShowLiveMigrationStep(false);
    setInitialValues(defaultInitialValues);
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
    canJumpTo: stepIdReached >= stepId.General,
  };
  const namespacesStep = {
    id: stepId.Namespaces,
    name: 'Namespaces',
    component: (
      <WizardStepContainer title="Namespaces">
        <NamespacesForm />
      </WizardStepContainer>
    ),
    canJumpTo: stepIdReached >= stepId.Namespaces,
  };
  const persistentVolumesStep = {
    id: stepId.PersistentVolumes,
    name: 'Persistent volumes',
    component: (
      <WizardStepContainer title="Persistent volumes">
        <VolumesForm isEdit={isEdit} isOpen={isOpen} editPlanObj={editPlanObj} />
      </WizardStepContainer>
    ),
    canJumpTo: stepIdReached >= stepId.PersistentVolumes,
  };
  const copyOptionsStep = {
    id: stepId.CopyOptions,
    name: 'Copy options',
    component: (
      <WizardStepContainer title="Copy options">
        <CopyOptionsForm />
      </WizardStepContainer>
    ),
    canJumpTo: stepIdReached >= stepId.CopyOptions,
  };
  const liveMigrationStep = {
    id: stepId.LiveMigration,
    name: 'Live Migration',
    component: (
      <WizardStepContainer title="Live Migration">
        <LiveMigrationForm />
      </WizardStepContainer>
    ),
    canJumpTo: stepIdReached >= stepId.LiveMigration,
  };
  const migrationOptionsStep = {
    id: stepId.MigrationOptions,
    name: 'Migration options',
    component: (
      <WizardStepContainer title="Migration options">
        <MigrationOptionsForm isEdit={isEdit} />
      </WizardStepContainer>
    ),
    canJumpTo: stepIdReached >= stepId.MigrationOptions,
  };
  const hooksStep = {
    id: stepId.Hooks,
    name: 'Hooks',
    component: (
      <WizardStepContainer title="Hooks">
        <HooksStep isAddHooksOpen={isAddHooksOpen} setIsAddHooksOpen={setIsAddHooksOpen} />
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
        currentPlanStatus={currentPlanStatus}
        isPollingStatus={isPollingStatus}
        onClose={handleClose}
      />
    ),
  };

  const [showNamespacesStep, setShowNamespacesStep] = useState(false);
  const [showPersistentVolumesStep, setShowPersistentVolumesStep] = useState(false);
  const [showCopyOptionsStep, setShowCopyOptionsStep] = useState(false);
  const [showLiveMigrationStep, setShowLiveMigrationStep] = useState(false);
  const [showMigrationOptionsStep, setShowMigrationOptionsStep] = useState(false);
  const [showHooksStep, setShowHooksStep] = useState(false);
  const [showResultsStep, setShowResultsStep] = useState(false);

  const steps = [
    generalStep,
    ...(showNamespacesStep ? [namespacesStep] : []),
    ...(showPersistentVolumesStep ? [persistentVolumesStep] : []),
    ...(showCopyOptionsStep ? [copyOptionsStep] : []),
    ...(showLiveMigrationStep ? [liveMigrationStep] : []),
    ...(showMigrationOptionsStep ? [migrationOptionsStep] : []),
    ...(showHooksStep ? [hooksStep] : []),
    ...(showResultsStep ? [resultsStep] : []),
  ];

  const onMove: WizardStepFunctionType = ({ id, name }, { prevId, prevName }) => {
    dispatch(PlanActions.pvUpdatePollStop());
    if (stepIdReached < (id as number)) {
      setStepIdReached(id as number);
    }

    if (id === stepId.Namespaces && isEdit) {
      dispatch(PlanActions.setCurrentPlan(editPlanObj));
    }

    if (prevId === stepId.Namespaces && id !== stepId.General) {
      // We must create the plan here so that the controller can evaluate the
      // requested namespaces and discover related PVs

      if (!currentPlan && !isEdit) {
        dispatch(
          PlanActions.addPlanRequest({
            planName: values.planName,
            sourceCluster: values.sourceCluster,
            targetCluster: values.targetCluster,
            selectedStorage: values.selectedStorage,
            namespaces: values.selectedNamespaces,
            migrationType: values.migrationType.value,
          })
        );
        dispatch(PlanActions.addAnalyticRequest(values.planName));
      }
    }
    if (prevId === stepId.PersistentVolumes) {
      //Set action to SKIP for unselected PVs when navigating past the pv selection step in wizard
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
      //update plan & start status polling on results page
      submitForm();
    }
    if (id === stepId.Hooks) {
      dispatch(PlanActions.fetchPlanHooksRequest());
    }

    if (prevId === stepId.Hooks && id === stepId.CopyOptions) {
      setIsAddHooksOpen(false);
    }
  };

  const getNextStep = (activeStep: any, callback?: any) => {
    if (activeStep.name === 'General' && values.migrationType.value === 'full') {
      setShowNamespacesStep(true);
      setShowPersistentVolumesStep(true);
      setShowCopyOptionsStep(true);
      setShowMigrationOptionsStep(true);
      setShowHooksStep(true);
      setShowResultsStep(true);
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
      if (values.migrationType.value === 'scc') {
        setShowCopyOptionsStep(false);
        setShowLiveMigrationStep(true);
      } else {
        setShowCopyOptionsStep(true);
        setShowLiveMigrationStep(false);
      }
      setShowMigrationOptionsStep(false);
      setShowResultsStep(true);
      setShowHooksStep(false);
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

  const planState = useSelector((state: DefaultRootState) => state.plan);
  const storageClasses = planState.currentPlan?.status?.destStorageClasses || [];

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
                    values.migrationType.value === 'state'
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
                return (
                  !errors.selectedNamespaces &&
                  !isFetchingNamespaceList &&
                  !errors.currentTargetNamespaceName
                );
              case 'Copy options':
                return !errors.currentTargetPVCName;
              case 'Persistent volumes':
                return (
                  !isFetchingPVResources &&
                  !isFetchingPVList &&
                  currentPlanStatus.state !== 'Pending' &&
                  currentPlanStatus.state !== 'Critical' &&
                  !planState.currentPlan?.spec.refresh &&
                  (values.migrationType.value !== 'scc' ||
                    (values.selectedPVs.length > 0 && storageClasses.length > 1))
                );
              case 'Hooks':
                return !isAddHooksOpen;
              case 'Migration options':
                return true;
              case 'Live Migration':
                return true;
              default:
                return true;
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
                {activeStep.name === 'Results' ? 'Finish' : 'Next'}
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
