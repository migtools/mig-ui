import React, { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import planUtils from './../../../../../plan/duck/utils';
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
  Form,
  Select,
  SelectOptionObject,
  SelectOption,
  SelectGroup,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { AddEditMode, addEditButtonText } from '../../../../../common/add_edit_state';
import QuestionCircleIcon from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import { validatedState } from '../../../../../common/helpers';
import { IHook } from '../../../../../../client/resources/conversions';
import { IMigHook } from '../../../HooksPage/types';
const classNames = require('classnames');

const componentTypeStr = 'hook';
const addEditButtonTextFn = addEditButtonText(componentTypeStr);

interface IHooksFormValues {
  hookName: string;
  hookImageType: string;
  ansibleFile: string;
  ansibleFilename?: string;
  ansibleRuntimeImage: string;
  customContainerImage: string;
  srcServiceAccountName: string;
  srcServiceAccountNamespace: string;
  destServiceAccountName: string;
  destServiceAccountNamespace: string;
  clusterType: string;
  migrationStep: string;
  isCreateHookSelected?: boolean;
  selectedExistingHook?: IMigHook | null;
}
interface IHooksFormOtherProps {
  setInitialHookValues: any;
  setIsAddHooksOpen: (isOpen: boolean) => void;
  hookAddEditStatus: any;
  cancelAddEditWatch?: () => void;
  resetAddEditState?: () => void;
  currentPlan: any;
  defaultHookRunnerImage: string;
  allHooks: IMigHook[];
  currentPlanHooks?: IHook[];
  selectedExistingHook?: any;
  setSelectedExistingHook?: (val) => void;
  isCreateHookSelected?: boolean;
  setIsCreateHookSelected?: (isCreate: boolean) => void;
}
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
const migrationStepKey = 'migrationStep';

export const HooksClusterType = {
  Destination: 'destination',
  Source: 'source',
};

export const HooksImageType = {
  Ansible: 'ansible',
  Custom: 'custom',
};

const HooksFormComponent: React.FunctionComponent<
  IHooksFormOtherProps & FormikProps<IHooksFormValues>
> = ({
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
  currentPlan,
  allHooks,
  currentPlanHooks,
  selectedExistingHook,
  setSelectedExistingHook,
  isCreateHookSelected,
  setIsCreateHookSelected,
}: IHooksFormOtherProps & FormikProps<IHooksFormValues>) => {
  const formikHandleChange = (_val, e) => handleChange(e);
  const formikSetFieldTouched = (key) => () => setFieldTouched(key, true, true);

  let initialPhaseOptions = ['PreBackup', 'PostBackup', 'PreRestore', 'PostRestore'];

  if (currentPlan?.spec?.hooks) {
    const existingPhases = currentPlan.spec.hooks.map((hook) => hook.phase);
    const filteredPhases = initialPhaseOptions.filter((phase) => !existingPhases.includes(phase));
    initialPhaseOptions = filteredPhases;
  }

  const [phaseOptions, setPhaseOptions] = useState(initialPhaseOptions);
  const [isHookSelectOpen, setIsHookSelectOpen] = useState(false);

  const handleFileChange = (value, filename, event) => {
    setFieldValue('ansibleFile', value);
    setFieldValue('ansibleFilename', filename);
  };

  const hookImageStyles = classNames(spacing.mtSm, spacing.mlLg);
  const newHookOption = {
    toString: () => `Create a new hook`,
    value: 'new',
  };

  const hookOptions = allHooks
    .filter((hook) => {
      const existsOnPlan = currentPlanHooks?.some(
        (existingHook) => existingHook?.hookName === hook?.metadata.name
      );
      if (!existsOnPlan) {
        return hook;
      }
    })
    .map((hook) => ({
      toString: () => hook.metadata.name,
      value: hook,
    })) as OptionWithValue<IMigHook>[];
  console.log('errors', errors, 'touched', touched, 'values', values);
  return (
    <Form
      onSubmit={(e) => {
        handleSubmit(e);
        e.preventDefault();
      }}
    >
      <Grid span={8}>
        {hookAddEditStatus.mode === AddEditMode.Add && currentPlan && (
          <GridItem>
            <FormGroup
              isRequired
              fieldId="mappingSelect"
              label="Add an existing hook or create a new one"
            >
              <Select
                id="existingHookSelect"
                aria-label="Select an existing hook or create a new one"
                placeholderText={`Select...`}
                isGrouped
                isOpen={isHookSelectOpen}
                onToggle={setIsHookSelectOpen}
                selections={
                  isCreateHookSelected
                    ? [newHookOption.toString()]
                    : selectedExistingHook?.metadata.name
                    ? [
                        hookOptions.find(
                          (option) =>
                            option?.value?.metadata?.name === selectedExistingHook?.metadata.name
                        )?.value?.metadata?.name,
                      ]
                    : []
                }
                onSelect={(_event, selection: SelectOptionObject) => {
                  const sel = selection as OptionWithValue<IHook | 'new'>;
                  if (sel.value === 'new') {
                    setIsCreateHookSelected(true);
                    setSelectedExistingHook(null);
                    setInitialHookValues({});
                  } else {
                    sel.value;
                    const currentPlanHookRef = null;
                    const hookRef = sel.value;
                    const uiHookObject = planUtils.convertMigHookToUIObject(
                      currentPlanHookRef,
                      hookRef
                    );

                    setInitialHookValues(uiHookObject);
                    setIsCreateHookSelected(false);
                    setSelectedExistingHook(sel.value);
                  }

                  setIsHookSelectOpen(false);
                }}
              >
                <SelectOption key={newHookOption.toString()} value={newHookOption} />
                <SelectGroup
                  label={hookOptions.length > 0 ? 'Existing hooks' : 'No existing hooks'}
                >
                  {hookOptions.map((option) => (
                    <SelectOption key={option.toString()} value={option} />
                  ))}
                </SelectGroup>
              </Select>
            </FormGroup>
          </GridItem>
        )}
        <GridItem className={spacing.mtMd}>
          <FormGroup
            label="Hook name"
            isRequired
            fieldId={hookNameKey}
            helperTextInvalid={touched.hookName && errors.hookName}
            validated={validatedState(touched.hookName, errors.hookName)}
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
              isDisabled={hookAddEditStatus.mode === AddEditMode.Edit || selectedExistingHook}
              validated={validatedState(touched.hookName, errors.hookName)}
            />
          </FormGroup>
        </GridItem>
        <GridItem className={spacing.mtMd}>
          <FormGroup label="Hook definition" fieldId="definition-group">
            <Tooltip
              position={TooltipPosition.right}
              content={
                <div>
                  There are two options for adding a hook definition: 1) Add an ansible playbook
                  file to be run. A default hook runner image is provided, or you may choose your
                  own. 2) Specify only a custom image which will run your defined entrypoint when
                  loaded.{' '}
                </div>
              }
            >
              <span className={spacing.mlSm}>
                <QuestionCircleIcon />
              </span>
            </Tooltip>
            <Grid>
              <GridItem className={spacing.mtSm}>
                <Radio
                  isChecked={values.hookImageType === HooksImageType.Ansible}
                  name={hookImageTypeKey}
                  onChange={formikHandleChange}
                  label="Ansible playbook"
                  id="ansible-playbook-radio"
                  value={HooksImageType.Ansible}
                  isDisabled={selectedExistingHook}
                />
              </GridItem>
              {values.hookImageType === HooksImageType.Ansible && (
                <React.Fragment>
                  <GridItem className={hookImageStyles}>
                    <FormGroup
                      label="Upload your Ansible playbook file or paste its contents below."
                      isRequired
                      fieldId={ansibleUploadKey}
                      helperTextInvalid={touched.ansibleFile && errors.ansibleFile}
                      validated={validatedState(touched.ansibleFile, errors.ansibleFile)}
                    >
                      <FileUpload
                        value={values.ansibleFile}
                        filename={values.ansibleFilename}
                        onChange={handleFileChange}
                        id="ansible-file"
                        type="text"
                        isDisabled={
                          selectedExistingHook ||
                          (hookAddEditStatus.mode === AddEditMode.Edit && currentPlan)
                        }
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem className={hookImageStyles}>
                    <FormGroup
                      label="Ansible runtime image"
                      isRequired
                      fieldId={ansibleRuntimeImageKey}
                      validated={validatedState(
                        touched.ansibleRuntimeImage,
                        errors.ansibleRuntimeImage
                      )}
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
                        validated={validatedState(
                          touched.ansibleRuntimeImage,
                          errors.ansibleRuntimeImage
                        )}
                        isDisabled={
                          selectedExistingHook ||
                          (hookAddEditStatus.mode === AddEditMode.Edit && currentPlan)
                        }
                      />
                      <TextContent>
                        <Text component={TextVariants.p}>
                          This is the default Ansible runtime image. You can change it to a custom
                          image with your own modules.
                        </Text>
                      </TextContent>
                    </FormGroup>
                  </GridItem>
                </React.Fragment>
              )}
              <GridItem className={spacing.mtSm}>
                <Radio
                  isChecked={values.hookImageType === HooksImageType.Custom}
                  name={hookImageTypeKey}
                  onChange={formikHandleChange}
                  label="Custom container image"
                  id="custom-image-radio"
                  value={HooksImageType.Custom}
                  isDisabled={
                    selectedExistingHook ||
                    (hookAddEditStatus.mode === AddEditMode.Edit && currentPlan)
                  }
                />
              </GridItem>
              {values.hookImageType === HooksImageType.Custom && (
                <GridItem className={hookImageStyles}>
                  <FormGroup
                    isRequired
                    fieldId={customImageKey}
                    validated={validatedState(
                      touched.customContainerImage,
                      errors.customContainerImage
                    )}
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
                      validated={validatedState(
                        touched.customContainerImage,
                        errors.customContainerImage
                      )}
                      isDisabled={
                        selectedExistingHook ||
                        (hookAddEditStatus.mode === AddEditMode.Edit && currentPlan)
                      }
                    />
                  </FormGroup>
                </GridItem>
              )}
            </Grid>
          </FormGroup>
        </GridItem>
        {currentPlan && (
          <>
            <GridItem className={spacing.mtMd}>
              <FormGroup label="Run in" fieldId="run-in-group">
                <Grid>
                  <GridItem className={spacing.mtSm}>
                    <Radio
                      isChecked={values.clusterType === HooksClusterType.Source}
                      name={clusterTypeKey}
                      onChange={formikHandleChange}
                      label="Source cluster"
                      id="source-cluster-radio"
                      value={HooksClusterType.Source}
                    />
                  </GridItem>
                  {values.clusterType === HooksClusterType.Source && (
                    <React.Fragment>
                      <GridItem className={spacing.mtSm}>
                        <FormGroup
                          label="Service account name"
                          isRequired
                          fieldId={srcServiceAccountNameKey}
                          helperTextInvalid={
                            touched.srcServiceAccountName && errors.srcServiceAccountName
                          }
                          validated={validatedState(
                            touched.srcServiceAccountName,
                            errors.srcServiceAccountName
                          )}
                        >
                          <Tooltip
                            position={TooltipPosition.right}
                            content={
                              <div>Service account name used to run the executable hook.</div>
                            }
                          >
                            <span className={spacing.mlSm}>
                              <QuestionCircleIcon />
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
                            validated={validatedState(
                              touched.srcServiceAccountName,
                              errors.srcServiceAccountName
                            )}
                          />
                        </FormGroup>
                      </GridItem>
                      <GridItem className={spacing.mtSm}>
                        <FormGroup
                          label="Service account namespace"
                          isRequired
                          fieldId={srcServiceAccountNamespaceKey}
                          helperTextInvalid={
                            touched.srcServiceAccountNamespace && errors.srcServiceAccountNamespace
                          }
                          validated={validatedState(
                            touched.srcServiceAccountNamespace,
                            errors.srcServiceAccountNamespace
                          )}
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
                            validated={validatedState(
                              touched.srcServiceAccountNamespace,
                              errors.srcServiceAccountNamespace
                            )}
                          />
                        </FormGroup>
                      </GridItem>
                    </React.Fragment>
                  )}
                  <GridItem className={spacing.mtSm}>
                    <Radio
                      isChecked={values.clusterType === HooksClusterType.Destination}
                      name={clusterTypeKey}
                      onChange={formikHandleChange}
                      label="Target cluster"
                      id="target-cluster-radio"
                      value={HooksClusterType.Destination}
                    />
                  </GridItem>
                  {values.clusterType === HooksClusterType.Destination && (
                    <React.Fragment>
                      <GridItem className={spacing.mtSm}>
                        <FormGroup
                          label="Service account name"
                          isRequired
                          fieldId={destServiceAccountNameKey}
                          helperTextInvalid={
                            touched.destServiceAccountName && errors.destServiceAccountName
                          }
                          validated={validatedState(
                            touched.destServiceAccountName,
                            errors.destServiceAccountName
                          )}
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
                            validated={validatedState(
                              touched.destServiceAccountName,
                              errors.destServiceAccountName
                            )}
                          />
                        </FormGroup>
                      </GridItem>
                      <GridItem className={spacing.mtSm}>
                        <FormGroup
                          label="Service account namespace"
                          isRequired
                          fieldId="destServiceAccountNamespace"
                          helperTextInvalid={
                            touched.destServiceAccountNamespace &&
                            errors.destServiceAccountNamespace
                          }
                          validated={validatedState(
                            touched.destServiceAccountNamespace,
                            errors.destServiceAccountNamespace
                          )}
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
                            validated={validatedState(
                              touched.destServiceAccountNamespace,
                              errors.destServiceAccountNamespace
                            )}
                          />
                        </FormGroup>
                      </GridItem>
                    </React.Fragment>
                  )}
                </Grid>
              </FormGroup>
            </GridItem>
            )
            <GridItem className={spacing.mtMd}>
              <FormGroup
                label="Migration step when the hook should be run"
                isRequired
                fieldId={migrationStepKey}
                helperTextInvalid={touched.migrationStep && errors.migrationStep}
                validated={validatedState(touched.migrationStep, errors.migrationStep)}
              >
                <SimpleSelect
                  id="migrationStep"
                  onChange={(value) => {
                    setTimeout(() => {
                      setFieldValue('migrationStep', value);
                      setFieldTouched('migrationStep');
                    });
                  }}
                  options={phaseOptions}
                  value={values.migrationStep}
                  placeholderText="Select phase..."
                />
              </FormGroup>
            </GridItem>
          </>
        )}
        <Grid span={6}>
          <GridItem className={spacing.mtLg} span={2}>
            <Button type="submit">{addEditButtonTextFn(hookAddEditStatus)}</Button>
          </GridItem>
          <GridItem span={1} />
          <GridItem className={spacing.mtLg} span={2}>
            <Button
              key="cancel-add-hook"
              variant="secondary"
              onClick={() => {
                setIsAddHooksOpen(false);
                cancelAddEditWatch();
                resetAddEditState();
                setInitialHookValues({});
                setSelectedExistingHook(null);
                setIsCreateHookSelected(false);
              }}
            >
              Cancel
            </Button>
          </GridItem>
        </Grid>
      </Grid>
    </Form>
  );
};
export default HooksFormComponent;
