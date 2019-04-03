import React from 'react';
import { withFormik } from 'formik';
import { Flex } from '@rebass/emotion';
import { Wizard as PFWizard } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import MigSourceForm from './MigSourceForm';
import MigTargetForm from './MigTargetForm';
import { css } from '@emotion/core';
const WrappedWizard = props => {
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
  } = props;
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
          handleSubmit={handleSubmit}
          setFieldValue={setFieldValue}
          setFieldTouched={setFieldTouched}
          clusterList={clusterList}
        />
      ),
      // enableNext: !errors.planName && touched.planName === true
      enableNext: !errors.sourceCluster && touched.sourceCluster === true,
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
          handleSubmit={handleSubmit}
          setFieldValue={setFieldValue}
          setFieldTouched={setFieldTouched}
          clusterList={clusterList}
          storageList={storageList}
        />
      ),
      enableNext: !errors.targetCluster && touched.targetCluster === true,
    },
    // {
    //   name: "Options",
    //   component: (
    //     <OptionsForm
    //       values={values}
    //       errors={errors}
    //       touched={touched}
    //       handleBlur={handleBlur}
    //       handleChange={handleChange}
    //       handleSubmit={handleSubmit}
    //       setFieldValue={setFieldValue}
    //       setFieldTouched={setFieldTouched}
    //     />
    //   ),
    //   enableNext: true
    // }
  ];
  const onSave = () => {
    handleSubmit();
  };

  const onClose = () => {
    props.resetForm();
    props.onWizardToggle();
  };
  return (
    <Flex>
      <form onSubmit={handleSubmit}>
        <PFWizard
          css={css`
            .pf-c-wizard__main {
              height: 100%;
            }
          `}
          isOpen={props.isOpen}
          title="Migration Plan Wizard"
          description="Create a migration plan"
          onClose={onClose}
          steps={steps}
          onSave={() => onSave()}
        />
      </form>
    </Flex>
  );
};

const Wizard: any = withFormik({
  mapPropsToValues: () => ({
    planName: '',
    sourceCluster: '',
    targetCluster: '',
    selectedNamespaces: [],
    selectedStorage: '',
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
    formikBag.props.onHandleWizardToggle();
  },
  validateOnBlur: false,

  displayName: 'Page One Form',
})(WrappedWizard);

export default Wizard;
