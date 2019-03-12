import { connect } from "react-redux";
import HomeComponent from "./HomeComponent";

// This will make sense to you once we discuss the Redux code,
// but for now, just know that 'homeOperations' will let you trigger
// Redux actions.
import { homeOperations } from "./duck";

const mapStateToProps = state => {
  // const { data, showSpinner } = state.home;
  return {};
};

const mapDispatchToProps = dispatch => {
  // 'fetchData()' will trigger fetching of JSON data from
  // the API and pushes the relevant data into the Redux store.
  const fetchData = info => {
    // dispatch(homeOperations.fetchData(info));
  };

  return { fetchData };
};

const HomeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeComponent);

export default HomeContainer;
