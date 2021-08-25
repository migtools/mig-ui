import React from 'react';
import { Formik } from 'formik';
import {
  IPlan,
  IPlanPersistentVolume,
  ISourceClusterNamespace,
} from '../../../../../plan/duck/types';
import utils from '../../../../../common/duck/utils';
import { IEditedPV } from './StateMigrationTable';

export interface IStateMigrationFormikProps {
  plan?: IPlan;
  children: React.ReactNode;
}

export interface IStateMigrationFormValues {
  editedPVs: Array<IEditedPV>;
  selectedPVs: Array<string>;
  currentTargetPVCName?: {
    name: string;
    srcPVName: string;
  };
  persistentVolumes: Array<IPlanPersistentVolume>;
}

const defaultInitialValues: IStateMigrationFormValues = {
  editedPVs: [],
  selectedPVs: [],
  currentTargetPVCName: null,
  persistentVolumes: [],
};

const StateMigrationFormik: React.FunctionComponent<IStateMigrationFormikProps> = ({
  plan,
  children,
}: IStateMigrationFormikProps) => {
  const filteredPlanPVs = plan.MigPlan.spec.persistentVolumes.filter(
    (pv) => pv.selection.action !== 'move'
  );
  const initialValues = { ...defaultInitialValues };
  initialValues.persistentVolumes = filteredPlanPVs || [];
  if (filteredPlanPVs === null) return null;

  return (
    <Formik<IStateMigrationFormValues>
      initialValues={initialValues}
      validate={(values: IStateMigrationFormValues) => {
        const errors: { [key in keyof IStateMigrationFormValues]?: string } = {}; // TODO figure out why using FormikErrors<IFormValues> here causes type errors below

        const existingPVCNameMap = values.persistentVolumes.map((pvItem) => {
          let targetPVCName = pvItem.pvc.name;
          let sourcePVCName = pvItem.pvc.name;
          const pvcNamespace = pvItem.pvc.namespace;
          const pvName = pvItem.name;
          let editedPV = values.editedPVs.find(
            (editedPV) =>
              editedPV.oldName === pvItem.pvc.name && editedPV.namespace === pvItem.pvc.namespace
          );
          const includesMapping = sourcePVCName.includes(':');
          if (includesMapping) {
            const mappedPVCNameArr = sourcePVCName.split(':');
            editedPV = values.editedPVs.find(
              (editedPV) =>
                editedPV.oldName === mappedPVCNameArr[0] &&
                editedPV.namespace === pvItem.pvc.namespace
            );
            if (mappedPVCNameArr[0] === mappedPVCNameArr[1]) {
              sourcePVCName = mappedPVCNameArr[0];
              targetPVCName = editedPV ? editedPV.newName : mappedPVCNameArr[0];
            } else {
              sourcePVCName = mappedPVCNameArr[0];
              targetPVCName = editedPV ? editedPV.newName : mappedPVCNameArr[1];
            }
            return {
              sourcePVCName,
              targetPVCName,
              pvName,
              pvcNamespace,
            };
          }
        });
        const hasDuplicateMapping = existingPVCNameMap.find((pv, index) => {
          const editedPVCName = values?.currentTargetPVCName?.name;
          const editedPVCNameAssociatedPVName = values?.currentTargetPVCName?.srcPVName;
          return (
            (editedPVCName === pv.targetPVCName && editedPVCNameAssociatedPVName !== pv.pvName) ||
            (editedPVCName === pv.sourcePVCName && editedPVCNameAssociatedPVName !== pv.pvName)
          );
        });

        const targetNamespaceNameError = utils.testTargetNSName(values?.currentTargetPVCName?.name);
        if (!values?.currentTargetPVCName) {
          errors.currentTargetPVCName = 'Required';
        } else if (targetNamespaceNameError !== '') {
          errors.currentTargetPVCName = targetNamespaceNameError;
        } else if (values?.currentTargetPVCName?.name === values?.currentTargetPVCName?.srcPVName) {
          errors.currentTargetPVCName =
            'This matches the current name for this namespace. Enter a new unique name for this target namespace.';
        } else if (hasDuplicateMapping) {
          errors.currentTargetPVCName =
            'A mapped target pvc with that name already exists. Enter a unique name for this target pvc.';
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
};

export default StateMigrationFormik;
