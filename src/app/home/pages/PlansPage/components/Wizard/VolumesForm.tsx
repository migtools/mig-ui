import { StatusIcon } from '@konveyor/lib-ui';
import { Bullseye, EmptyState, Grid, GridItem, Spinner, Title } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DefaultRootState } from '../../../../../../configureStore';
import { usePausedPollingEffect } from '../../../../../common/context';
import { PlanActions } from '../../../../../plan/duck/actions';
import { IPlanPersistentVolume } from '../../../../../plan/duck/types';
import VolumesTable from './VolumesTable';
import { IFormValues, IOtherProps } from './WizardContainer';

const styles = require('./VolumesTable.module').default;

const VolumesForm: React.FunctionComponent<IOtherProps> = (props) => {
  usePausedPollingEffect();
  const dispatch = useDispatch();
  const planState = useSelector((state: DefaultRootState) => state.plan);

  const { setFieldValue, values } = useFormikContext<IFormValues>();

  useEffect(() => {
    //kick off pv discovery once volumes form is reached with current selected namespaces
    dispatch(PlanActions.pvDiscoveryRequest(values));
  }, []);

  const migPlanPvs = planState.currentPlan?.spec.persistentVolumes || null;
  useEffect(() => {
    if (
      values.migrationType.value === 'scc' &&
      (!values.pvVerifyFlagAssignment || isEmpty(values.pvVerifyFlagAssignment))
    ) {
      let pvVerifyFlagAssignment = {};
      if (migPlanPvs) {
        pvVerifyFlagAssignment = migPlanPvs.reduce(
          (assignedVerifyFlags, pv) => ({
            ...assignedVerifyFlags,
            [pv.name]: !!pv.selection.verify,
          }),
          {}
        );
      }
      setFieldValue('pvVerifyFlagAssignment', pvVerifyFlagAssignment);
    }
  }, []);

  const discoveredPersistentVolumes =
    (planState.currentPlan && planState.currentPlan.spec.persistentVolumes) || [];
  useEffect(() => {
    if (discoveredPersistentVolumes.length > 0) {
      dispatch(
        PlanActions.getPVResourcesRequest(discoveredPersistentVolumes, values.sourceCluster || '')
      );
      let mappedPVs: IPlanPersistentVolume[];
      if (values.persistentVolumes) {
        //set initial pvs inside wizard
        mappedPVs = discoveredPersistentVolumes.map((planVolume) => {
          let pvAction = 'copy'; // Default to copy
          if (values.persistentVolumes.length !== 0) {
            const matchingPV = values.persistentVolumes.find((v) => v.name === planVolume.name);
            if (matchingPV && planVolume.selection.action) {
              //set initial value for pv action
              pvAction = planVolume.selection.action;
            }
          }
          return {
            ...planVolume,
            storageClass: planVolume.storageClass || 'None',
            selection: {
              ...planVolume.selection,
              action: pvAction,
            },
          };
        });
      } else {
        mappedPVs = discoveredPersistentVolumes.map((planVolume) => {
          const pvAction = 'copy'; // Default to copy
          return {
            ...planVolume,
            selection: {
              ...planVolume.selection,
              action: pvAction,
            },
          };
        });
      }
      const selectedPVs = mappedPVs
        .filter((pv) => pv.selection.action !== 'skip')
        .map((pv) => pv.name);
      setFieldValue('selectedPVs', selectedPVs);

      //Set initial PVs from pv discovery
      setFieldValue('persistentVolumes', mappedPVs);
    }
  }, [discoveredPersistentVolumes, planState.currentPlanStatus]); // Only re-run the effect if fetching value changes

  if (planState.isPVError) {
    return (
      <Grid hasGutter className={styles.centerAlign}>
        <GridItem>
          <div className={styles.errorDiv}>
            <StatusIcon status="Error" label="PV Discovery Error" />
          </div>
        </GridItem>
      </Grid>
    );
  }
  if (!planState.currentPlan?.status) {
    return (
      <Bullseye>
        <EmptyState variant="large">
          <div className="pf-c-empty-state__icon">
            <Spinner size="xl" />
          </div>
          <Title headingLevel="h2" size="xl">
            Discovering persistent volumes attached to source projects...
          </Title>
        </EmptyState>
      </Bullseye>
    );
  }
  return (
    <VolumesTable
      isEdit={props.isEdit}
      isOpen={props.isOpen}
      storageClasses={planState.currentPlan?.status?.destStorageClasses || []}
    />
  );
};
export default VolumesForm;
