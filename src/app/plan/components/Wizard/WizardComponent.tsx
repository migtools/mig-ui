import React, { useState } from 'react';
import { Wizard } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import ResourceSelectForm from './ResourceSelectForm';
import VolumesForm from './VolumesForm';
import StorageClassForm from './StorageClassForm';
import ResultsStep from './ResultsStep';
import { useToggleLoading } from '../../duck/hooks';

const WizardComponent = props => {
  const HostClusterName = 'host';
  const [isLoading, toggleLoading] = useToggleLoading(false);
  const [stepIdReached, setStepIdReached] = useState(1);

  const {
    values,
    touched,
    errors,
    handleChange,
    handleSubmit,
    handleBlur,
    setFieldTouched,
    setFieldValue,
    clusterList,
    planList,
    storageList,
    isFetchingPVList,
    isFetchingNamespaceList,
    isPVError,
    isCheckingPlanStatus,
    fetchNamespacesForCluster,
    sourceClusterNamespaces,
  } = props;

  enum stepId {
    General = 1,
    MigrationSource,
    PersistentVolumes,
    StorageClass,
    MigrationTarget,
    Results,
  }
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
        !errors.selectedNamespaces &&
        !isLoading,
      canJumpTo: stepIdReached >= stepId.MigrationSource,
    },
    {
      id: stepId.PersistentVolumes,
      name: 'Persistent Volumes',
      component: (
        <VolumesForm
          values={values}
          errors={errors}
          touched={touched}
          handleBlur={handleBlur}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          setFieldTouched={setFieldTouched}
          onWizardLoadingToggle={toggleLoading}
          isWizardLoading={isLoading}
          planList={planList}
          isFetchingPVList={isFetchingPVList}
          isPVError={isPVError}
        />
      ),
      enableNext: !isLoading && !isFetchingPVList,
      canJumpTo: stepIdReached >= stepId.PersistentVolumes,
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
          onWizardLoadingToggle={toggleLoading}
          isWizardLoading={isLoading}
          planList={planList}
          isFetchingPVList={isFetchingPVList}
          clusterList={clusterList}
        />
      ),
      enableNext: !isLoading,
      canJumpTo: stepIdReached >= stepId.StorageClass,
    },
    {
      id: stepId.Results,
      name: 'Results',
      component: (
        <ResultsStep
          values={values}
          errors={errors}
          onWizardLoadingToggle={toggleLoading}
          planList={planList}
          isCheckingPlanStatus={isCheckingPlanStatus}
        />
      ),
      enableNext: !isLoading,
      nextButtonText: 'Close',
      hideCancelButton: true,
      hideBackButton: true,
      canJumpTo: stepIdReached >= stepId.Results,
    },
  ];

  const onMove = (curr, prev) => {
    if (stepIdReached < curr.id) {
      setStepIdReached(curr.id);
    }

    if (prev.prevId === stepId.MigrationSource && curr.id !== stepId.General) {
      // We must create the plan here so that the controller can evaluate the
      // requested namespaces and discover related PVs
      const currentPlan = props.planList.find(p => {
        return p.MigPlan.metadata.name === props.values.planName;
      });

      if (!currentPlan) {
        props.addPlan({
          planName: props.values.planName,
          sourceCluster: props.values.sourceCluster,
          targetCluster: props.values.targetCluster,
          selectedStorage: props.values.selectedStorage,
          namespaces: props.values.selectedNamespaces.map(ns => ns.metadata.name),
        });
      }
    }
    if (curr.id === stepId.Results) {
      props.handleSubmit();
    }
  };
  const handleClose = () => {
    if (stepIdReached === stepId.Results) {
      setStepIdReached(stepId.General);
    }
    props.onHandleClose();
    props.resetForm();
  };
  return (
    <React.Fragment>
      {props.isOpen && (
        <Wizard
          isOpen={props.isOpen}
          onNext={onMove}
          onBack={onMove}
          title="Migration Plan Wizard"
          description="Create a migration plan"
          onClose={() => {
            handleClose();
          }}
          steps={steps}
          isFullWidth
          isCompactNav
        />
      )}
    </React.Fragment>
  );
};

export default WizardComponent;
