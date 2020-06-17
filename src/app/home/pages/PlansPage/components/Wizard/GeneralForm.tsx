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

  const getTokenOptionsForCluster = (
    clusterName: string,
    onAddTokenClick: () => void
  ): OptionWithValue[] => {
    const empty: OptionWithValue = {
      toString: () => 'No tokens found for the selected cluster',
      value: null,
      props: {
        className: styles.nonSelectable,
        isDisabled: true, // NATODO does this make it stay open after the modal closes?
        children: (
          <>
            <span className="pf-m-disabled">No tokens found for the selected cluster.</span>
            <Button
              variant="link"
              isInline
              className={styles.addTokenOptionLink}
              onClick={onAddTokenClick}
            >
              Add token
            </Button>
          </>
        ),
      },
    };
    if (!clusterName || !tokenList) return [empty];
    const availableTokens = tokenList.filter(
      (token) => token.MigToken.spec.migClusterRef.name === clusterName
    );
    if (availableTokens.length === 0) return [empty];
    return availableTokens.map((token) => ({
      toString: () => token.MigToken.metadata.name,
      value: token.MigToken.metadata.name,
    }));
  };

  const getSelectedTokenOption = (tokenName: string, tokenOptions: OptionWithValue[]) => {
    if (!tokenName) return null;
    return tokenOptions.find((option) => option.value === tokenName);
  };

  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);
  const [newTokenField, setNewTokenField] = useState<'sourceToken' | 'targetToken'>(null);

  const onAddSourceTokenClick = () => {
    setNewTokenField('sourceToken');
    toggleAddEditModal();
  };

  const onAddTargetTokenClick = () => {
    setNewTokenField('targetToken');
    toggleAddEditModal();
  };

  const onTokenCreated = (tokenName: string) => {
    setFieldValue(newTokenField, tokenName);
  };

  const sourceTokenOptions = getTokenOptionsForCluster(values.sourceCluster, onAddSourceTokenClick);
  const targetTokenOptions = getTokenOptionsForCluster(values.targetCluster, onAddTargetTokenClick);
  const selectedSourceTokenOption = getSelectedTokenOption(values.sourceToken, sourceTokenOptions);
  const selectedTargetTokenOption = getSelectedTokenOption(values.targetToken, targetTokenOptions);

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
      setNewTokenField(null);
    }
  };

  const handleTargetChange = (value) => {
    const matchingCluster = clusterList.find((c) => c.MigCluster.metadata.name === value);
    if (matchingCluster) {
      setFieldValue('targetCluster', value);
      setFieldTouched('targetCluster');
      setNewTokenField(null);
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
              onChange={(selection: OptionWithValue) => {
                if (selection.value) {
                  setFieldValue('sourceToken', selection.value);
                  setFieldTouched('sourceToken');
                }
              }}
              options={sourceTokenOptions}
              value={selectedSourceTokenOption}
              placeholderText="Select token..."
              isDisabled={!values.sourceCluster}
            />
            <AddEditTokenModal
              isOpen={isAddEditModalOpen}
              onClose={toggleAddEditModal}
              onTokenCreated={onTokenCreated}
            />
          </FormGroup>
          {newTokenField === 'sourceToken' && values.sourceToken && (
            <div className={spacing.mSm}>
              <IconWithText
                icon={
                  <span className="pf-c-icon pf-m-success">
                    <CheckIcon />
                  </span>
                }
                text="Token associated"
              />
            </div>
          )}
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
              onChange={(selection: OptionWithValue) => {
                if (selection.value) {
                  setFieldValue('targetToken', selection.value);
                  setFieldTouched('targetToken');
                }
              }}
              options={targetTokenOptions}
              value={selectedTargetTokenOption}
              placeholderText="Select token..."
              isDisabled={!values.targetCluster}
            />
          </FormGroup>
          {newTokenField === 'targetToken' && values.targetToken && (
            <div className={spacing.mSm}>
              <IconWithText
                icon={
                  <span className="pf-c-icon pf-m-success">
                    <CheckIcon />
                  </span>
                }
                text="Token associated"
              />
            </div>
          )}
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
