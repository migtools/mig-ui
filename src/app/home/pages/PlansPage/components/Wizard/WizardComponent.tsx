import React, { useState, useEffect, useContext } from 'react';
import { Wizard, WizardStepFunctionType } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import NamespacesForm from './NamespacesForm';
import VolumesForm from './VolumesForm';
import CopyOptionsForm from './CopyOptionsForm';
import HooksStep from './HooksStep';
import ResultsStep from './ResultsStep';
import { PollingContext } from '../../../../duck/context';
import { useFormikContext } from 'formik';
import { IOtherProps, IFormValues } from './WizardContainer';
import { CurrentPlanState } from '../../../../../plan/duck/reducers';
import WizardStepContainer from './WizardStepContainer';
import { StatusType } from '../../../../../common/components/StatusIcon';
import { getTokenInfo } from '../../../TokensPage/helpers';
import { INameNamespaceRef } from '../../../../../common/duck/types';
import { isSameResource } from '../../../../../common/helpers';
import { NON_ADMIN_ENABLED } from '../../../../../../TEMPORARY_GLOBAL_FLAGS';

const styles = require('./WizardComponent.module');

const WizardComponent = (props: IOtherProps) => {
  const [stepIdReached, setStepIdReached] = useState(1);
  const [updatedSteps, setUpdatedSteps] = useState([]);
  const pollingContext = useContext(PollingContext);
  const [isAddHooksOpen, setIsAddHooksOpen] = useState(false);

  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    setFieldTouched,
    setFieldValue,
    resetForm,
    validateForm,
  } = useFormikContext<IFormValues>();
  // TODO we should call useFormikContext in each step's form component to get these
  //   instead of passing them down as props through all the layers

  const {
    clusterList,
    currentPlan,
    currentPlanStatus,
    storageList,
    tokenList,
    isOpen,
    isFetchingPVList,
    isFetchingNamespaceList,
    isPVError,
    isPollingStatus,
    fetchNamespacesRequest,
    sourceClusterNamespaces,
    fetchHooksRequest,
    migHookList,
    isFetchingHookList,
    getPVResourcesRequest,
    startPlanStatusPolling,
    stopPlanStatusPolling,
    pvDiscoveryRequest,
    validatePlanRequest,
    pvResourceList,
    addPlanRequest,
    setCurrentPlan,
    resetCurrentPlan,
    onHandleWizardModalClose,
    isEdit,
    editPlanObj,
    updateCurrentPlanStatus,
    pvUpdatePollStop,
    addHookRequest,
    updateHookRequest,
    watchHookAddEditStatus,
    hookAddEditStatus,
    cancelAddEditWatch,
    resetAddEditState,
    removeHookRequest,
    validatePlanPollStop,
  } = props;

  enum stepId {
    General = 1,
    Namespaces,
    PersistentVolumes,
    StorageClass,
    MigrationTarget,
    Hooks,
    Results,
  }
  const handleClose = () => {
    onHandleWizardModalClose();
    setStepIdReached(stepId.General);
    pollingContext.startAllDefaultPolling();
    resetForm();
    resetCurrentPlan();
    stopPlanStatusPolling(values.planName);
    validatePlanPollStop();
    pvUpdatePollStop();
  };

  useEffect(() => {
    if (isOpen) {
      pollingContext.stopAllPolling();
    }
  }, [isOpen]);

  const areFieldsTouchedAndValid = (fieldKeys: (keyof IFormValues)[]) =>
    fieldKeys.every((fieldKey) => !errors[fieldKey] && (touched[fieldKey] || isEdit === true));

  const areSelectedTokensValid = (fieldKeys: (keyof IFormValues)[]) =>
    fieldKeys.every((fieldKey) => {
      const tokenRef = values[fieldKey] as INameNamespaceRef;
      const selectedToken =
        tokenRef && tokenList.find((token) => isSameResource(token.MigToken.metadata, tokenRef));
      const tokenInfo = selectedToken && getTokenInfo(selectedToken);
      return tokenInfo && tokenInfo.statusType !== StatusType.ERROR;
    });

  useEffect(
    () => {
      const steps = [
        {
          id: stepId.General,
          name: 'General',
          component: (
            <WizardStepContainer title="General">
              <GeneralForm
                clusterList={clusterList}
                storageList={storageList}
                values={values}
                errors={errors}
                touched={touched}
                handleBlur={handleBlur}
                handleChange={handleChange}
                setFieldTouched={setFieldTouched}
                setFieldValue={setFieldValue}
                validateForm={validateForm}
                isEdit={isEdit}
              />
            </WizardStepContainer>
          ),
          enableNext: NON_ADMIN_ENABLED
            ? areFieldsTouchedAndValid([
                'planName',
                'sourceCluster',
                'sourceTokenRef',
                'targetCluster',
                'targetTokenRef',
                'selectedStorage',
              ]) && areSelectedTokensValid(['sourceTokenRef', 'targetTokenRef'])
            : areFieldsTouchedAndValid([
                'planName',
                'sourceCluster',
                'targetCluster',
                'selectedStorage',
              ]),
        },
        {
          id: stepId.Namespaces,
          name: 'Namespaces',
          component: (
            <WizardStepContainer title="Namespaces">
              <NamespacesForm
                values={values}
                setFieldValue={setFieldValue}
                isFetchingNamespaceList={isFetchingNamespaceList}
                fetchNamespacesRequest={fetchNamespacesRequest}
                sourceClusterNamespaces={sourceClusterNamespaces}
              />
            </WizardStepContainer>
          ),
          enableNext: !errors.selectedNamespaces,
          canJumpTo: stepIdReached >= stepId.Namespaces,
        },
        {
          id: stepId.PersistentVolumes,
          name: 'Persistent volumes',
          component: (
            <WizardStepContainer title="Persistent volumes">
              <VolumesForm
                values={values}
                setFieldValue={setFieldValue}
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
        },
        {
          id: stepId.StorageClass,
          name: 'Copy options',
          component: (
            <WizardStepContainer title="Copy options">
              <CopyOptionsForm
                values={values}
                setFieldValue={setFieldValue}
                currentPlan={currentPlan}
                isFetchingPVList={isFetchingPVList}
                clusterList={clusterList}
              />
            </WizardStepContainer>
          ),
          canJumpTo: stepIdReached >= stepId.StorageClass,
        },
        {
          id: stepId.Hooks,
          name: 'Hooks',
          component: (
            <WizardStepContainer title="Hooks">
              <HooksStep
                removeHookRequest={removeHookRequest}
                addHookRequest={addHookRequest}
                updateHookRequest={updateHookRequest}
                isFetchingHookList={isFetchingHookList}
                migHookList={migHookList}
                fetchHooksRequest={fetchHooksRequest}
                watchHookAddEditStatus={watchHookAddEditStatus}
                hookAddEditStatus={hookAddEditStatus}
                cancelAddEditWatch={cancelAddEditWatch}
                resetAddEditState={resetAddEditState}
                currentPlan={currentPlan}
                isAddHooksOpen={isAddHooksOpen}
                setIsAddHooksOpen={setIsAddHooksOpen}
              />
            </WizardStepContainer>
          ),
          canJumpTo: stepIdReached >= stepId.Hooks,
          enableNext: !isAddHooksOpen,
          hideBackButton: isAddHooksOpen,
          hideCancelButton: isAddHooksOpen,
          nextButtonText: 'Finish',
        },
        {
          id: stepId.Results,
          name: 'Results',
          isFinishedStep: true,
          component: (
            <ResultsStep
              values={values}
              errors={errors}
              currentPlan={currentPlan}
              currentPlanStatus={currentPlanStatus}
              isPollingStatus={isPollingStatus}
              startPlanStatusPolling={startPlanStatusPolling}
              onClose={handleClose}
            />
          ),
        },
      ];

      setUpdatedSteps(steps);
    },
    //****************** Don't forget to update this array if you add changes to wizard children!!! */
    // TODO: we should really remove this and just define steps outside the useEffect, if that doesn't break anything
    [
      currentPlan,
      values,
      isPVError,
      isFetchingPVList,
      isPollingStatus,
      isFetchingNamespaceList,
      pvResourceList,
      errors,
      touched,
      currentPlanStatus,
      migHookList,
      tokenList,
      hookAddEditStatus,
      isAddHooksOpen,
      isFetchingHookList,
    ]
  );

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
          ...(NON_ADMIN_ENABLED
            ? {
                sourceTokenRef: values.sourceTokenRef,
                targetTokenRef: values.targetTokenRef,
              }
            : {}),
          selectedStorage: values.selectedStorage,
          namespaces: values.selectedNamespaces,
        });
      }
    }
    if (newStep.id === stepId.Results) {
      updateCurrentPlanStatus({ state: CurrentPlanState.Pending });
      //update plan & start status polling on results page
      validatePlanRequest(values);
    }
    if (prevStep.prevId === stepId.Hooks && newStep.id === stepId.StorageClass) {
      setIsAddHooksOpen(false);
    }
  };
  return (
    <React.Fragment>
      {isOpen && (
        <Wizard
          isOpen={isOpen}
          onNext={onMove}
          onBack={onMove}
          title="Create a migration plan"
          onClose={handleClose}
          steps={updatedSteps}
          isFullWidth
          isCompactNav
          className={styles.wizardModifier}
          onSubmit={(event) => event.preventDefault()}
        />
      )}
    </React.Fragment>
  );
};

export default WizardComponent;
