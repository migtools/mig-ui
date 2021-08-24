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
      } else if (
        !isEdit &&
        planList.some((plan) => plan.MigPlan.metadata.name === values.planName)
      ) {
        errors.planName =
          'A plan with that name already exists. Enter a unique name for the migration plan.';
      }

      if (!values.sourceCluster) {
        errors.sourceCluster = 'Required';
      } else if (values.sourceCluster === values.targetCluster) {
        errors.sourceCluster =
          'The selected source cluster must be different than the target cluster.';
      }
      if (!values.selectedNamespaces || values.selectedNamespaces.length === 0) {
        errors.selectedNamespaces = 'Required';
      }
      if (!values.targetCluster) {
        errors.targetCluster = 'Required';
      } else if (values.sourceCluster === values.targetCluster) {
        errors.targetCluster =
          'The selected target cluster must be different than the source cluster.';
      }
      if (!values.selectedStorage) {
        errors.selectedStorage = 'Required';
      }
      const existingNSNameMap = values.editedNamespaces.map((nsItem, selectedIndex: number) => {
        const sourceNSName = nsItem.name;
        const editedNamespace = values.editedNamespaces.find(
          (editedNS) => editedNS.oldName === nsItem.name
          // && editedNS.namespace === pvItem.pvc.namespace
        );
        const targetNSName = editedNamespace ? editedNamespace.newName : nsItem.name;
        return {
          sourceNSName,
          targetNSName,
        };
      });
      const hasDuplicateMapping = existingNSNameMap.find((ns, index) => {
        const editedNSName = values?.currentTargetNamespaceName?.name;
        // const editedNSNameAssociatedPVName = values?.currentTargetNamespaceName?.srcName;
        return (
          editedNSName === ns.targetNSName ||
          // && editedPVCNameAssociatedPVName !== pv.pvName
          editedNSName === ns.sourceNSName
          // && editedPVCNameAssociatedPVName !== pv.pvName
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
          'A mapped target namespace with that name already exists. Enter a unique name for this target namespaec.';
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
