import React, { useEffect, useRef } from 'react';
import { FormikProps } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import { Form, FormGroup, Grid, GridItem, TextInput, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import SimpleSelect from '../../../../../common/components/SimpleSelect';
const styles = require('./GeneralForm.module');

interface IProps {
  component: React.ReactNode;
}

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

  const getTokenOptionsForCluster = (clusterName: string): string[] => {
    if (!clusterName || !tokenList) return [];
    return tokenList
      .filter((token) => token.MigToken.spec.migClusterRef.name === clusterName)
      .map((token) => token.MigToken.metadata.name);
  };

  const sourceTokenOptions = getTokenOptionsForCluster(values.sourceCluster);
  const targetTokenOptions = getTokenOptionsForCluster(values.targetCluster);

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
    }
  };

  const handleTargetChange = (value) => {
    const matchingCluster = clusterList.find((c) => c.MigCluster.metadata.name === value);
    if (matchingCluster) {
      setFieldValue('targetCluster', value);
      setFieldTouched('targetCluster');
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
          <FormGroup
            className={spacing.mtMd}
            label="Authentication token"
            isRequired
            fieldId="sourceToken"
            helperTextInvalid={touched.sourceToken && errors.sourceToken}
            isValid={!(touched.sourceToken && errors.sourceToken)}
          >
            <SimpleSelect
              id="sourceToken"
              onChange={(selection) => {
                setFieldValue('sourceToken', selection);
                setFieldTouched('sourceToken');
              }}
              options={sourceTokenOptions}
              value={values.sourceToken}
              placeholderText="Select token..."
              isDisabled={!values.sourceCluster}
            />
          </FormGroup>
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
          <FormGroup
            className={spacing.mtMd}
            label="Authentication token"
            isRequired
            fieldId="targetToken"
            helperTextInvalid={touched.targetToken && errors.targetToken}
            isValid={!(touched.targetToken && errors.targetToken)}
          >
            <SimpleSelect
              id="targetToken"
              onChange={(selection: string) => {
                setFieldValue('targetToken', selection);
                setFieldTouched('targetToken');
              }}
              options={targetTokenOptions}
              value={values.targetToken}
              placeholderText="Select token..."
              isDisabled={!values.targetCluster}
            />
          </FormGroup>
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
