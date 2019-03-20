import { connect } from 'react-redux';
import DetailViewComponent from './DetailViewComponent';

export default connect(
  state => ({
    loggingIn: state.auth.loggingIn,
    user: state.auth.user,
    migrationClusterList: state.home.migrationClusterList,
    migrationStorageList: state.home.migrationStorageList,
    migrationPlansList: state.home.migrationPlansList,
  }),
  dispatch => ({}),
)(DetailViewComponent);
