import React, { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import {
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants,
  FormGroup,
  Radio,
  TextInput,
  Button,
  FileUpload,
  Tooltip,
  TooltipPosition,
  Form
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  AddEditMode,
  addEditButtonText,
} from '../../../common/add_edit_state';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import SimpleSelect from '../../../common/components/SimpleSelect';
const classNames = require('classnames');

const componentTypeStr = 'hook';
const addEditButtonTextFn = addEditButtonText(componentTypeStr);
const styles = require('./HooksForm.module');

interface IFormValues {
  hookName: string;
  hookImageType: string;
  ansibleFile: string;
  ansibleFilename: string;
  ansibleRuntimeImage: string;
  customContainerImage: string;
  srcServiceAccountName: string;
  srcServiceAccountNamespace: string;
  destServiceAccountName: string;
  destServiceAccountNamespace: string;
  clusterType: string;
  migrationStep: string;
}
interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  isEdit: boolean;
  isEditHook: any;
  setInitialHookValues: any;
  setIsAddHooksOpen: any;
  hookAddEditStatus: any;
  cancelAddEditWatch: () => void;
  resetAddEditState: () => void;
  currentPlan: any;
}

const HooksFormComponent = (props: IOtherProps & FormikProps<IFormValues>) => {

  const {
    setIsAddHooksOpen,
    setInitialHookValues,
    hookAddEditStatus,
    handleSubmit,
    touched,
    errors,
    setFieldValue,
    setFieldTouched,
    values,
    handleChange,
    handleBlur,
    cancelAddEditWatch,
    resetAddEditState,
    currentPlan
  } = props;

  const formikHandleChange = (_val, e) => handleChange(e);
  const formikSetFieldTouched = key => () => setFieldTouched(key, true, true);

  const hookNameKey = 'hookName';
  const hookImageTypeKey = 'hookImageType';
  const ansibleUploadKey = 'ansibleUpload';
  const customImageKey = 'customContainerImage';
  const ansibleRuntimeImageKey = 'ansibleRuntimeImage';
  const clusterTypeKey = 'clusterType';
  const srcServiceAccountNameKey = 'srcServiceAccountName';
  const destServiceAccountNameKey = 'destServiceAccountName';
  const srcServiceAccountNamespaceKey = 'srcServiceAccountNamespace';
  const destServiceAccountNamespaceKey = 'destServiceAccountNamespace';
  const migrationStepKey = 'migrationStep'
  const [phaseOptions, setPhaseOptions] = useState([
    'PreBackup',
    'PostBackup',
    'PreRestore',
    'PostRestore'
  ]);

  useEffect(() => {
    if (currentPlan.spec.hooks) {
      const existingPhases = currentPlan.spec.hooks.map((hook) => {
        return hook.phase
      })
      let filteredPhases = []
      filteredPhases = phaseOptions.filter(phase => !existingPhases.includes(phase));
      setPhaseOptions(filteredPhases)
    }
  }, []);


  const handleFileChange = (value, filename, event) => {
    setFieldValue('ansibleFile', value)
    setFieldValue('ansibleFilename', filename)
  }
  const hookImageStyles = classNames(spacing.mtSm, spacing.mlMd)

  return (
    <Form onSubmit={handleSubmit}>
      <Grid span={8}>
        <GridItem>
          <FormGroup
            label="Hook name"
            isRequired
            fieldId={hookNameKey}
            helperTextInvalid={touched.hookName && errors.hookName}
            className={styles.styledFormGroupTitle}
            isValid={!(touched.hookName && errors.hookName)}
          >
            {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
            <TextInput
              value={values.hookName}
              onChange={formikHandleChange}
              onInput={formikSetFieldTouched(hookNameKey)}
              onBlur={handleBlur}
              name={hookNameKey}
              id="hook-name"
              type="text"
              isDisabled={hookAddEditStatus.mode === AddEditMode.Edit}
              isValid={!(touched.hookName && errors.hookName)}
            />
          </FormGroup>
        </GridItem>
        <GridItem className={spacing.mtMd}>
          <FormGroup
            label="Hook definition"
            fieldId='definition-group'
            className={styles.styledFormGroupTitle}
          >
            <Tooltip
              position={TooltipPosition.right}
              content={<div>There are two options for adding a hook definition: 1) Add an ansible playbook file to be run. A default hook runner image is provided, or you may choose your own.
              2) Specify only a custom image which will run your defined entrypoint when loaded.  </div>}
            >
              <span className={styles.tooltipStyles}>
                <OutlinedQuestionCircleIcon />
              </span>
            </Tooltip>
            <Grid>
              <GridItem className={spacing.mtSm}>
                <Radio
                  isChecked={values.hookImageType === 'ansible'}
                  name={hookImageTypeKey}
                  onChange={formikHandleChange}
                  label="Ansible playbook"
                  id="ansible-playbook-radio"
                  value="ansible"
                />
              </GridItem>
              {values.hookImageType === 'ansible' &&
                <React.Fragment>
                  <GridItem className={hookImageStyles}>
                    <FormGroup
                      label="Upload your Ansible playbook file or paste its contents below."
                      isRequired
                      fieldId={ansibleUploadKey}
                    >
                      <FileUpload
                        value={values.ansibleFile}
                        filename={values.ansibleFilename}
                        onChange={handleFileChange}
                        id="ansible-file"
                        type="text"
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem className={hookImageStyles}>
                    <FormGroup
                      label="Ansible runtime image"
                      isRequired
                      fieldId={ansibleRuntimeImageKey}
                      isValid={!(touched.ansibleRuntimeImage
                        && errors.ansibleRuntimeImage)}
                    >
                      {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
                      <TextInput
                        onChange={formikHandleChange}
                        onInput={formikSetFieldTouched(ansibleRuntimeImageKey)}
                        onBlur={handleBlur}
                        value={values.ansibleRuntimeImage}
                        name={ansibleRuntimeImageKey}
                        type="text"
                        id="ansible-runtime-image-name-input"
                        isValid={!(touched.ansibleRuntimeImage
                          && errors.ansibleRuntimeImage)}
                      />
                      <TextContent>
                        <Text component={TextVariants.p}>
                          This is the default Ansible runtime image.
                          You can change it to a custom image with your own modules.
                        </Text>
                      </TextContent>
                    </FormGroup>
                  </GridItem>
                </React.Fragment>
              }
              <GridItem className={spacing.mtSm}>
                <Radio
                  isChecked={values.hookImageType === 'custom'}
                  name={hookImageTypeKey}
                  onChange={formikHandleChange}
                  label="Custom container image"
                  id="custom-image-radio"
                  value="custom"
                />
              </GridItem>
              {values.hookImageType === 'custom' &&
                <GridItem className={hookImageStyles}>
                  <FormGroup
                    isRequired
                    fieldId={customImageKey}
                    isValid={!(touched.customContainerImage
                      && errors.customContainerImage)}
                  >
                    {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
                    <TextInput
                      onChange={formikHandleChange}
                      onInput={formikSetFieldTouched(customImageKey)}
                      onBlur={handleBlur}
                      value={values.customContainerImage}
                      name={customImageKey}
                      type="text"
                      id="container-image-name-input"
                      isValid={!(touched.customContainerImage
                        && errors.customContainerImage)}
                    />
                  </FormGroup>
                </GridItem>
              }
            </Grid>
          </FormGroup>
        </GridItem>
        <GridItem className={spacing.mtMd}>
          <FormGroup
            label="Run in"
            fieldId="run-in-group"
            className={styles.styledFormGroupTitle}
          >
            <Grid>
              <GridItem className={spacing.mtSm}>
                <Radio
                  isChecked={values.clusterType === 'source'}
                  name={clusterTypeKey}
                  onChange={formikHandleChange}
                  label="Source cluster"
                  id="source-cluster-radio"
                  value="source"
                />
              </GridItem>
              {values.clusterType === 'source' &&
                <React.Fragment>
                  <GridItem className={spacing.mtSm}>
                    <FormGroup
                      label="Service account name"
                      isRequired
                      fieldId={srcServiceAccountNameKey}
                      helperTextInvalid={touched.srcServiceAccountName && errors.srcServiceAccountName}
                      isValid={!(touched.srcServiceAccountName
                        && errors.srcServiceAccountName)}
                    >
                      <Tooltip
                        position={TooltipPosition.right}
                        content={<div>Service account name used to run the executable hook.</div>}
                      >
                        <span className={styles.tooltipStyles}>

                          <OutlinedQuestionCircleIcon />
                        </span>
                      </Tooltip>

                      {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
                      <TextInput
                        onChange={formikHandleChange}
                        onInput={formikSetFieldTouched(srcServiceAccountNameKey)}
                        onBlur={handleBlur}
                        value={values.srcServiceAccountName}
                        name={srcServiceAccountNameKey}
                        type="text"
                        id="src-service-account-name-input"
                        isValid={!(touched.srcServiceAccountName
                          && errors.srcServiceAccountName)}
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem className={spacing.mtSm}>
                    <FormGroup
                      label="Service account namespace"
                      isRequired
                      fieldId={srcServiceAccountNamespaceKey}
                      helperTextInvalid={touched.srcServiceAccountNamespace && errors.srcServiceAccountNamespace}
                      isValid={!(touched.srcServiceAccountNamespace && errors.srcServiceAccountNamespace)}
                    >
                      {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
                      <TextInput
                        onChange={formikHandleChange}
                        onInput={formikSetFieldTouched(srcServiceAccountNamespaceKey)}
                        onBlur={handleBlur}
                        value={values.srcServiceAccountNamespace}
                        name={srcServiceAccountNamespaceKey}
                        type="text"
                        id="src-service-account-namespace-input"
                        isValid={!(touched.srcServiceAccountNamespace && errors.srcServiceAccountNamespace)}
                      />

                    </FormGroup>
                  </GridItem>
                </React.Fragment>
              }
              <GridItem className={spacing.mtSm}>
                <Radio
                  isChecked={values.clusterType === 'destination'}
                  name={clusterTypeKey}
                  onChange={formikHandleChange}
                  label="Target cluster"
                  id="target-cluster-radio"
                  value="destination"
                />
              </GridItem>
              {values.clusterType === 'destination' &&
                <React.Fragment>
                  <GridItem className={spacing.mtSm}>
                    <FormGroup
                      label="Service account name"
                      isRequired
                      fieldId={destServiceAccountNameKey}
                      helperTextInvalid={touched.destServiceAccountName && errors.destServiceAccountName}
                      isValid={!(touched.destServiceAccountName && errors.destServiceAccountName)}
                    >
                      {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
                      <TextInput
                        onChange={formikHandleChange}
                        onInput={formikSetFieldTouched(destServiceAccountNameKey)}
                        onBlur={handleBlur}
                        value={values.destServiceAccountName}
                        name={destServiceAccountNameKey}
                        type="text"
                        id="dest-service-account-name-input"
                        isValid={!(touched.destServiceAccountName && errors.destServiceAccountName)}
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem className={spacing.mtSm}>
                    <FormGroup
                      label="Service account namespace"
                      isRequired
                      fieldId="destServiceAccountNamespace"
                      helperTextInvalid={touched.destServiceAccountNamespace && errors.destServiceAccountNamespace}
                      isValid={!(touched.destServiceAccountNamespace && errors.destServiceAccountNamespace)}
                    >
                      {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
                      <TextInput
                        onChange={formikHandleChange}
                        onInput={formikSetFieldTouched(destServiceAccountNamespaceKey)}
                        onBlur={handleBlur}
                        value={values.destServiceAccountNamespace}
                        name={destServiceAccountNamespaceKey}
                        type="text"
                        id="dest-service-account-namespace-input"
                        isValid={!(touched.destServiceAccountNamespace && errors.destServiceAccountNamespace)}
                      />
                    </FormGroup>
                  </GridItem>
                </React.Fragment>
              }
            </Grid>
          </FormGroup>
        </GridItem>
        <GridItem className={spacing.mtMd}>
          <FormGroup
            label="Migration step when the hook should be run "
            isRequired
            fieldId={migrationStepKey}
            className={styles.styledFormGroupTitle}
            helperTextInvalid={touched.migrationStep && errors.migrationStep}
            isValid={!(touched.migrationStep && errors.migrationStep)}
          >
            <SimpleSelect
              id="migrationStep"
              onChange={(value) => {
                setFieldValue('migrationStep', value);
                setFieldTouched('migrationStep');
              }}
              options={phaseOptions}
              value={values.migrationStep}
              placeholderText="Select phase..."
            />
          </FormGroup>
        </GridItem>
        <Grid span={6}>
          <GridItem className={spacing.mtLg} span={2}>
            <Button
              type="submit"
            >
              {addEditButtonTextFn(hookAddEditStatus)}
            </Button>
          </GridItem>
          <GridItem className={spacing.mtLg} span={2}>
            <Button
              key="cancel-add-hook"
              variant="secondary"
              onClick={() => {
                setIsAddHooksOpen(false);
                cancelAddEditWatch();
                resetAddEditState();
                setInitialHookValues({})
              }
              }
            >
              Close
            </Button>
          </GridItem>
        </Grid>
      </Grid>
    </Form>
  );
};
export default HooksFormComponent;
