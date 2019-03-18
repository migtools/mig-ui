import fetch from "cross-fetch";
import { Creators } from "./actions";
import { JWT_API_URL, SOCKET_API_URL, JSON_SERVER_URL } from "../../../config";
import { push } from "connected-react-router";
const migrationClusterFetchSuccess = Creators.migrationClusterFetchSuccess;
// const fetchDataListSuccess = Creators.fetchDataListSuccess;

// const fetchDataListSuccess = (type, list)=>{

// }
const fetchDataList = dataType => {
  return dispatch => {
    // dispatch(login(username, password));
    return fetch(JSON_SERVER_URL + dataType, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("currentUser"),
      },
    })
      .then(handleResponse)
      .then(res => {
        console.log("res", res[0].items);
        switch (dataType) {
          case "migrationClusterList":
            return dispatch(migrationClusterFetchSuccess(res[0].items));
        }
        // dispatch(fetchDataListSuccess(dataType, res[0].items));
        // localStorage.setItem("currentUser", JSON.stringify(res.access_token));
        // dispatch(loginSuccess(username));
        // dispatch(push("/"));
      })
      .catch(error => {
        // dispatch(loginFailure(error));
      });
  };
};

function handleResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        // auto logout if 401 response returned from api
        // logoutRequest();
        location.reload(true);
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}

export default {
  fetchDataList,
};
