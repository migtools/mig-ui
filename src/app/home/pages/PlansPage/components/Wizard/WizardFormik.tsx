import React from 'react';
import { Formik } from 'formik';
import { IPlan } from '../../../../../plan/duck/types';
import { IFormValues } from './WizardContainer';
import utils from '../../../../../common/duck/utils';
import { NON_ADMIN_ENABLED } from '../../../../../../TEMPORARY_GLOBAL_FLAGS';

export interface IWizardFormikProps {
  initialValues: IFormValues;
  isEdit?: boolean;
  planList?: IPlan[];
  children: React.ReactNode;
}

const WizardFormik: React.FunctionComponent<IWizardFormikProps> = ({
  initialValues,
  isEdit = false,
  planList = [],
  children,
}: IWizardFormikProps) => (
  <Formik<IFormValues>
    initialValues={initialValues}
    validate={(values: IFormValues) => {
      const errors: { [key in keyof IFormValues]?: string } = {}; // TODO figure out why using FormikErrors<IFormValues> here causes type errors below

      if (!values.planName) {
        errors.planName = 'Required';
      } else if (!utils.testDNS1123(values.planName)) {
        errors.planName = utils.DNS1123Error(values.planName);
      } else if (
        !isEdit &&
        planList.some((plan) => plan.MigPlan.metadata.name === values.planName)
      ) {
        errors.planName =
          'A plan with that name already exists. Enter a unique name for the migration plan.';
      }
      if (!values.sourceCluster) {
        errors.sourceCluster = 'Required';
      }
      if (!values.selectedNamespaces || values.selectedNamespaces.length === 0) {
        errors.selectedNamespaces = 'Required';
      }
      if (!values.targetCluster) {
        errors.targetCluster = 'Required';
      }
      if (NON_ADMIN_ENABLED) {
        if (!values.sourceTokenRef) {
          errors.sourceTokenRef = 'Required';
        }
        if (!values.targetTokenRef) {
          errors.targetTokenRef = 'Required';
        }
      }
      if (!values.selectedStorage) {
        errors.selectedStorage = 'Required';
      }
      return errors;
    }}
    onSubmit={() => {
      return null;
    }}
    validateOnBlur={false}
    enableReinitialize
  >
    {children}
  </Formik>
);

export default WizardFormik;
