import React, { useState, useEffect, useContext } from 'react';
import { Wizard } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import ResourceSelectForm from './ResourceSelectForm';
import VolumesForm from './VolumesForm';
import StorageClassForm from './StorageClassForm';
import ResultsStep from './ResultsStep';
import { PollingContext } from '../../../home/duck/context';
import { FormikProps } from 'formik';
import { IOtherProps, IFormValues } from './WizardContainer';

const WizardComponent = (props: IOtherProps & FormikProps<IFormValues>) => {
  const [stepIdReached, setStepIdReached] = useState(1);
  const [updatedSteps, setUpdatedSteps] = useState([]);
  const pollingContext = useContext(PollingContext);

  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    setFieldTouched,
    setFieldValue,
    resetForm,
    clusterList,
    currentPlan,
    currentPlanStatus,
    storageList,
    isOpen,
    isFetchingNamespaceList,
    isPVError,
    isPollingStatus,
    isFetchingPVResources,
    fetchNamespacesForCluster,
    sourceClusterNamespaces,
    getPVResourcesRequest,
    startPlanStatusPolling,
    planUpdateRequest,
    planCreateRequest,
    isReconciling,
    isPollingStorage,
    isPollingClusters,
    isPollingPlans,
    pvResourceList,
    resetCurrentPlan,
    onHandleWizardModalClose
  } = props;

  enum stepId {
    General = 1,
    MigrationSource,
    PersistentVolumes,
    StorageClass,
    MigrationTarget,
    Results,
  }

  useEffect(() => {
    if (props.isOpen && (isPollingPlans || isPollingClusters || isPollingStorage)) {
      pollingContext.stopAllPolling();
    }
  });

  useEffect(() => {
    const steps = [
      {
        id: stepId.General,
        name: 'General',
        component: (
          <GeneralForm
            values={values}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            handleChange={handleChange}
            setFieldTouched={setFieldTouched}
          />
        ),
        canJumpTo: !isReconciling,
        enableNext: !errors.planName && touched.planName === true,
      },
      {
        id: stepId.MigrationSource,
        name: 'Resources',
        component: (
          <ResourceSelectForm
            values={values}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            handleChange={handleChange}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            clusterList={clusterList}
            storageList={storageList}
            isFetchingNamespaceList={isFetchingNamespaceList}
            fetchNamespacesForCluster={fetchNamespacesForCluster}
            sourceClusterNamespaces={sourceClusterNamespaces}
          />
        ),
        enableNext:
          !errors.selectedStorage &&
          touched.selectedStorage === true &&
          !errors.targetCluster &&
          touched.targetCluster === true &&
          !errors.sourceCluster &&
          touched.sourceCluster === true &&
          !errors.selectedNamespaces,
        canJumpTo: stepIdReached >= stepId.MigrationSource && !isReconciling,
        hideCancelButton: isReconciling,
        hideBackButton: isReconciling,
      },
      {
        id: stepId.PersistentVolumes,
        name: 'Persistent Volumes',
        component: (
          <VolumesForm
            values={values}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            currentPlan={currentPlan}
            isPVError={isPVError}
            getPVResourcesRequest={getPVResourcesRequest}
            pvResourceList={pvResourceList}
            isFetchingPVResources={isFetchingPVResources}
            isReconciling={isReconciling}
          />
        ),
        enableNext: !isPVError && !isReconciling,
        canJumpTo: stepIdReached >= stepId.PersistentVolumes && !isReconciling,
        hideCancelButton: isReconciling,
        hideBackButton: isReconciling,
      },
      {
        id: stepId.StorageClass,
        name: 'Storage Class',
        component: (
          <StorageClassForm
            values={values}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            handleChange={handleChange}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            currentPlan={currentPlan}
            isReconciling={isReconciling}
            clusterList={clusterList}
          />
        ),
        canJumpTo: stepIdReached >= stepId.StorageClass && !isReconciling,
        hideCancelButton: isReconciling,
        hideBackButton: isReconciling,
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
            isReconciling={isReconciling}
            startPlanStatusPolling={startPlanStatusPolling}
            onClose={handleClose}
          />
        ),
      },
    ];

    setUpdatedSteps(steps);

  }, [
    currentPlan,
    values,
    isPVError,
    isPollingStatus,
    isFetchingNamespaceList,
    isReconciling,
    pvResourceList,
    errors,
    touched
  ]);


  const onMove = (curr, prev) => {
    if (stepIdReached < curr.id) {
      setStepIdReached(curr.id);
    }

    if (!currentPlan && curr.id > stepId.MigrationSource) {
      planCreateRequest(props.values);
    } else if (currentPlan && prev.prevId < curr.id) {
      planUpdateRequest(props.values);
    }
  };

  const handleClose = () => {
    onHandleWizardModalClose();
    setStepIdReached(stepId.General);
    pollingContext.startAllDefaultPolling();
    resetForm();
    resetCurrentPlan();
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
        />
      )}
    </React.Fragment>
  );
};

export default WizardComponent;
