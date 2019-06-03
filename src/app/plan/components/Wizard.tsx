/** @jsx jsx */
import { jsx } from '@emotion/core';
import { connect } from 'react-redux';

import React from 'react';
import { withFormik } from 'formik';
import { Flex } from '@rebass/emotion';
import { Wizard as PFWizard } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import MigSourceForm from './MigSourceForm';
import MigTargetForm from './MigTargetForm';
import VolumesForm from './VolumesForm';
import ResultsStep from './ResultsStep';
import ConfirmationStep from './ConfirmationStep';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import planOperations from '../duck/operations';

const MigSourceStepId = 2;
const PVDiscoveryStepId = 3;
const HostClusterName = 'host';

class WrappedWizard extends React.Component<any, any> {
  state = {
    isWizardLoading: false,
    step: 1,
  };
  handleClose = () => {
    this.props.onHandleClose();
    this.props.resetForm();
    this.setState({
      step: 1,
    });
  };

  handleWizardLoadingToggle = isLoading => {
    this.setState({ isWizardLoading: isLoading });
  };

  onMove = (curr, prev) => {
    this.setState({
      step: curr.id,
    });

    if (prev.prevId === MigSourceStepId) {
      // We must create the plan here so that the controller can evaluate the
      // requested namespaces and discover related PVs
      this.props.addPlan({
        planName: this.props.values.planName,
        sourceCluster: this.props.values.sourceCluster,
        targetCluster: HostClusterName,
        namespaces: this.props.values.selectedNamespaces.map(ns => ns.metadata.name),
      })
    }
    if (curr.id === 5) {
      this.props.handleSubmit();
    }
  };

  render() {
    const {
      values,
      touched,
      errors,
      handleChange,
      handleBlur,
      setFieldTouched,
      setFieldValue,
      clusterList,
      storageList,
    } = this.props;

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
            onWizardLoadingToggle={this.handleWizardLoadingToggle}
          />
        ),
        // enableNext: !errors.planName && touched.planName === true
        enableNext:
          !errors.sourceCluster && touched.sourceCluster === true && !this.state.isWizardLoading,
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
            onWizardLoadingToggle={this.handleWizardLoadingToggle}
          />
        ),
        // enableNext: !errors.planName && touched.planName === true
        enableNext:
          !errors.sourceCluster && touched.sourceCluster === true && !this.state.isWizardLoading,
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
            onWizardLoadingToggle={this.handleWizardLoadingToggle}
          />
        ),
        enableNext:
          !errors.targetCluster && touched.targetCluster === true && !this.state.isWizardLoading,
      },
      {
        id: 5,
        name: 'Results',
        component: (
          <ResultsStep
            values={values}
            errors={errors}
            onWizardLoadingToggle={this.handleWizardLoadingToggle}
            setFieldValue={setFieldValue}
          />
        ),
        enableNext: !this.state.isWizardLoading,
        nextButtonText: 'Close',
        hideCancelButton: true,
        hideBackButton: true,
      },
    ];
    const customStyle = css`
      .pf-c-wizard__main {
        flex: 1 1 auto;
      }
    `;
    return (
      <React.Fragment>
        <Flex>
          <form>
            <PFWizard
              css={customStyle}
              isOpen={this.props.isOpen}
              title="Migration Plan Wizard"
              description="Create a migration plan"
              onNext={this.onMove}
              onBack={this.onMove}
              onClose={this.handleClose}
              steps={steps}
              isFullWidth
              isCompactNav
            />
          </form>
        </Flex>
      </React.Fragment>
    );
  }
}

const Wizard: any = withFormik({
  mapPropsToValues: () => ({
    connectionStatus: '',
    planName: '',
    sourceCluster: '',
    targetCluster: null,
    selectedNamespaces: [],
    selectedStorage: '',
    persistentVolumes: [],
  }),

  validate: values => {
    const errors: any = {};

    if (!values.planName) {
      errors.planName = 'Required';
    }
    if (!values.sourceCluster) {
      errors.sourceCluster = 'Required';
    }
    if (!values.selectedNamespaces) {
      errors.selectedNamespaces = 'Required';
    }
    if (!values.targetCluster) {
      errors.targetCluster = 'Required';
    }
    if (!values.selectedStorage) {
      errors.selectedStorage = 'Required';
    }
    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    formikBag.setSubmitting(false);
    formikBag.props.onPlanSubmit(values);
  },
  validateOnBlur: false,

  displayName: 'Page One Form',
})(WrappedWizard);


const mapStateToProps = state => {
  return {
    connectionStatus: '',
    planName: '',
    sourceCluster: '',
    targetCluster: null,
    selectedNamespaces: [],
    selectedStorage: '',
    persistentVolumes: [],
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addPlan: plan => dispatch(planOperations.addPlan(plan)),
  }
}

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Wizard)
