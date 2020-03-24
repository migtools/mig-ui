import React, { useState, useEffect, useContext } from 'react';
import { Wizard } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import SourceSelectForm from './SourceSelectForm';
import DestinationSelectForm from './DestinationSelectForm';
import ReplicationSelectForm from './ReplicationSelectForm';
import VolumesForm from './VolumesForm';
import StorageClassForm from './StorageClassForm';
import ResultsStep from './ResultsStep';
import { PollingContext } from '../../../home/duck/context';
import { FormikProps } from 'formik';
import { IOtherProps, IFormValues } from './WizardContainer';
import { CurrentPlanState } from '../../duck/reducers';

const styles = require('./WizardComponent.module');

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
    fetchNamespacesRequest,
    sourceClusterNamespaces,
    getPVResourcesRequest,
    startPlanStatusPolling,
    stopPlanStatusPolling,
    planUpdateRequest,
    pvResourceList,
    addPlanRequest,
    setCurrentPlan,
    resetCurrentPlan,
    onHandleWizardModalClose,
    isEdit,
    editPlanObj,
    updateCurrentPlanStatus,
    pvUpdatePollStop
  } = props;

  enum stepId {
    General = 1,
    MigrationSource,
    MigrationDestination,
    MigrationReplication,
    PersistentVolumes,
    StorageClass,
    MigrationTarget,
    Results,
  }
  const handleClose = () => {
    onHandleWizardModalClose();
    setStepIdReached(stepId.General);
    pollingContext.startAllDefaultPolling();
    resetForm();
    resetCurrentPlan();
    stopPlanStatusPolling(props.values.planName);
    pvUpdatePollStop();
  };

  useEffect(() => {
    if (isOpen) {
      pollingContext.stopAllPolling();
    }
  }, [isOpen]);

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
            isEdit={isEdit}
          />
        ),
        enableNext: !errors.planName && (touched.planName === true || isEdit === true),
      },
      {
        id: stepId.MigrationSource,
        name: 'Source',
        component: (
          <SourceSelectForm
            values={values}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            handleChange={handleChange}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            clusterList={clusterList}
            isFetchingNamespaceList={isFetchingNamespaceList}
            fetchNamespacesRequest={fetchNamespacesRequest}
            sourceClusterNamespaces={sourceClusterNamespaces}
            isEdit={isEdit}
          />
        ),
        enableNext:
          !errors.sourceCluster &&
          touched.sourceCluster === true &&
          !errors.selectedNamespaces ||
          (isEdit &&
            !errors.sourceCluster &&
            !errors.selectedNamespaces),
        canJumpTo: stepIdReached >= stepId.MigrationSource,
      }, 
      {
        id: stepId.MigrationDestination,
        name: 'Destination',
        component: (
          <DestinationSelectForm
            values={values}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            handleChange={handleChange}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            clusterList={clusterList}
            isEdit={isEdit}
          />
        ),
        enableNext:
        !errors.targetCluster &&
        touched.targetCluster === true &&
        !errors.sourceCluster &&
        touched.sourceCluster === true &&
        !errors.selectedNamespaces ||
        (isEdit &&
          !errors.selectedStorage &&
          !errors.targetCluster &&
          !errors.sourceCluster &&
          !errors.selectedNamespaces),
        canJumpTo: stepIdReached >= stepId.MigrationDestination,
      },
      {
        id: stepId.MigrationReplication,
        name: 'Replication Repository',
        component: (
          <ReplicationSelectForm
            values={values}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            handleChange={handleChange}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            storageList={storageList}
            isEdit={isEdit}
          />
        ),
        enableNext:
          !errors.selectedStorage &&
          touched.selectedStorage === true &&
          !errors.targetCluster &&
          touched.targetCluster === true &&
          !errors.sourceCluster &&
          touched.sourceCluster === true &&
          !errors.selectedNamespaces ||
          (isEdit &&
            !errors.selectedStorage &&
            !errors.targetCluster &&
            !errors.sourceCluster &&
            !errors.selectedNamespaces),
        canJumpTo: stepIdReached >= stepId.MigrationReplication,
      },
      {
        id: stepId.PersistentVolumes,
        name: 'Persistent Volumes',
        component: (
          <VolumesForm
            isEdit={isEdit}
            values={values}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            currentPlan={currentPlan}
            isPVError={isPVError}
            getPVResourcesRequest={getPVResourcesRequest}
            pvResourceList={pvResourceList}
            isPollingStatus={isPollingStatus}
            planUpdateRequest={planUpdateRequest}
            startPlanStatusPolling={startPlanStatusPolling}
            currentPlanStatus={currentPlanStatus}
          />
        ),
        enableNext:
          !isFetchingPVList &&
          currentPlanStatus.state !== 'Pending' &&
          currentPlanStatus.state !== 'Critical',
        canJumpTo: stepIdReached >= stepId.PersistentVolumes,
      },
      {
        id: stepId.StorageClass,
        name: 'Storage Class',
        component: (
          <StorageClassForm
            isEdit={isEdit}
            values={values}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            handleChange={handleChange}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            currentPlan={currentPlan}
            isFetchingPVList={isFetchingPVList}
            clusterList={clusterList}
          />
        ),
        canJumpTo: stepIdReached >= stepId.StorageClass,
        nextButtonText: 'Finish'
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
    currentPlanStatus
  ]);


  const onMove = (curr, prev) => {
    //stop pv polling when navigating
    pvUpdatePollStop();
    //
    if (stepIdReached < curr.id) {
      setStepIdReached(curr.id);
    }

    if (curr.id === stepId.MigrationReplication && isEdit) {
      setCurrentPlan(editPlanObj);
    }

    if (prev.prevId === stepId.MigrationReplication && curr.id !== stepId.General) {
      // We must create the plan here so that the controller can evaluate the
      // requested namespaces and discover related PVs

      if (!currentPlan && !isEdit) {
        addPlanRequest({
          planName: props.values.planName,
          sourceCluster: props.values.sourceCluster,
          targetCluster: props.values.targetCluster,
          selectedStorage: props.values.selectedStorage,
          namespaces: props.values.selectedNamespaces,
        });
      }
    }
    if (curr.id === stepId.Results) {
      updateCurrentPlanStatus({ state: CurrentPlanState.Pending });
      //update plan & start status polling on results page
      planUpdateRequest(props.values, false);
    }
  };
  return (
    <>
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
          onSubmit={event => event.preventDefault()}
        />
      )}
    </>
  );
};

export default WizardComponent;
