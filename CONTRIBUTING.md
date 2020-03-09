
## Becoming a Maintainer

The documentation for becoming a maintainer has been taken from [Foreman](https://theforeman.org/handbook.html#Becomingamaintainer) and adapted for the OpenShift Application Migration UI project.

As a maintainer, it is your responsibility to help manage and maintain the health of the Konveyor project.  A Konveyor maintainer has commit permissions to one or more of the repositories under the [Konveyor organization](https://github.com/konveyor). To see a list of maintainers to the Konveyor project, view the [Konveyor GitHub Teams](https://github.com/orgs/konveyor/teams) page.

Maintainers are members of the Konveyor community who exhibit most of the following behaviors:

- Review and merge code and documentation.
- Help triaging bugs and testing pull requests.
- Make well formed pull requests.
- Have a sense of duty about the project.
- Play well with others, are respectful, show gratitude.

If you want to become a maintainer, we expect you to:
- Add screenshots of any UI changes in your PR. 
- Within the PR description, tag any issues your PR closes with ```Closes #insertIssueNumberHere```. 
- Review and test pull requests submitted by others.
- Encourage and ensure design remains an integral part of the review process and pull in Vince for UX review as needed.
- Support users and other developers on [CoreOS Slack](https://coreos.slack.com/) (there is a channel dedicated to mig-ui).


### Tech Stack

### K8s Client
[Erik](https://github.com/eriknelson) developed an integration layer for interfacing with the k8s apis. Code for this & the underlying technologies involved can be found in the ```/src/client/``` directory. Examples of how to consume the client are found within ```sagas.ts``` files for each segment of the application. 
<br><br>For example: <br>```const client: IClusterClient = ClientFactory.cluster(state); ``` 
<br>
```client.get(KubeResourceType, KubeResourceName)```
<br>
<br>
A 3rd party promise library, [Q](https://github.com/kriskowal/q/wiki/API-Reference), is used to chain multiple results together & allows us to reliably manage results from api calls that have dependencies on eachother. Examples with helpful comments can be found within ```sagas.ts``` files.


#### React
We are using React 16.x. Our project uses [functional components](https://reactjs.org/docs/components-and-props.html), [hooks](https://reactjs.org/docs/hooks-reference.html), and [ context](https://reactjs.org/docs/context.html). 

#### Redux

For state management within the app, we use [Redux](https://react-redux.js.org/)

To handle side-effects, we use [Redux Saga](https://redux-saga.js.org/). We leverage sagas to create a seperate thread in our app designed to handle data fetching, resource polling, and any other background tasks relevant to keeping the UI in sync with the underlying [controller API](https://docs.google.com/document/d/1BWlSlsrV_uzjLyFVkoYmjHaNHs-F__exMAh8yTVqAeg/edit?usp=sharing). 

#### Patternfly & SASS Modules

To style the application, we are using [Patternfly](https://patternfly-react.surge.sh/) alongside [Sass modules](https://medium.com/clover-platform-blog/modular-scss-and-why-you-need-it-6bb2d8c40fd8).<br>
<br>
Instructions for adding style to a component:
1) Inside the .jsx component file:
`const styles = require('./AddEditStorageForm.module');`

2) Create a new file in the component directory called: 
`AddEditStorageForm.module.scss`

3) Add style to .scss module file:
`.testStyleForComponent{ color: red}`

4) In .jsx component file, you can style your JSX using the:
`<GridItem className={styles.testStyleForComponent}>`

#### Directory Structure 

We have adopted the [ducks pattern](https://www.freecodecamp.org/news/scaling-your-redux-app-with-ducks-6115955638be/) for structuring our application. 

### Testing

This area of our codebase needs work. Contributions wanted! 

### Quick tips for new maintainers
- A good place to start contributing would be [here](https://github.com/konveyor/mig-ui/issues?q=is%3Aissue+is%3Aopen+label%3Alow-hanging-fruit). Low-hanging fruit tags indicate that these issues would be relatively straightforward to pick up.
- If something you merged broke something, it’s your responsibility to resolve or coordinate how to resolve the issue.
 [1]: http://contributor-covenant.org/version/1/4/code_of_conduct.md