import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '../reducers';

function render(
  component,
  { initialState = {}, store = createStore(rootReducer, initialState), ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(component, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { render };
