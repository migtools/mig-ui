import * as React from 'react';
import { AxiosError } from 'axios';
import { History } from 'history';
import { useState } from 'react';
import { IAddPlanDisabledObjModel } from '../types';

export interface IPlansContext {
  setAddPlanDisabledObj: (obj: IAddPlanDisabledObjModel) => void;
  addPlanDisabledObj: IAddPlanDisabledObjModel;
}

const PlansContext = React.createContext<IPlansContext>({
  setAddPlanDisabledObj: () => {
    console.error('setAddPlanDisabledObj was called without a PlanContextProvider in the tree');
  },
  addPlanDisabledObj: {
    isAddPlanDisabled: true,
    disabledText: '',
  },
});

interface IPlansContextProviderProps {
  children: React.ReactNode;
}

export const PlansContextProvider: React.FunctionComponent<IPlansContextProviderProps> = ({
  children,
}: IPlansContextProviderProps) => {
  const [addPlanDisabledObj, setAddPlanDisabledObj] = useState<IAddPlanDisabledObjModel>({
    isAddPlanDisabled: true,
    disabledText: '',
  });

  return (
    <PlansContext.Provider
      value={{
        addPlanDisabledObj,
        setAddPlanDisabledObj,
      }}
    >
      {children}
    </PlansContext.Provider>
  );
};

export const usePlansContext = (): IPlansContext => React.useContext(PlansContext);
