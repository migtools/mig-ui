import React from 'react';
import { Formik } from 'formik';
import { IMigPlan, IPlan, ISourceClusterNamespace } from '../../../../../plan/duck/types';
import { IFormValues } from './WizardContainer';
import utils from '../../../../../common/duck/utils';
import { useDispatch } from 'react-redux';
import { PlanActions } from '../../../../../plan/duck/actions';
import { CurrentPlanState } from '../../../../../plan/duck/reducers';

export interface IWizardFormikProps {
  initialValues: IFormValues;
  isEdit?: boolean;
  currentPlan?: IMigPlan;
  planList?: IPlan[];
  sourceClusterNamespaces: ISourceClusterNamespace[];
  children: React.ReactNode;
}

const WizardFormik: React.FunctionComponent<IWizardFormikProps> = ({
  initialValues,
  isEdit = false,
  currentPlan = null,
  planList = [],
  sourceClusterNamespaces,
  children,
}: IWizardFormikProps) => {
  const dispatch = useDispatch();
  return (
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
          !currentPlan &&
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
        if (values.migrationType.value !== 'scc' && !values.selectedStorage) {
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
        const hasUnchangedIntraClusterNs =
          values?.sourceCluster === values?.targetCluster &&
          values.migrationType.value !== 'scc' &&
          values?.currentTargetNamespaceName?.name === values?.currentTargetNamespaceName?.srcName;

        const targetNamespaceNameError = utils.testTargetName(
          values?.currentTargetNamespaceName?.name
        );
        if (targetNamespaceNameError !== '') {
          errors.currentTargetNamespaceName = targetNamespaceNameError;
        } else if (hasUnchangedIntraClusterNs) {
          errors.currentTargetNamespaceName =
            'Target namespace name cannot be the same as source namespace name. Enter a unique name for this target namespace.';
        } else if (hasDuplicateMapping) {
          errors.currentTargetNamespaceName =
            'A mapped target namespace with that name already exists. Enter a unique name for this target namespace.';
        }

        const existingPVCNameMap = values.persistentVolumes.map((pvItem) => {
          let targetPVCName = pvItem.pvc.name;
          let sourcePVCName = pvItem.pvc.name;
          const pvcNamespace = pvItem.pvc.namespace;
          const pvName = pvItem.name;
          let editedPV = values.editedPVs.find(
            (editedPV) => editedPV.oldPVCName === pvItem.pvc.name && editedPV.pvName === pvItem.name
          );
          const includesMapping = sourcePVCName.includes(':');
          if (includesMapping) {
            const mappedPVCNameArr = sourcePVCName.split(':');
            editedPV = values.editedPVs.find(
              (editedPV) =>
                editedPV.oldPVCName === mappedPVCNameArr[0] && editedPV.pvName === pvItem.name
            );
            if (mappedPVCNameArr[0] === mappedPVCNameArr[1]) {
              sourcePVCName = mappedPVCNameArr[0];
              targetPVCName = editedPV ? editedPV.newPVCName : mappedPVCNameArr[0];
            } else {
              sourcePVCName = mappedPVCNameArr[0];
              targetPVCName = editedPV ? editedPV.newPVCName : mappedPVCNameArr[1];
            }
            return {
              sourcePVCName,
              targetPVCName,
              pvName,
              pvcNamespace,
            };
          } else {
            return {
              sourcePVCName,
              targetPVCName,
              pvName,
              pvcNamespace,
            };
          }
        });
        const hasDuplicatePVMapping = existingPVCNameMap.find((pv, index) => {
          const editedPVCName = values?.currentTargetPVCName?.name;
          const editedPVCNameAssociatedPVName = values?.currentTargetPVCName?.srcPVName;
          const isIntraClusterPlan = values.sourceCluster === values.targetCluster;

          return (
            (editedPVCName === pv?.targetPVCName && editedPVCNameAssociatedPVName !== pv.pvName) ||
            (editedPVCName === pv?.sourcePVCName && editedPVCNameAssociatedPVName !== pv.pvName) ||
            (editedPVCName === pv?.sourcePVCName && isIntraClusterPlan)
          );
        });

        const targetPVCNameError = utils.testTargetName(values?.currentTargetPVCName?.name);
        if (targetPVCNameError !== '') {
          errors.currentTargetPVCName = targetPVCNameError;
        } else if (hasDuplicatePVMapping) {
          errors.currentTargetPVCName =
            'A mapped target pvc with that name already exists. Enter a unique name for this target pvc.';
        }

        return errors;
      }}
      onSubmit={(values) => {
        dispatch(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.Pending }));
        dispatch(PlanActions.validatePlanRequest(values));
      }}
      validateOnBlur={false}
      enableReinitialize
    >
      {children}
    </Formik>
  );
};

export default WizardFormik;
