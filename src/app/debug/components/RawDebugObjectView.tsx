import React, { useEffect } from 'react';
import ReactJson from 'react-json-view';
import { useDispatch, useSelector } from 'react-redux';
import { debugObjectFetchRequest } from '../duck/slice';
import { DEBUG_PATH_SEARCH_KEY } from '../duck/types';

const RawDebugObjectView: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const debug = useSelector((state) => state.debug);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const decodedURI = decodeURI(params.get(DEBUG_PATH_SEARCH_KEY));
    dispatch(debugObjectFetchRequest(decodedURI));
    // Value in the array really should be the path that's getting submitted
    // via a query param. Better way to do this via prop?
  }, []);

  return (
    <div>
      {debug.isLoading ? 'Loading...' : <ReactJson src={debug.objJson} enableClipboard={true} />}
    </div>
  );
};
export default RawDebugObjectView;
