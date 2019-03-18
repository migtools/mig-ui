import { connect } from 'react-redux';
import DetailViewComponent from './DetailViewComponent';
// import { homeOperations } from './duck';
// import { authOperations } from '../auth/duck';

export default connect(
  state => ({
    loggingIn: state.auth.loggingIn,
    user: state.auth.user,
    migrationClusterList: state.home.migrationClusterList,
    migrationStorageList: state.home.migrationStorageList,
    migrationPlansList: state.home.migrationPlansList,
  }),
  dispatch => ({
    // onLogout: () => dispatch(authOperations.logoutRequest()),
    // fetchDataList: dataType => dispatch(homeOperations.fetchDataList(dataType))
  })
)(DetailViewComponent);
