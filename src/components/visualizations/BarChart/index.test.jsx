// npm test -- --watch --collectCoverageFrom=src/components/visualizations/BarChart/index.jsx --testPathPattern=components/visualizations/BarChart/index.test.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Bar } from 'recharts';
import BarChartVisualization from './index';
import { shallow, mount } from 'enzyme';
import { Constants as DateConstants } from '../common/dateControls';

// const NoOp = () => null;

const fakeStore = {};
global.window = {
  location: {
    hash: '#thisisawonderful&code=1&session=3',
    hostname: 'hostname.com'
  }
}
global.localStorage = {
  sessionState: 'zzzzzz',
  sessionStateDomain: 'xxxxxxxx',
  config: {},
  setItem: (key, value) => {
    fakeStore[key] = value;
  }
}

// NOTE: Technically we're looking at <GraphQL><BarChartVisualization></GraphQL> because the HOC.
describe('<BarChartVisualization>', () => {

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<BarChartVisualization />, div);
  });

  const chartData = [
    {
      "month": 0,
      "queries": 3633,
      "queriesNoResult": 1277,
      "submissions": 11,
      "year": 2016
    },
    {
      "month": 0,
      "queries": 25376,
      "queriesNoResult": 1241,
      "submissions": 66,
      "year": 2017
    }
  ];
  const keys = ['queries', {'queriesNoResult': 'queries with no result'}, 'submissions'];
  const groups = [{"a": ["queriesNoResult", "queries"]}];

  const mntWrapper = mount(<BarChartVisualization  
    data={chartData}
    seriesKeys={keys}
    seriesGroups={groups}
    widgetHeight={100}
    showBrush={true}
    />);
  // debug() is your friend
  // console.log(mntWrapper.debug())

  const barChartVisualization = mntWrapper.children().first().instance();

  describe('getSeries() returns <Bar /> components that', () => {
    
    // Look at the <Bar /> components.
    // NOTE: These do not yet have data. Nor are we really concerned with that (assume recharts has tests).
    // The getSeries() function sets props and that's what needs to be tested.
    const bars = barChartVisualization.getSeries(
      ['queries', {'queriesNoResult': 'queries with no result'}, 'submissions'],
      [{"a": ["queriesNoResult", "queries"]}]
    );
    // console.log(shallow(bars[0]).instance());

    it('should be a recharts <Bar /> component', () => {
      expect(shallow(bars[1]).instance()).toBeInstanceOf(Bar);
    });

    it('should allow custom names for legend and tooltips', () => {
      expect(shallow(bars[1]).instance().props.name).toEqual('queries with no result');
    });

    it('should support stacked series', () => {
      expect(shallow(bars[2]).instance().props.stackId).toBeNull();
      expect(shallow(bars[0]).instance().props.stackId).toEqual(shallow(bars[1]).instance().props.stackId);
    });

    it('should have a fill color', () => {
      expect(shallow(bars[0]).instance().props.fill).toContain('#');
    });

  });

  describe('transformKeyToDisplay()', () => {
    it('should be able to return a key value for display', () => {
      const displayKey = barChartVisualization.transformKeyToDisplay({'queriesNoResult': 'queries with no result'});
      expect(displayKey('queriesNoResult')).toEqual('queries with no result');
    })
  });

  describe(`DateConstants`, () => {
    it(`should abbreviate month 1 (February) as 'f'`, () => {
      expect(DateConstants.monthsAbbr[1]).toEqual('f');
    });
  });

});