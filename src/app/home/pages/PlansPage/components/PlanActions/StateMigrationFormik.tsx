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
  currentTargetName?: {
    name: string;
    srcName: string;
  };
  persistentVolumes: Array<IPlanPersistentVolume>;
}

const defaultInitialValues: IStateMigrationFormValues = {
  editedPVs: [],
  selectedPVs: [],
  currentTargetName: null,
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
        //check for duplicates
        // Do not allow multiple mappings to the same namespace name. Allow reverting to the old namespace name.
        const hasDuplicateMapping = existingPVCNameMap.find((pv, index) => {
          const editedPVCName = values.currentTargetName.name;
          const editedPVCNameAssociatedPVName = values.currentTargetName.srcName;
          return (
            // Throw validation for duplicate mapping
            // if current edited name:
            // IS saved new mapping within this session &
            (editedPVCName === pv.targetPVCName &&
              // IS NOT the same as current edited index
              editedPVCNameAssociatedPVName !== pv.pvName) ||
            // OR
            // IS a dup of current src cluster pvc name &
            (editedPVCName === pv.sourcePVCName &&
              // IS NOT the same as current edited index
              editedPVCNameAssociatedPVName !== pv.pvName)
          );
        });

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
