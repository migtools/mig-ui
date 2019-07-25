
export enum AddEditState {
  Pending = 'pending',
  Watching = 'watching',
  Critical = 'critical',
  Ready = 'ready',
  TimedOut = 'timedout',
}

export enum AddEditMode {
  Add = 'add',
  Edit = 'edit',
}

export interface AddEditStatus {
  mode: AddEditMode;
  state: AddEditState;
  message?: string;
  reason?: string;
}

export const createAddEditStatus = (
  state: AddEditState,
  mode: AddEditMode
): AddEditStatus => {
  return { state, mode };
}

export const createAddEditStatusWithMeta = (
  state: AddEditState,
  mode: AddEditMode,
  message: string,
  reason: string,
): AddEditStatus => {
  return { state, mode, message, reason };
}

export const defaultAddEditStatus = (): AddEditStatus => {
  return {
    state: AddEditState.Pending,
    mode: AddEditMode.Add,
  }
}

export interface AddEditCondition {
  state: AddEditState;
  message: string;
  reason?: string;
}


const addEditTimeoutSeconds = 20;
export const AddEditTimeout = addEditTimeoutSeconds * 1000;

const addEditPollIntervalSeconds = 4;
export const AddEditTimeoutPollInterval = addEditPollIntervalSeconds * 1000;