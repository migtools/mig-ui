import fetch from "cross-fetch";
import { Creators } from "./actions";
import { history } from "../../common/duck/utils";

const requestTokenAction = Creators.requestToken;
const receiveTokenAction = Creators.receiveToken;
const failedTokenRequest = Creators.failedToken;
// token cmd from terminal
//TOKEN=$(kubectl get secrets \
//  -o jsonpath='{.items[?(@.type=="kubernetes.io/service-account-token")].data.token}' \
//  | base64 --decode)
// APISERVER=$(kubectl config view -o \
//  jsonpath='{.clusters[*].cluster.server}')
const loginRequest = (username, password) => {
  return dispatch => {
    dispatch(requestTokenAction());
    //simulate token request

    const mockLoginSuccessful: TimerHandler = () => {
      const hardCodedToken = "";
      dispatch(receiveTokenAction(hardCodedToken, username));
      localStorage.setItem("currentUser", hardCodedToken);
      history.push("/");
    };
    setTimeout(mockLoginSuccessful(), 4300);

    //actual request
    //   return fetch("container1/version", {
    //     method: "GET",
    //     // body: JSON.stringify(data),
    //     headers: {
    //       Authorization: "Bearer " + hardCodedToken
    //     },
    //     mode: "cors"
    //   })
    //     .then(response => response.json())
    //     .then(token => {
    //       dispatch(receiveTokenAction(token));
    //     })
    //     .catch(error => {
    //       dispatch(failedTokenRequest(error));
    //     });
  };
};

export default {
  loginRequest
};
