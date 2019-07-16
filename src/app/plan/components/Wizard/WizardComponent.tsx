import React, { useState } from 'react';
import { Wizard } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import MigSourceForm from './MigSourceForm';
import MigTargetForm from './MigTargetForm';
import VolumesForm from './VolumesForm';
import ResultsStep from './ResultsStep';
import { useToggleLoading } from '../../duck/hooks';

const WizardComponent = props => {
  const MigSourceStepId = 2;
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
    isCheckingPlanStatus,
  } = props;
  const steps = [
    {
      id: 1,
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
      id: 2,
      name: 'Migration Source',
      component: (
        <MigSourceForm
          values={values}
          errors={errors}
          touched={touched}
          handleBlur={handleBlur}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          setFieldTouched={setFieldTouched}
          clusterList={clusterList}
          onWizardLoadingToggle={toggleLoading}
          isWizardLoading={isLoading}
        />
      ),
      enableNext: !errors.sourceCluster && touched.sourceCluster === true && !isLoading,
      canJumpTo: stepIdReached >= 2,
    },
    {
      id: 3,
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
        />
      ),
      enableNext: !isLoading && !isFetchingPVList,
      canJumpTo: stepIdReached >= 3,
    },
    {
      id: 4,
      name: 'Migration Targets',
      component: (
        <MigTargetForm
          values={values}
          errors={errors}
          touched={touched}
          handleBlur={handleBlur}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          setFieldTouched={setFieldTouched}
          clusterList={clusterList}
          storageList={storageList}
          onWizardLoadingToggle={toggleLoading}
        />
      ),
      enableNext: !errors.targetCluster && touched.targetCluster === true && !isLoading,
      canJumpTo: stepIdReached >= 4,
    },
    {
      id: 5,
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
      canJumpTo: stepIdReached >= 5,
    },
  ];

  const onMove = (curr, prev) => {
    if (stepIdReached < curr.id) {
      setStepIdReached(curr.id);
    } else {
      setStepIdReached(stepIdReached);
    }

    if (prev.prevId === MigSourceStepId && curr.id !== 1) {
      // We must create the plan here so that the controller can evaluate the
      // requested namespaces and discover related PVs
      const currentPlan = props.planList.find(p => {
        return p.metadata.name === props.values.planName;
      });

      if (!currentPlan) {
        props.addPlan({
          planName: props.values.planName,
          sourceCluster: props.values.sourceCluster,
          targetCluster: HostClusterName,
          namespaces: props.values.selectedNamespaces.map(ns => ns.metadata.name),
        });
      }
    }
    if (curr.id === 5) {
      props.handleSubmit();
    }
  };
  const handleClose = () => {
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
