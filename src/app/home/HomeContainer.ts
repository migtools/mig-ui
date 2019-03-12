import { connect } from "react-redux";
import HomeComponent from "./HomeComponent";
import { homeOperations } from "./duck";
import { authOperations } from "../auth/duck";

export default connect(
  state => ({
    loggingIn: state.auth.loggingIn,
    user: state.auth.user
  }),
  dispatch => ({
    onLogout: () => dispatch(authOperations.logoutRequest())
  })
)(HomeComponent);
