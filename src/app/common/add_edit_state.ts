export enum AddEditState {
  Pending = 'pending',
  Fetching = 'fetching',
  Watching = 'watching',
  Critical = 'critical',
  Ready = 'ready',
  TimedOut = 'timedout',
}

export enum AddEditMode {
  Add = 'add',
  Edit = 'edit',
}

export interface IAddEditStatus {
  mode: AddEditMode;
  state: AddEditState;
  message?: string;
  reason?: string;
}

export const createAddEditStatus = (state: AddEditState, mode: AddEditMode): IAddEditStatus => {
  return { state, mode };
};

export const createAddEditStatusWithMeta = (
  state: AddEditState,
  mode: AddEditMode,
  message: string,
  reason: string
): IAddEditStatus => {
  return { state, mode, message, reason };
};

export const defaultAddEditStatus = (): IAddEditStatus => {
  return {
    state: AddEditState.Pending,
    mode: AddEditMode.Add,
  };
};

export const fetchingAddEditStatus = (): IAddEditStatus => {
  return {
    state: AddEditState.Fetching,
    mode: AddEditMode.Add,
  };
};

export const AddEditConditionCritical = 'Critical';
export const AddEditConditionReady = 'Ready';

const addEditTimeoutSeconds = 30;
export const AddEditWatchTimeout = addEditTimeoutSeconds * 1000;

const addEditPollIntervalSeconds = 6;
export const AddEditWatchTimeoutPollInterval = addEditPollIntervalSeconds * 1000;

const addEditDebounceWaitSeconds = 6;

export const AddEditDebounceWait = addEditDebounceWaitSeconds * 1000;

export const addEditStatusText = (componentType: string) => (status: IAddEditStatus) => {
  switch (status.state) {
  case AddEditState.Pending: {
    return ``;
  }
  case AddEditState.Fetching: {
    return `Validating connection...`;
  }
  case AddEditState.Critical: {
    return `Connection failed. Message: "${status.message}", Reason: "${status.reason}"`;
  }
  case AddEditState.Ready: {
    return `Connection successful`;
  }
  case AddEditState.Watching: {
    return `Validating connection...`;
  }
  case AddEditState.TimedOut: {
    return 'Validation timed out. Ensure your cluster details are correct, \
        or continue to check the existing connection.';
  }
  default: {
    return `AddEditStatus fell into an unknown state`;
  }
  }
};

export const addEditButtonText = (componentType: string) => (status: IAddEditStatus) => {
  switch (status.mode) {
  case AddEditMode.Add: {
    return `Add ${componentType}`;
  }
  default: {
    return `Update ${componentType}`;
  }
  }
};

export const isCheckConnectionButtonDisabled = (
  currentStatus: IAddEditStatus,
  valuesUpdatedObject: boolean,
) => {
  const objectHasPendingUpdate =
    currentStatus.mode === AddEditMode.Edit && valuesUpdatedObject;

  const isDisabled =
    currentStatus.mode === AddEditMode.Add ||
    currentStatus.state === AddEditState.Fetching ||
    currentStatus.state === AddEditState.Watching ||
    objectHasPendingUpdate;

  return isDisabled;
};

export const isAddEditButtonDisabled = (
  status: IAddEditStatus,
  errors: object,
  touched: object,
  valuesUpdatedObject: boolean,
) => {
  const hasNotBeenTouched = Object.keys(touched).length === 0;
  const hasValidationErrors = Object.keys(errors).length > 0;
  const valuesAreNotReady = hasNotBeenTouched || hasValidationErrors;
  const isDisabled =
    !valuesUpdatedObject ||
    valuesAreNotReady ||
    status.state === AddEditState.Watching ||
    status.state === AddEditState.Fetching;
  return isDisabled;
};
