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
  const planPVs = plan.MigPlan.spec.persistentVolumes;
  const initialValues = { ...defaultInitialValues };
  initialValues.persistentVolumes = planPVs || [];
  if (planPVs === null) return null;

  return (
    <Formik<IStateMigrationFormValues>
      initialValues={initialValues}
      validate={(values: IStateMigrationFormValues) => {
        const errors: { [key in keyof IStateMigrationFormValues]?: string } = {}; // TODO figure out why using FormikErrors<IFormValues> here causes type errors below
        const srcPVs: any = [];

        const targetNamespaceNameError = utils.testTargetNSName(values?.currentTargetName?.name);
        if (!values.currentTargetName) {
          errors.currentTargetName = 'Required';
        } else if (targetNamespaceNameError !== '') {
          errors.currentTargetName = targetNamespaceNameError;
        } else if (values.currentTargetName.name === values.currentTargetName.srcName) {
          errors.currentTargetName =
            'This matches the current name for this namespace. Enter a new unique name for this target namespace.';
        } else if (
          //check for duplicate ns mappings
          // Do not allow multiple mappings to the same namespace name. Allow reverting to the old namespace name.
          !!values.editedPVs.find((pv) => {
            if (values.editedPVs.length > 0) {
              return (
                pv.newName === values.currentTargetName.name &&
                pv.oldName !== values.currentTargetName.name
              );
            } else {
              return false;
            }
          }) ||
          srcPVs.some((pv: any) => pv.name === values.currentTargetName.name)
        ) {
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
