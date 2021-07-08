import * as React from 'react';
import { AxiosError } from 'axios';
import { History } from 'history';
import { LocalStorageKey, useLocalStorageContext } from './LocalStorageContext';

export interface INetworkContext {
  saveLoginToken: (user: string, history: History) => void;
  currentUser: string;
  checkExpiry: (error: Response | AxiosError<unknown>, history: History) => void;
}

const NetworkContext = React.createContext<INetworkContext>({
  saveLoginToken: () => {
    console.error('saveLoginToken was called without a NetworkContextProvider in the tree');
  },
  currentUser: '',
  checkExpiry: () => {
    console.error('checkExpiry was called without a NetworkContextProvider in the tree');
  },
});

interface INetworkContextProviderProps {
  children: React.ReactNode;
}

export const NetworkContextProvider: React.FunctionComponent<INetworkContextProviderProps> = ({
  children,
}: INetworkContextProviderProps) => {
  const [currentUser, setCurrentUser] = useLocalStorageContext(LocalStorageKey.currentUser);

  const saveLoginToken = (user: string | null, history: History) => {
    setCurrentUser(JSON.stringify(user));
    history.replace('/');
  };

  const checkExpiry = (error: Response | AxiosError<unknown>, history: History) => {
    const status = (error as Response).status || (error as AxiosError<unknown>).response?.status;
    if (status === 401) {
      setCurrentUser('');
      history.replace('/');
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        saveLoginToken,
        currentUser: currentUser || '',
        checkExpiry,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = (): INetworkContext => React.useContext(NetworkContext);
