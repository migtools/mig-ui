
## Becoming a Maintainer

The documentation for becoming a maintainer has been taken from [Foreman](https://theforeman.org/handbook.html#Becomingamaintainer) and adapted for the OpenShift application migration tool UI project.

As a maintainer, it is your responsibility to help manage and maintain the health of the Konveyor project.  A Konveyor maintainer has commit permissions to one or more of the repositories under the [Konveyor organization](https://github.com/konveyor). To see a list of maintainers to the Konveyor project, view the [Konveyor GitHub Teams](https://github.com/orgs/konveyor/teams) page.

Maintainers are members of the Konveyor community who exhibit most of the following behaviors:

- Review and merge code and documentation.
- Help triaging bugs and testing pull requests.
- Make well formed pull requests.
- Have a sense of duty about the project.
- Play well with others, are respectful, show gratitude.

If you want to become a maintainer, we expect you to:

- Review and test pull requests submitted by others.
- Encourage and ensure design remains an integral part of the review process and pull in Vince for UX review as needed.
- Support users and other developers on [PatternFly Slack](https://coreos.slack.com/) (there is a channel dedicated to mig-ui).


### Tech Stack

#### React
We are using React 16.x. Our project uses [functional components](https://reactjs.org/docs/components-and-props.html), [hooks](https://reactjs.org/docs/hooks-reference.html), and [ context](https://reactjs.org/docs/context.html). 

#### Redux

For state management within the app, we use [Redux](https://react-redux.js.org/)

To handle side-effects, we use [Redux Saga](https://redux-saga.js.org/). We leverage sagas to create a seperate thread in our app designed to handle data fetching, resource polling, and any other background tasks relevant to keeping the UI in sync with the underlying [controller API](https://docs.google.com/document/d/1BWlSlsrV_uzjLyFVkoYmjHaNHs-F__exMAh8yTVqAeg/edit?usp=sharing). 
https://github.com/eriknelson

#### Patternfly

To style the application, we are using [Patternfly](https://patternfly-react.surge.sh/)

#### Directory Structure 


### Quick tips for new maintainers

- If something you merged broke something, it’s your responsibility to resolve or coordinate how to resolve the issue.
- One or More 

 [1]: http://contributor-covenant.org/version/1/4/code_of_conduct.md