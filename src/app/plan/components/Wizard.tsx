/** @jsx jsx */
import { jsx } from '@emotion/core';

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
    if (curr.id === 5) {
      this.props.handleSubmit();
    }
  };
  // handleAddPlan = () => {
  //   this.props.handlesubmit();
  //   // this.setState({
  //   //   step: 1,
  //   //   isOpen: false,
  //   // });
  // }

  render() {
    const {
      values,
      touched,
      errors,
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldTouched,
      setFieldValue,
      clusterList,
      storageList,
      trigger,
      resetForm,
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
          <form onSubmit={handleSubmit}>
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
    persistentVolumes: [
      // {
      //   name: 'pv007',
      //   project: 'robot-shop',
      //   storageClass: '',
      //   size: '100 Gi',
      //   claim: 'robot-shop/mongodata',
      //   type: 'copy',
      //   details: '',
      //   id: 1,
      // },
      // {
      //   name: 'pv097',
      //   project: 'robot-shop',
      //   storageClass: '',
      //   size: '100 Gi',
      //   claim: 'robot-shop/mysqldata',
      //   type: 'copy',
      //   details: '',
      //   id: 2,
      // },
    ],
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

export default Wizard;
