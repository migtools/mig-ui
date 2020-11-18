import { IMigMetaVars } from './types';

export const APP_TITLE = 'Migration Toolkit for Containers';
export const MIG_META: IMigMetaVars = JSON.parse(atob(window['_mig_meta']));
