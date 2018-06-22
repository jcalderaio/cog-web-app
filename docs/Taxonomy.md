# eSante Insights Application Taxonomy
I'm wondering how to handle the some of the existing functionality in the taxonomy defined here. Here's
one possible route. This should handle the currently defined dashboards (including current Measures dashboard).

- Routing:
  - `dashboards/:dashboardId`                         -> page of insight summary widgets
  - `dashboards/:dashboardId/:insightId/`             -> full page insight (all insight widgets)
  - `dashboards/:dashboardId/:insightId/:widget-name` -> full page widget

- Dashboard `src/pages/dashboards/`:
  - name
  - collection of insights
  - layout (for insight summary widgets)
  - query (optional) - if defined, data will be fetched at dashboard level and passed to insights
  - supported filters (optional) - if defined, filter component will be rendered
    - at the dashboard level, we could limit this to, say, only date filters. e.g. 2015, 2016 or by month
    ```
      if (query defined at dashboard level): # i.e. data fetching handled at top level
        filters changing will cause a query at the dashboard level and data passed to
        insights
      else: # i.e. data fetching handled by insights
        filters will be passed down to ALL insights. insights should be able to handle
        filters being passed gracefully (ie. if not supported, no problem. perhaps a slight UI indication
        such as a toast "Insight X doesnt support filter Y")

        if valid filter for insight -> query with new filters
     ```

- Insight `src/pages/insights`:
  - name
  - summary widget - this will be shown in the dashboard. It will link to the full
    insight page which will include all of the insights widgets.
  - collection of widgets
  - layout (for insight widgets on full insight page)
  - query (optional)
  - supported filters (optional) - if defined, filter component will be rendered on insight page
  - another dashboard link (optional) - this will be linked in the summary widget

- Widget `src/components/widgets`:
  - (dumb) presentational components
  - type - corresponds to D3 or recharts display component
  - configs (passed in by props)
    - comes with defaults
    - will persist configs if prop.saveConfig function is passed. i.e. if insight
      is configured to persist UI changes, it should pass this method
  - libraries:
    - [recharts](recharts.org/#/en-US/api/)
    - [D3 JS](https://github.com/d3/d3/wiki)
