## Handy Notes

### FSEvent watcher

On OS X, if you see errors with FSEventStreamStart with stuff like:
`ERROR  Error watching file for changes: EMFILE`

Ensure you have the following installed:
brew install watchman
npm install -g jest

### Running with various Jest flags

To watch for example (yes, two sets of --):

`npm test -- --watch`

If you want to test just one component, for example:

`npm test -- --watch --testPathPattern BarChart`

Of course then you also may only want to see coverage reports for just that and not everything, so you
could do something like this:

`npm test -- --watch --collectCoverageFrom=src/components/visualizations/BarChart/index.jsx --testPathPattern=BarChart`

Any flags can be passed here. There's some useful ones.
See: https://facebook.github.io/jest/docs/en/cli.html

### Module aliases

Note that config/webpack.config.dev.js (and .prod.js) may have aliases under a `module.alias` section.
These need to also be present in package.json under `jest.moduleNameMapper` otherwise tests won't run.
So if any new module aliases are added and then you see errors when running tests about modules not
being found, check this.

There may be a more clever way to use Jest with Webpack here...


### Globals

`sessionStorage` was missing in some cases, such as running individual tests. 
It's typically an empty object. `DashboardContainer.test.jsx` included it under the `global`
object. Rather than setting that in every test file, it was set up in the `jest.globals`
in package.json. It defaults to:

```
"sessionStorage": {
  "config": {}
}
```

Individual test files can of course override as needed.
There may be other common variables to always have available with a default value for all
tests as well. Feel free to add them.

### Import fun

See stuff like this?

`Invariant Violation: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined.`

Sometimes it's how things are imported. Try:
`import MyComponent from '../component.js'`
instead of:
`import { MyComponent } from '../component.js'`

https://stackoverflow.com/questions/34130539/uncaught-error-invariant-violation-element-type-is-invalid-expected-a-string

### Enzyme configuration

So that shallow(), render(), and such are available for all test files without having to import them there,
a `config/jest/configure.js` file was created and is loaded by package.json `jest.setupFiles` key.

NOTE: Your VS Code linter may put a red line under the functions since they were made global in another file.

### Testing with mock data (no GraphQL)

It's a good idea to isolate tests from the GraphQL component (that'd be more of an integration test).
Even if we wanted to combine unit and integration test (bad idea), it'd lead to a lot of duplication.
Think about how many times that GraphQL component would be tested. It also would require mock HTTP responses
and such too. Yuck.

Most components that render visualizations will allow a `data` prop to be passed. 
If you're interested in how this works, look at `components/visualizations/common/dataFormatter.js`

### Good reference

https://facebook.github.io/jest/docs/en/expect.html <-- assertions reference

https://facebook.github.io/jest/docs/en/tutorial-async.html

https://hackernoon.com/testing-react-components-with-jest-and-enzyme-41d592c174f

https://facebook.github.io/jest/docs/en/tutorial-react.html