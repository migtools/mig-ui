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
    isFetchingPVList,
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
    const isUpdating = isReconciling || isFetchingPVList;
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
        canJumpTo: stepIdReached >= stepId.MigrationSource && !isUpdating,
        hideCancelButton: isUpdating,
        hideBackButton: isUpdating,
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
            isFetchingPVList={isFetchingPVList}
            isPVError={isPVError}
            getPVResourcesRequest={getPVResourcesRequest}
            pvResourceList={pvResourceList}
            isFetchingPVResources={isFetchingPVResources}
            isReconciling={isReconciling}
          />
        ),
        enableNext: !isFetchingPVList && !isPVError && !isReconciling,
        canJumpTo: stepIdReached >= stepId.PersistentVolumes && !isUpdating,
        hideCancelButton: isUpdating,
        hideBackButton: isUpdating,
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
            isFetchingPVList={isFetchingPVList}
            isReconciling={isReconciling}
            clusterList={clusterList}
          />
        ),
        canJumpTo: stepIdReached >= stepId.StorageClass && !isUpdating,
        hideCancelButton: isUpdating,
        hideBackButton: isUpdating,
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
    isFetchingPVList,
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
