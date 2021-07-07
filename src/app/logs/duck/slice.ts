import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPlanReport } from '../../../client/resources/discovery';

export interface IClusterLogPodObject {
  src: any;
  dest: any;
  host?: any;
}
export interface ILogReducerState {
  isFetchingLogs: boolean;
  logErrorMsg: any;
  report: any;
  log: Array<any>;
  archive: any;
  logPodObject: any;
}

const initialState = {
  isFetchingLogs: true,
  logErrorMsg: null,
  report: {},
  log: [],
  archive: '',
  logPodObject: null,
} as ILogReducerState;

const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    reportFetchRequest(state, action: PayloadAction<string>) {
      state.isFetchingLogs = true;
      state.log = [];
      state.logErrorMsg = null;
      state.archive = '';
    },
    reportFetchSuccess(state, action: PayloadAction<IPlanReport>) {
      state.isFetchingLogs = false;
      state.report = action.payload;
    },
    reportFetchFailure(state, action: PayloadAction<string>) {
      state.isFetchingLogs = false;
      state.logErrorMsg = 'Failed to fetch log report.';
    },
    logsFetchRequest(state, action: PayloadAction<string>) {
      state.isFetchingLogs = true;
      state.archive = '';
    },
    logsFetchSuccess(state, action: PayloadAction<Array<any>>) {
      state.isFetchingLogs = false;
      state.log = action.payload;
    },
    logsFetchFailure(state, action: PayloadAction<string>) {
      state.isFetchingLogs = false;
      state.logErrorMsg = 'Failed to fetch log.';
    },
    createLogArchive(state, action: PayloadAction<string>) {
      state.archive = action.payload;
    },
    clusterPodFetchRequest(state, action: PayloadAction<string>) {
      state.isFetchingLogs = true;
      state.logPodObject = action.payload;
    },
    clusterPodFetchSuccess(state, action: PayloadAction<IClusterLogPodObject>) {
      state.isFetchingLogs = false;
      state.logPodObject = action.payload;
    },
    clusterPodFetchFailure(state, action: PayloadAction<string>) {
      state.isFetchingLogs = false;
      state.logErrorMsg = 'Failed to fetch log.';
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    requestDownloadLog(state, action: PayloadAction<string>) {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    requestDownloadAll(state, action: PayloadAction<string>) {},
  },
});

export const {
  reportFetchFailure,
  reportFetchRequest,
  reportFetchSuccess,
  requestDownloadAll,
  requestDownloadLog,
  logsFetchFailure,
  logsFetchRequest,
  logsFetchSuccess,
  clusterPodFetchFailure,
  clusterPodFetchRequest,
  clusterPodFetchSuccess,
  createLogArchive,
} = logSlice.actions;
export default logSlice.reducer;
