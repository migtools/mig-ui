import React from 'react';
import { withFormik } from 'formik';
import { Flex } from '@rebass/emotion';
import { Wizard as PFWizard } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import MigSourceForm from './MigSourceForm';
import MigTargetForm from './MigTargetForm';
import VolumesForm from './VolumesForm';
import ResultsStep from './ResultsStep';
import { css } from '@emotion/core';

class WrappedWizard extends React.Component<any, any> {
  state = {
    isWizardLoading: false,
  };
  handleWizardLoadingToggle = (isLoading) => {
    this.setState({ isWizardLoading: isLoading });
  }

  onClose = () => {
    this.props.resetForm();
    this.props.onToggle();
  }


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

    const triggerNew = React.cloneElement(
      trigger,
      {
        onClick: () => {
          this.props.onToggle();
          if (trigger.props.onClick) {
            trigger.props.onClick();
          }
        },
      },
    );

    const steps = [
      {
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
        enableNext: !errors.sourceCluster && touched.sourceCluster === true && !this.state.isWizardLoading,
      },
      {
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
        enableNext: !errors.sourceCluster && touched.sourceCluster === true && !this.state.isWizardLoading,
      },
      {
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
        enableNext: !errors.targetCluster && touched.targetCluster === true && !this.state.isWizardLoading,
      },
      {
        name: 'Results',
        component: (
          <ResultsStep
            values={values}
            errors={errors}
            handleSubmit={handleSubmit}
            onWizardLoadingToggle={this.handleWizardLoadingToggle}
            setFieldValue={setFieldValue}
          />
        ),
        enableNext: !this.state.isWizardLoading,
      },
    ];

    return (
      <React.Fragment>
        {triggerNew}
        <Flex>
          <form onSubmit={handleSubmit}>
            <PFWizard
              css={css`
                max-width: 100% !important;
                .pf-c-wizard {
                  max-width: 100% !important;
                }
                .pf-c-wizard__main {
                  height: 100%;
                }
                .pf-c-wizard__nav{
                  width: 15em;
                }
                .pf-c-wizard__outer-wrap{
                  padding-left: 15em;
                }
              `}
              isOpen={this.props.isOpen}
              title="Migration Plan Wizard"
              description="Create a migration plan"
              onClose={this.onClose}
              steps={steps}
              onSave={handleSubmit}
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
      {
        name: 'pv007',
        project: 'robot-shop',
        storageClass: '',
        size: '100 Gi',
        claim: 'robot-shop/mongodata',
        type: 'copy',
        details: '',
        id: 1,
      },
      {
        name: 'pv097',
        project: 'robot-shop',
        storageClass: '',
        size: '100 Gi',
        claim: 'robot-shop/mysqldata',
        type: 'copy',
        details: '',
        id: 2,
      },
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
    formikBag.props.onToggle();
    formikBag.props.onExpandToggle();
    formikBag.props.onPlanSubmit(values);
  },
  validateOnBlur: false,

  displayName: 'Page One Form',
})(WrappedWizard);

export default Wizard;
