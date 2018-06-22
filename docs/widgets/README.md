# Widgets

The concept of a widget in the dashboard is nothing more than a div element wrapping content (be it a chart or other visualization)
positioned on the page (typically a grid system). Of course these widgets contain titles and styling and various props as well.

To assist with this there exists a `<ResponsiveWidget />` component that will automatically apply the `widget` class for CSS, etc.
Most importantly this particular component will pass down its height and width to its children so that they can be aware of how
much space there is to work with (super important for sizing and re-sizing SVGs that need to specify dimensions).

Each widget will then contain visualization components which are colloquially considered "widgets." So under the `components/widgets`
directory, you will find these types of components. There also exists a `components/common` directory that houses various re-usable
functionality for each widget. Also note that there are sometimes multiple components that make up any given visualization widget
(for example the map visualizations).