import { LOCATION_CHANGE } from 'connected-react-router';
import { alertConstants } from '../constants';

export function alert(state = {}, action) {
  switch (action.type) {
    case alertConstants.SUCCESS:
      return {
        type: 'alert-success',
        message: action.message
      };
    case alertConstants.ERROR:
      return {
        type: 'alert-danger',
        message: action.message
      };
    case LOCATION_CHANGE:
    case alertConstants.CLEAR:
      return {};
    default:
      return state
  }
}
