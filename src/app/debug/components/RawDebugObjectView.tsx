import React, { useEffect} from 'react';
import ReactJson from 'react-json-view';
import { connect } from 'react-redux';
import { DebugActions } from '../duck/actions';
import { IDebugReducerState } from '../duck';
import { DEBUG_PATH_SEARCH_KEY } from '../duck/types';

interface IRawDebugObjectViewProps {
  debug: IDebugReducerState;
  fetchRawDebugObject: (string) => void;
}

const RawDebugObjectView: React.FunctionComponent<IRawDebugObjectViewProps> = ({
  debug,
  fetchRawDebugObject,
}: IRawDebugObjectViewProps) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    fetchRawDebugObject(decodeURI(params.get(DEBUG_PATH_SEARCH_KEY)));
    // Value in the array really should be the path that's getting submitted
    // via a query param. Better way to do this via prop?
  }, []);

  return (
    <div>{debug.isLoading ?
      "Loading..." :
      <ReactJson src={debug.objJson} enableClipboard={true} />}
    </div>
  );
};

export default connect(
  (state) => ({
    debug: state.debug,
  }),
  (dispatch) => ({
  fetchRawDebugObject: (path) => dispatch(DebugActions.debugObjectFetchRequest(path)),
}))(RawDebugObjectView);
