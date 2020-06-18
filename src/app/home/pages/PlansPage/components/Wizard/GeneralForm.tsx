import React, { useEffect, useRef, useState } from 'react';
import { FormikProps } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import { Form, FormGroup, Grid, GridItem, TextInput, Title, Button } from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import AddEditTokenModal from '../../../../../common/components/AddEditTokenModal';
import { useOpenModal } from '../../../../duck/hooks';
import IconWithText from '../../../../../common/components/IconWithText';
import TokenSelect from './TokenSelect';
const styles = require('./GeneralForm.module');

interface IGeneralFormProps
  extends Pick<IOtherProps, 'clusterList' | 'storageList' | 'tokenList' | 'isEdit'>,
    Pick<
      FormikProps<IFormValues>,
      | 'handleBlur'
      | 'handleChange'
      | 'setFieldTouched'
      | 'setFieldValue'
      | 'values'
      | 'touched'
      | 'errors'
    > {}

const GeneralForm: React.FunctionComponent<IGeneralFormProps> = ({
  clusterList,
  storageList,
  tokenList,
  errors,
  handleBlur,
  handleChange,
  isEdit,
  setFieldTouched,
  setFieldValue,
  touched,
  values,
}: IGeneralFormProps) => {
  const planNameInputRef = useRef(null);
  useEffect(() => {
    planNameInputRef.current.focus();
  }, []);

  const onHandleChange = (val, e) => handleChange(e);

  let srcClusterOptions: string[] = ['No valid clusters found'];
  let targetClusterOptions: string[] = [];
  let storageOptions: string[] = ['No valid storage found'];

  if (clusterList.length) {
    srcClusterOptions = clusterList
      .filter(
        (cluster) =>
          cluster.MigCluster.metadata.name !== values.targetCluster &&
          cluster.ClusterStatus.hasReadyCondition
      )
      .map((cluster) => cluster.MigCluster.metadata.name);

    targetClusterOptions = clusterList
      .filter(
        (cluster) =>
          cluster.MigCluster.metadata.name !== values.sourceCluster &&
          cluster.ClusterStatus.hasReadyCondition
      )
      .map((cluster) => cluster.MigCluster.metadata.name);
  }

  if (storageList.length) {
    storageOptions = storageList
      .filter((storage) => storage.StorageStatus.hasReadyCondition)
      .map((storage) => storage.MigStorage.metadata.name);
  }

  const handleStorageChange = (value) => {
    const matchingStorage = storageList.find((c) => c.MigStorage.metadata.name === value);
    if (matchingStorage) {
      setFieldValue('selectedStorage', value);
      setFieldTouched('selectedStorage');
    }
  };

  const handleSourceChange = (value) => {
    const matchingCluster = clusterList.find((c) => c.MigCluster.metadata.name === value);
    if (matchingCluster) {
      setFieldValue('sourceCluster', value);
      setFieldValue('selectedNamespaces', []);
      setFieldTouched('sourceCluster');
      setFieldValue('sourceToken', null);
    }
  };

  const handleTargetChange = (value) => {
    const matchingCluster = clusterList.find((c) => c.MigCluster.metadata.name === value);
    if (matchingCluster) {
      setFieldValue('targetCluster', value);
      setFieldTouched('targetCluster');
      setFieldValue('targetToken', null);
    }
  };

  return (
    <Form>
      <Title size="md" className={styles.fieldGridTitle}>
        Give your plan a name
      </Title>

      <Grid md={6} gutter="md" className={spacing.mbMd}>
        <GridItem>
          <FormGroup
            label="Plan name"
            isRequired
            fieldId="planName"
            helperTextInvalid={touched.planName && errors.planName}
            isValid={!(touched.planName && errors.planName)}
          >
            <TextInput
              ref={planNameInputRef}
              onChange={(val, e) => onHandleChange(val, e)}
              onInput={() => setFieldTouched('planName', true, true)}
              onBlur={handleBlur}
              value={values.planName}
              name="planName"
              type="text"
              isValid={!errors.planName && touched.planName}
              id="planName"
              isDisabled={isEdit}
            />
          </FormGroup>
        </GridItem>
      </Grid>

      <Title size="md" className={styles.fieldGridTitle}>
        Select source and target clusters
      </Title>

      <Grid md={6} gutter="md" className={spacing.mbMd}>
        <GridItem>
          <FormGroup
            label="Source cluster"
            isRequired
            fieldId="sourceCluster"
            helperTextInvalid={touched.sourceCluster && errors.sourceCluster}
            isValid={!(touched.sourceCluster && errors.sourceCluster)}
          >
            <SimpleSelect
              id="sourceCluster"
              onChange={handleSourceChange}
              options={srcClusterOptions}
              value={values.sourceCluster}
              placeholderText="Select source..."
            />
          </FormGroup>
          <TokenSelect
            fieldId="sourceToken"
            tokenList={[
              // NATODO just pass in tokenList prop
              {
                Secret: { data: { token: 'foo' } },
                MigToken: {
                  apiVersion: '1.0',
                  kind: 'MigToken',
                  metadata: {
                    name: 'My Token',
                  },
                  spec: {
                    migClusterRef: { name: 'host', namespace: 'some-namespace' },
                    secretRef: { name: 'secret-name', namespace: 'some-namespace' },
                  },
                  status: {
                    observedDigest: 'foo',
                    type: 'OAuth',
                    expiresAt: '2020-06-08T20:55:53.825Z',
                  },
                },
              },
            ]}
            clusterName={values.sourceCluster}
            value={values.sourceToken}
            onChange={(tokenName) => {
              setFieldTouched('sourceToken');
              setFieldValue('sourceToken', tokenName);
            }}
            touched={touched.sourceToken}
            error={errors.sourceToken}
            expiringSoonMessage="The users's selected token on cluster source will expire soon."
            expiredMessage="The user's selected token on cluster source is expired."
          />
        </GridItem>

        <GridItem>
          <FormGroup
            label="Target cluster"
            isRequired
            fieldId="targetCluster"
            helperTextInvalid={touched.targetCluster && errors.targetCluster}
            isValid={!(touched.targetCluster && errors.targetCluster)}
          >
            <SimpleSelect
              id="targetCluster"
              onChange={handleTargetChange}
              options={targetClusterOptions}
              value={values.targetCluster}
              placeholderText="Select target..."
            />
          </FormGroup>
          <TokenSelect
            fieldId="targetToken"
            tokenList={tokenList}
            clusterName={values.targetCluster}
            value={values.targetToken}
            onChange={(tokenName) => {
              setFieldTouched('targetToken');
              setFieldValue('targetToken', tokenName);
            }}
            touched={touched.targetToken}
            error={errors.targetToken}
            expiringSoonMessage="The users's selected token on cluster target will expire soon."
            expiredMessage="The user's selected token on cluster target is expired."
          />
        </GridItem>
      </Grid>

      <Title size="md" className={styles.fieldGridTitle}>
        Select a replication repository
      </Title>

      <Grid md={6} gutter="md">
        <GridItem>
          <FormGroup
            label="Repository"
            isRequired
            fieldId="selectedStorage"
            helperTextInvalid={touched.selectedStorage && errors.selectedStorage}
            isValid={!(touched.selectedStorage && errors.selectedStorage)}
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
