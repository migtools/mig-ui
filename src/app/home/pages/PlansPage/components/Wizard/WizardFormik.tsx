import React from 'react';
import { Formik } from 'formik';
import { IPlan, ISourceClusterNamespace } from '../../../../../plan/duck/types';
import { IFormValues } from './WizardContainer';
import utils from '../../../../../common/duck/utils';

export interface IWizardFormikProps {
  initialValues: IFormValues;
  isEdit?: boolean;
  planList?: IPlan[];
  sourceClusterNamespaces: ISourceClusterNamespace[];
  children: React.ReactNode;
}

const WizardFormik: React.FunctionComponent<IWizardFormikProps> = ({
  initialValues,
  isEdit = false,
  planList = [],
  sourceClusterNamespaces,
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
      } else if (values.planName.length < 3 || values.planName.length > 63) {
        errors.planName = 'The plan name should be between 3 and 63 characters long.';
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
      if (!values.selectedPVs || values.selectedPVs.length === 0) {
        errors.selectedPVs = 'Required';
      }

      if (!values.targetCluster) {
        errors.targetCluster = 'Required';
      }
      if (!values.selectedStorage) {
        errors.selectedStorage = 'Required';
      }
      const hasDuplicateMapping = values.editedNamespaces.find((ns, index) => {
        const editedNSName = values?.currentTargetNamespaceName?.name;
        const editedNSNameID = values?.currentTargetNamespaceName?.id;
        return (
          (editedNSName === ns.newName && editedNSNameID !== ns.id) ||
          (editedNSName === ns.oldName && editedNSNameID !== ns.id)
        );
      });

      const targetNamespaceNameError = utils.testTargetNSName(
        values?.currentTargetNamespaceName?.name
      );
      if (!values.currentTargetNamespaceName) {
        errors.currentTargetNamespaceName = 'Required';
      } else if (targetNamespaceNameError !== '') {
        errors.currentTargetNamespaceName = targetNamespaceNameError;
      } else if (hasDuplicateMapping) {
        errors.currentTargetNamespaceName =
          'A mapped target namespace with that name already exists. Enter a unique name for this target namespace.';
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
