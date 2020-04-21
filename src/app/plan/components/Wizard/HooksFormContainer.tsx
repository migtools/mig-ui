import { withFormik, FormikProps } from 'formik';
import utils from '../../../common/duck/utils';
import HooksFormComponent from './HooksFormComponent';
interface IHooksFormContainerValues {
}
interface IHooksFormContainerOtherProps {
  initialHookValues?: any;
}

const AddEditHooksFormContainer = withFormik<IHooksFormContainerOtherProps, IHooksFormContainerValues>({
  mapPropsToValues: ({ initialHookValues }) => {
    const values = {
      hookName: '',
      hookImageType: 'ansible',
      customContainerImage: 'quay.io/konveyor/hook-runner:latest',
      ansibleRuntimeImage: 'quay.io/konveyor/hook-runner:latest',
      clusterType: 'source',
      srcServiceAccountName: '',
      destServiceAccountName: '',
      srcServiceAccountNamespace: '',
      destServiceAccountNamespace: '',
      migrationStep: '',
      ansibleFile: ''
    };
    if (initialHookValues) {
      values.hookName = initialHookValues.hookName || '';
      values.hookImageType = initialHookValues.hookImageType || 'ansible';
      values.customContainerImage = initialHookValues.customContainerImage || 'quay.io/konveyor/hook-runner:latest';
      values.ansibleRuntimeImage = initialHookValues.ansibleRuntimeImage || 'quay.io/konveyor/hook-runner:latest';
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

  validate: (values: any) => {
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
      }

      if (!values.srcServiceAccountNamespace) {
        errors.srcServiceAccountNamespace = 'Required';
      }
    }

    if (values.clusterType === 'destination') {
      if (!values.destServiceAccountName) {
        errors.destServiceAccountName = 'Required';
      }

      if (!values.destServiceAccountNamespace) {
        errors.destServiceAccountNamespace = 'Required';
      }

    }

    if (!values.migrationStep) {
      errors.migrationStep = 'Required';
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
