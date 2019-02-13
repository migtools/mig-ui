import * as React from 'react';
import "patternfly/dist/img/logo-alt.svg"
import "patternfly/dist/img/brand-alt.svg"

export const App = () => {
  return (
    <div id="wrapper" className="layout-pf layout-pf-fixed">
      <div className="navbar-header">
        <nav className="navbar navbar-pf-vertical">
          <button type="button" className="navbar-toggle">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a href="/" className="navbar-brand">
            <img className="navbar-brand-icon" src="/img/logo-alt.svg" alt="" /><img className="navbar-brand-name" src="/img/brand-alt.svg" alt="PatternFly Enterprise Application" />
          </a>
        </nav>
      </div>
    </div>
  )
};
