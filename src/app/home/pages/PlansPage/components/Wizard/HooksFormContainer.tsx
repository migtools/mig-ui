import { withFormik, FormikProps } from 'formik';
import { IHook } from '../../../../../../client/resources/conversions';
import utils from '../../../../../common/duck/utils';
import { IMigHook } from '../../../HooksPage/types';
import HooksFormComponent, { HooksImageType } from './HooksFormComponent';
interface IHooksFormContainerValues {
  hookName: string;
  hookImageType: string;
  ansibleFile: string;
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
interface IHooksFormContainerOtherProps {
  initialHookValues?: any;
  defaultHookRunnerImage: string;
  onAddEditHookSubmit: any;
  setInitialHookValues: any;
  setIsAddHooksOpen: (isOpen: boolean) => void;
  hookAddEditStatus: any;
  cancelAddEditWatch?: () => void;
  resetAddEditState?: () => void;
  currentPlan: any;
  allHooks: IMigHook[];
}

const AddEditHooksFormContainer = withFormik<
  IHooksFormContainerOtherProps,
  IHooksFormContainerValues
>({
  mapPropsToValues: ({ initialHookValues, defaultHookRunnerImage }) => {
    const values: IHooksFormContainerValues = {
      hookName: '',
      hookImageType: 'ansible',
      customContainerImage: defaultHookRunnerImage,
      ansibleRuntimeImage: defaultHookRunnerImage,
      clusterType: 'source',
      srcServiceAccountName: '',
      destServiceAccountName: '',
      srcServiceAccountNamespace: '',
      destServiceAccountNamespace: '',
      migrationStep: '',
      ansibleFile: '',
      isCreateHookSelected: false,
      selectedExistingHook: null,
    };

    if (initialHookValues) {
      values.hookName = initialHookValues.hookName || '';
      values.hookImageType = initialHookValues.hookImageType || 'ansible';
      values.customContainerImage =
        initialHookValues.customContainerImage || defaultHookRunnerImage;
      values.ansibleRuntimeImage = initialHookValues.ansibleRuntimeImage || defaultHookRunnerImage;
      values.ansibleFile = initialHookValues.ansibleFile || '';
      values.clusterType = initialHookValues.clusterType || 'source';
      values.srcServiceAccountName = initialHookValues.srcServiceAccountName || '';
      values.destServiceAccountName = initialHookValues.destServiceAccountName || '';
      values.srcServiceAccountNamespace = initialHookValues.srcServiceAccountNamespace || '';
      values.destServiceAccountNamespace = initialHookValues.destServiceAccountNamespace || '';
      values.migrationStep = initialHookValues.phase || '';
    }

    return values;
  },

  validate: (values, props) => {
    const errors: any = {};
    const { currentPlan } = props;
    if (!values.hookName) {
      errors.hookName = 'Required';
    } else if (!utils.testDNS1123(values.hookName)) {
      errors.hookName = utils.DNS1123Error(values.hookName);
    }

    if (!values.customContainerImage) {
      errors.customContainerImage = 'Required';
    }

    if (!values.ansibleRuntimeImage) {
      errors.ansibleRuntimeImage = 'Required';
    }
    if (values.hookImageType === HooksImageType.Ansible && values.ansibleFile === '') {
      errors.ansibleFile = 'Ansible file upload required';
    }
    // only validate these fields if within the plan edit/add form
    if (currentPlan) {
      if (!values.migrationStep) {
        errors.migrationStep = 'Required';
      }

      if (values.clusterType === 'source') {
        if (!values.srcServiceAccountName) {
          errors.srcServiceAccountName = 'Required';
        } else if (!utils.testDNS1123(values.srcServiceAccountName)) {
          errors.srcServiceAccountName = utils.DNS1123Error(values.srcServiceAccountName);
        }

        if (!values.srcServiceAccountNamespace) {
          errors.srcServiceAccountNamespace = 'Required';
        } else if (!utils.testDNS1123(values.srcServiceAccountNamespace)) {
          errors.srcServiceAccountNamespace = utils.DNS1123Error(values.srcServiceAccountNamespace);
        }
      }

      if (values.clusterType === 'destination') {
        if (!values.destServiceAccountName) {
          errors.destServiceAccountName = 'Required';
        } else if (!utils.testDNS1123(values.destServiceAccountName)) {
          errors.destServiceAccountName = utils.DNS1123Error(values.destServiceAccountName);
        }

        if (!values.destServiceAccountNamespace) {
          errors.destServiceAccountNamespace = 'Required';
        } else if (!utils.testDNS1123(values.destServiceAccountNamespace)) {
          errors.destServiceAccountNamespace = utils.DNS1123Error(
            values.destServiceAccountNamespace
          );
        }
      }
    }

    return errors;
  },

  handleSubmit: (values, { setSubmitting, props }) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    console.log('submit what handler', values, props);
    setSubmitting(false);
    props.onAddEditHookSubmit(values);
  },
  enableReinitialize: true,
})(HooksFormComponent);

export default AddEditHooksFormContainer;
