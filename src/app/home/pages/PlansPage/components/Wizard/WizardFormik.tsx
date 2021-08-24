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

      //
      const existingNSNameMap = values.selectedNamespaces.map((nsItem: string) => {
        let targetNSName = nsItem;
        let sourceNSName = nsItem;
        // const pvcNamespace = pvItem.pvc.namespace;
        // const pvName = pvItem.name;
        let editedNamespace = values.editedNamespaces.find(
          (editedNS) => editedNS.oldName === nsItem
          // && editedNS.namespace === pvItem.pvc.namespace
        );
        const includesMapping = sourceNSName.includes(':');
        if (includesMapping) {
          const mappedNSNameArr = sourceNSName.split(':');
          editedNamespace = values.editedNamespaces.find(
            (editedNS) => editedNS.oldName === mappedNSNameArr[0]
            // &&
            // editedNS.namespace === pvItem.pvc.namespace
          );
          if (mappedNSNameArr[0] === mappedNSNameArr[1]) {
            sourceNSName = mappedNSNameArr[0];
            targetNSName = editedNamespace ? editedNamespace.newName : mappedNSNameArr[0];
          } else {
            sourceNSName = mappedNSNameArr[0];
            targetNSName = editedNamespace ? editedNamespace.newName : mappedNSNameArr[1];
          }
          return {
            sourceNSName,
            targetNSName,
            // pvName,
            // pvcNamespace,
          };
        }
      });
      const hasDuplicateMapping = existingNSNameMap.find((ns, index) => {
        const editedNSName = values?.currentTargetName?.name;
        // const editedNSNameAssociatedPVName = values?.currentTargetName?.srcName;
        return (
          editedNSName === ns.targetNSName ||
          // && editedPVCNameAssociatedPVName !== pv.pvName
          editedNSName === ns.sourceNSName
          // && editedPVCNameAssociatedPVName !== pv.pvName
        );
      });

      //

      const targetNamespaceNameError = utils.testTargetNSName(values?.currentTargetName?.name);
      if (!values.currentTargetName) {
        errors.currentTargetName = 'Required';
      } else if (targetNamespaceNameError !== '') {
        errors.currentTargetName = targetNamespaceNameError;
      } else if (values.currentTargetName.name === values.currentTargetName.srcName) {
        errors.currentTargetName =
          'This matches the current name for this namespace. Enter a new unique name for this target namespace.';
      } else if (hasDuplicateMapping) {
        errors.currentTargetName =
          'A mapped target namespace with that name already exists. Enter a unique name for this target namespaec.';
      }
      // } else if (
      //   //check for duplicate ns mappings
      //   // Do not allow multiple mappings to the same namespace name. Allow reverting to the old namespace name.
      //   !!values.editedNamespaces.find((ns) => {
      //     if (values.editedNamespaces.length > 0) {
      //       return (
      //         ns.newName === values.currentTargetName.name &&
      //         ns.oldName !== values.currentTargetName.name
      //       );
      //     } else {
      //       return false;
      //     }
      //   }) ||
      //   sourceClusterNamespaces.some((ns) => ns.name === values.currentTargetName.name)
      // ) {
      //   errors.currentTargetName =
      //     'A mapped target namespace with that name already exists. Enter a unique name for this target namespace.';
      // }
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
