
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
}

export const createAddEditStatus = (
  state: AddEditState,
  mode: AddEditMode
): AddEditStatus => {
  return { state, mode };
}

export const defaultAddEditStatus = (): AddEditStatus => {
  return {
    state: AddEditState.Pending,
    mode: AddEditMode.Add,
  }
}
