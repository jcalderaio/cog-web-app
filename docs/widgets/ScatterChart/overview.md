# Scatter Chart Widget

The scatter chart widget will render a [Recharts.org scatter chart](http://recharts.org/#/en-US/examples/SimpleScatterChart).

### Series & Data

Scatter charts can have different series plotted on the same chart. Each can be colored different, but can also
use different symbols for their points.

{% hint style='info' %}
**Note:** Unlike most other Recharts components, a scatter chart passes its data to each individual series 
(`<Scatter data={data} />` component) instead of the parent chart component (`<ScatterChart />`).

Compare that with a radar chart (`<RadarChart data={data} />`) that has child series components of `<Radar />`
that don't get passed data. Those Radar series just get a key to look up and some other styling, color, etc.
{% endhint %}

Each series must use the same x, y, and z axes keys because they are defined by sibling components. 
There can only be one of each axis.

So ideally, data should be passed like this:
```
{
  seriesA: [{x: 1, y: 2, z: 3}],
  seriesB: [{x: 1, y: 2, z: 3}]
}
```

Then a `dataKey` will determine which set of data belongs to which <Scatter /> component (ie. `seriesA` and `seriesB`).
Getting it back from GraphQL like that would be awesome.

However, what if the data was passed like this:
```
[
  {  
  circumference: 50
  month: 6
  nonzika: 33
  total: 49
  year: 2015
  zika: 16
  },
  { ... }
]
```

In the example format above, the x axis is `month` (not much of a scatter, more like GitHub's punch card)
The y is `total` or `nonzika` or `zika` and z is `circumference`.

So we need to restructure the data. A transform function tcan be passed along in the props to do this. 
This way a widget's configuration or a custom static dashboard that understands the data can determine 
how to do this for each series. This keeps this component "dumb" and free of business logic. Of course it's 
nearly impossible to assume how the data needs to be massaged anyway even if we wanted to add a bunch of logic 
in here. This `dataTransform` key is a convention used by other widget components.

It's probably a good idea to still set the `dataKey` even in this case when not used here with a transform, because 
the `<Legend />` references it. That way, when clicking on the legend item, it can reference the `<Scatter />` component.
For example, if you wanted to hide one of the series. The transform function will always be passed the key `i` as the 
second argument so that could be used to set `dataKey` if desired...But that's up to the transform function itself.

This transform can be applied to each series. So the function can be different for each.