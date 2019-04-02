import React from 'react';
import { withFormik } from 'formik';
import { Flex } from '@rebass/emotion';
import { Wizard as PFWizard } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import MigSourceForm from './MigSourceForm';
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
          clusterList={clusterList}
          setFieldValue={setFieldValue}
        />
      ),
      enableNext: false,
    },
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
    selectedCluster: '',
  }),

  validate: values => {
    const errors: any = {};

    if (!values.planName) {
      errors.planName = 'Required';
    }
    if (!values.selectedCluster) {
      errors.selectedCluster = 'Required';
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
