import React, { useEffect, useRef, useState } from 'react';
import { useFormikContext } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import { Form, FormGroup, Grid, GridItem, TextInput, Title, Tooltip } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import { useForcedValidationOnChange } from '../../../../../common/duck/hooks';
import { validatedState } from '../../../../../common/helpers';
import { ICluster } from '../../../../../cluster/duck/types';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { usePausedPollingEffect } from '../../../../../common/context';
const styles = require('./GeneralForm.module').default;

export type IGeneralFormProps = Pick<IOtherProps, 'clusterList' | 'storageList' | 'isEdit'>;

const GeneralForm: React.FunctionComponent<IGeneralFormProps> = ({
  clusterList,
  storageList,
  isEdit,
}: IGeneralFormProps) => {
  usePausedPollingEffect();
  const {
    handleBlur,
    handleChange,
    setFieldTouched,
    setFieldValue,
    values,
    touched,
    errors,
    validateForm,
  } = useFormikContext<IFormValues>();

  useForcedValidationOnChange<IFormValues>(values, isEdit, validateForm);

  const planNameInputRef = useRef(null);
  useEffect(() => {
    planNameInputRef.current.focus();
  }, []);

  const onHandleChange = (val, e) => handleChange(e);

  let storageOptions: string[] = ['No valid storage found'];

  const srcClusterOptions: OptionWithValue<ICluster>[] = clusterList.map((cluster) => {
    const clusterName = cluster.MigCluster.metadata.name;
    const hasCriticalCondition = cluster.ClusterStatus.hasCriticalCondition;
    const hasWarnCondition = cluster.ClusterStatus.hasWarnCondition;
    const errorMessage = cluster.ClusterStatus.errorMessage;
    return {
      value: cluster,
      toString: () => clusterName,
      props: {
        isDisabled: hasCriticalCondition,
        className: hasCriticalCondition ? 'disabled-with-pointer-events' : '',
        children: (
          <div>
            {hasCriticalCondition || hasWarnCondition ? (
              <>
                <span className={spacing.mrSm}>{clusterName}</span>
                <Tooltip content={<div>{errorMessage}</div>}>
                  <span className="pf-c-icon pf-m-warning">
                    <ExclamationTriangleIcon />
                  </span>
                </Tooltip>
              </>
            ) : (
              <div>{clusterName}</div>
            )}
          </div>
        ),
      },
    };
  });

  const targetClusterOptions: OptionWithValue<ICluster>[] = clusterList.map((cluster) => {
    const clusterName = cluster.MigCluster.metadata.name;
    const hasCriticalCondition = cluster.ClusterStatus.hasCriticalCondition;
    const hasWarnCondition = cluster.ClusterStatus.hasWarnCondition;
    const errorMessage = cluster.ClusterStatus.errorMessage;
    return {
      value: cluster,
      toString: () => clusterName,
      props: {
        isDisabled: hasCriticalCondition,
        className: hasCriticalCondition ? 'disabled-with-pointer-events' : '',
        children: (
          <div>
            {hasCriticalCondition || hasWarnCondition ? (
              <>
                <span className={spacing.mrSm}>{clusterName}</span>
                <Tooltip content={<div>{errorMessage}</div>}>
                  <span className="pf-c-icon pf-m-warning">
                    <ExclamationTriangleIcon />
                  </span>
                </Tooltip>
              </>
            ) : (
              <div>{clusterName}</div>
            )}
          </div>
        ),
      },
    };
  });

  if (storageList.length) {
    storageOptions = storageList
      .filter((storage) => storage.StorageStatus.hasReadyCondition)
      .map((storage) => storage.MigStorage.metadata.name);
  }

  const handleStorageChange = (value) => {
    const matchingStorage = storageList.find((c) => c.MigStorage.metadata.name === value);
    if (matchingStorage) {
      setFieldValue('selectedStorage', value);
      setFieldTouched('selectedStorage', true, true);
    }
  };

  const handleSourceChange = (clusterOption) => {
    const matchingCluster = clusterList.find(
      (c) => c.MigCluster.metadata.name === clusterOption.value.MigCluster.metadata.name
    );
    if (matchingCluster) {
      setFieldValue('sourceCluster', matchingCluster.MigCluster.metadata.name);
      setFieldTouched('sourceCluster', true, true);
      setFieldValue('selectedNamespaces', []);
    }
  };

  const handleTargetChange = (clusterOption) => {
    const matchingCluster = clusterList.find(
      (c) => c.MigCluster.metadata.name === clusterOption.value.MigCluster.metadata.name
    );
    if (matchingCluster) {
      setFieldValue('targetCluster', matchingCluster.MigCluster.metadata.name);
      setFieldTouched('targetCluster', true, true);
    }
  };

  return (
    <Form>
      <Title headingLevel="h1" size="md" className={styles.fieldGridTitle}>
        Give your plan a name
      </Title>

      <Grid md={6} hasGutter className={spacing.mbMd}>
        <GridItem>
          <FormGroup
            label="Plan name"
            isRequired
            fieldId="planName"
            helperTextInvalid={touched.planName && errors.planName}
            validated={validatedState(touched.planName, errors.planName)}
          >
            <TextInput
              ref={planNameInputRef}
              onChange={(val, e) => onHandleChange(val, e)}
              onInput={() => setFieldTouched('planName', true, true)}
              onBlur={handleBlur}
              value={values.planName}
              name="planName"
              type="text"
              validated={validatedState(touched?.planName, errors?.planName)}
              id="planName"
              isDisabled={isEdit}
            />
          </FormGroup>
        </GridItem>
      </Grid>

      <Title headingLevel="h3" size="md" className={styles.fieldGridTitle}>
        Select source and target clusters
      </Title>

      <Grid md={6} hasGutter className={spacing.mbMd}>
        <GridItem>
          <FormGroup
            label="Source cluster"
            isRequired
            fieldId="sourceCluster"
            className={spacing.mbMd}
          >
            <SimpleSelect
              id="sourceCluster"
              onChange={handleSourceChange}
              value={values.sourceCluster}
              placeholderText="Select source..."
              options={srcClusterOptions}
            />
          </FormGroup>
        </GridItem>

        <GridItem>
          <FormGroup
            label="Target cluster"
            isRequired
            fieldId="targetCluster"
            helperTextInvalid={touched.targetCluster && errors.targetCluster}
            validated={validatedState(touched.targetCluster, errors.targetCluster)}
          >
            <SimpleSelect
              id="targetCluster"
              onChange={handleTargetChange}
              options={targetClusterOptions}
              value={values.targetCluster}
              placeholderText="Select target..."
            />
          </FormGroup>
        </GridItem>
      </Grid>

      <Title headingLevel="h3" size="md" className={styles.fieldGridTitle}>
        Select a replication repository
      </Title>

      <Grid md={6} hasGutter>
        <GridItem>
          <FormGroup
            label="Repository"
            isRequired
            fieldId="selectedStorage"
            helperTextInvalid={touched.selectedStorage && errors.selectedStorage}
            validated={validatedState(touched.selectedStorage, errors.selectedStorage)}
          >
            <SimpleSelect
              id="selectedStorage"
              onChange={handleStorageChange}
              options={storageOptions}
              value={values.selectedStorage}
              placeholderText="Select repository..."
            />
          </FormGroup>
        </GridItem>
      </Grid>
    </Form>
  );
};

export default GeneralForm;
