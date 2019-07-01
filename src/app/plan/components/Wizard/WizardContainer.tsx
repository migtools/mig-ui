import { withFormik } from 'formik';
import WizardComponent from './WizardComponent';
import planOperations from '../../duck/operations';
import { connect } from 'react-redux';

const WizardContainer: any = withFormik({
  mapPropsToValues: () => ({
    connectionStatus: '',
    planName: '',
    sourceCluster: null,
    targetCluster: null,
    selectedNamespaces: [],
    selectedStorage: '',
    persistentVolumes: [],
  }),

  validate: values => {
    const errors: any = {};

    if (!values.planName) {
      errors.planName = 'Required';
    }
    if (!values.sourceCluster) {
      errors.sourceCluster = 'Required';
    }
    if (!values.selectedNamespaces) {
      errors.selectedNamespaces = 'Required';
    }
    if (!values.targetCluster) {
      errors.targetCluster = 'Required';
    }
    if (!values.selectedStorage) {
      errors.selectedStorage = 'Required';
    }
    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    formikBag.setSubmitting(false);
    formikBag.props.onPlanSubmit(values);
  },
  validateOnBlur: false,
})(WizardComponent);

const mapStateToProps = state => {
  return {
    connectionStatus: '',
    planName: '',
    sourceCluster: null,
    targetCluster: null,
    selectedNamespaces: [],
    selectedStorage: '',
    persistentVolumes: [],
    isFetchingPVList: state.plan.isFetchingPVList,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    addPlan: plan => dispatch(planOperations.addPlan(plan)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WizardContainer);
