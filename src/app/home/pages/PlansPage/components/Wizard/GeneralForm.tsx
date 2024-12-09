import { Form, FormGroup, Text, TextContent, TextInput, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFormikContext } from 'formik';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { DefaultRootState } from '../../../../../../configureStore';
import { ICluster } from '../../../../../cluster/duck/types';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import { usePausedPollingEffect } from '../../../../../common/context';
import { useForcedValidationOnChange } from '../../../../../common/duck/hooks';
import { validatedState } from '../../../../../common/helpers';
import { IStorage } from '../../../../../storage/duck/types';
import { MigrationType } from '../../types';
import { IFormValues } from './WizardContainer';

export type IGeneralFormProps = {
  isEdit: boolean;
  clusterList: ICluster[];
  storageList: IStorage[];
};

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

  const { currentPlan } = useSelector((state: DefaultRootState) => state.plan);

  useForcedValidationOnChange<IFormValues>(values, isEdit, validateForm);

  const planNameInputRef = useRef(null);
  useEffect(() => {
    planNameInputRef.current.focus();
  }, []);

  const onHandleChange = (val: any, e: any) => handleChange(e);

  let storageOptions: string[] = ['No valid storage found'];

  const migrationTypeDescriptions: Record<MigrationType, string> = {
    full: 'Full migration - migrate namespaces, persistent volumes (PVs) and Kubernetes resources from one cluster to another',
    state:
      'State migration - migrate only PVs between namespaces in the same cluster or different clusters',
    scc: 'Storage class conversion - convert PVs to a different storage class within the same cluster and namespace',
  };

  const migrationTypeOptions: OptionWithValue<MigrationType>[] = [
    {
      value: 'full',
      toString: () => migrationTypeDescriptions.full,
      props:
        storageList.length === 0
          ? {
              isDisabled: true,
              className: 'disabled-with-pointer-events',
              children: (
                <Tooltip
                  content="A minimum of 1 replication repository is required to create a full migration plan."
                  position="left"
                >
                  <div>{migrationTypeDescriptions.full}</div>
                </Tooltip>
              ),
            }
          : {},
    },
    {
      value: 'state',
      toString: () => migrationTypeDescriptions.state,
      props:
        storageList.length === 0
          ? {
              isDisabled: true,
              className: 'disabled-with-pointer-events',
              children: (
                <Tooltip
                  content="A minimum of 1 replication repository is required to create a state migration plan."
                  position="left"
                >
                  <div>{migrationTypeDescriptions.state}</div>
                </Tooltip>
              ),
            }
          : {},
    },
    {
      value: 'scc',
      toString: () => migrationTypeDescriptions.scc,
    },
  ];

  const srcClusterOptions: OptionWithValue<ICluster>[] = clusterList
    .map((cluster) => {
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
    })
    .filter((cluster) => {
      if (values.migrationType.value === 'full' && values.targetCluster) {
        return cluster.value.MigCluster.metadata.name !== values.targetCluster;
      } else {
        return cluster;
      }
    });

  const targetClusterOptions: OptionWithValue<ICluster>[] = clusterList
    .map((cluster) => {
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
    })
    .filter((cluster) => {
      if (values.migrationType.value === 'full' && values.sourceCluster) {
        return cluster.value.MigCluster.metadata.name !== values.sourceCluster;
      } else {
        return cluster;
      }
    });

  if (storageList.length) {
    storageOptions = storageList
      .filter((storage) => storage.StorageStatus.hasReadyCondition)
      .map((storage) => storage.MigStorage.metadata.name);
  }

  const handleStorageChange = (value: any) => {
    const matchingStorage = storageList.find((c) => c.MigStorage.metadata.name === value);
    if (matchingStorage) {
      setFieldValue('selectedStorage', value);
      setFieldTouched('selectedStorage', true, true);
    }
  };

  const handleSourceChange = (clusterOption: any) => {
    const matchingCluster = clusterList.find(
      (c) => c.MigCluster.metadata.name === clusterOption.value.MigCluster.metadata.name
    );
    if (matchingCluster) {
      setFieldValue('sourceCluster', matchingCluster.MigCluster.metadata.name);
      setFieldTouched('sourceCluster', true, true);
      setFieldValue('selectedNamespaces', []);
      setFieldValue('selectedPVs', []);
    }
    if (values.migrationType.value === 'scc') {
      setFieldValue('targetCluster', matchingCluster.MigCluster.metadata.name);
      setFieldTouched('targetCluster', true, true);
      setFieldValue('selectedNamespaces', []);
      setFieldValue('selectedPVs', []);

      //TEMP WORKAROUND
      const matchingStorage = storageList.find(
        (storage) => storage.StorageStatus.hasReadyCondition
      );
      if (matchingStorage) {
        setFieldValue('selectedStorage', matchingStorage.MigStorage.metadata.name);
        setFieldTouched('selectedStorage', true, true);
      }
    }
  };

  const handleTargetChange = (clusterOption: any) => {
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
      <TextContent>
        <Text component="small">All fields are required.</Text>
      </TextContent>
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
          isDisabled={isEdit || !!currentPlan}
        />
      </FormGroup>
      <FormGroup
        label="Migration type"
        isRequired
        fieldId="migrationType"
        helperTextInvalid={touched.migrationType && errors.migrationType}
        validated={validatedState(touched.migrationType, errors.migrationType)}
      >
        <SimpleSelect
          id="migrationType"
          onChange={(option) => {
            setFieldValue('migrationType', option);
            setFieldValue('sourceCluster', null);
            setFieldValue('targetCluster', null);
          }}
          value={values.migrationType.toString()}
          placeholderText="Select..."
          options={migrationTypeOptions}
          isDisabled={isEdit}
        />
      </FormGroup>
      <FormGroup
        label="Source cluster"
        isRequired
        fieldId="sourceCluster"
        helperTextInvalid={touched.sourceCluster && errors.sourceCluster}
        validated={validatedState(touched.sourceCluster, errors.sourceCluster)}
      >
        <SimpleSelect
          id="sourceCluster"
          onChange={handleSourceChange}
          value={values.sourceCluster}
          placeholderText="Select source..."
          options={srcClusterOptions}
        />
      </FormGroup>

      {(values.migrationType.value === 'full' || values.migrationType.value === 'state') && (
        <>
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
        </>
      )}
    </Form>
  );
};

export default GeneralForm;
