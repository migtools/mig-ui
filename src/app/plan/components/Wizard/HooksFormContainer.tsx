import { withFormik, FormikProps } from 'formik';
import utils from '../../../common/duck/utils';
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
}
interface IHooksFormContainerOtherProps {
  initialHookValues?: any;
  defaultHookRunnerImage: string;
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

  validate: (values) => {
    const errors: any = {};

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
        errors.destServiceAccountNamespace = utils.DNS1123Error(values.destServiceAccountNamespace);
      }
    }

    if (!values.migrationStep) {
      errors.migrationStep = 'Required';
    }

    if (values.hookImageType === HooksImageType.Ansible && values.ansibleFile === '') {
      errors.ansibleFile = 'Ansible file upload required';
    }

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditHookSubmit(values);
  },
})(HooksFormComponent);

export default AddEditHooksFormContainer;
