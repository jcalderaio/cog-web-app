

// Test just this layer component
// (provides more details in summary)
// npm test -- --watch --collectCoverageFrom=src/components/visualizations/Map/Layers/StateIconCountLayer.jsx --testPathPattern=components/visualizations/Map/Layers/StateIconCountLayer.test.jsx
import React from 'react';
// import createReactClass from 'create-react-class';
import { shallow } from 'enzyme';
import StateIconCountLayer from './StateIconCountLayer';

global.sessionStorage = {
  config: '{}'
}

describe('StateIconCountLayer', () => {
  const wrapper = shallow(<StateIconCountLayer width={100} height={100} onRef={() => {}} />);
  
  const mockData = [
    {
      "date": "09/2017",
      "month": 10,
      "year": 2017,
      "messagesDelivered": 1353,
      "organization": "decaturmorgan.direct.alohr.alabama.gov",
      "__typename": "HieDirectMessagesByOrganization",
      "name": "Decatur Morgan Hospital",
      "lat": 34.577202169673,
      "lng": -87.016231377902,
      "coordinates": [
        -87.016231377902,
        34.577202169673
      ]
    },
    {
      "messagesDelivered": 1353,
      "organization": "nearby.decaturmorgan",
      "name": "Nearby Decatur Morgan Hospital",
      "lat": 34.5773,
      "lng": -87.0163,
      "coordinates": [
        -87.0163,
        34.5773
      ]
    },
    {
      "date": "09/2017",
      "month": 10,
      "year": 2017,
      "messagesDelivered": 1218,
      "organization": "huntsvillehospital.direct.alohr.alabama.gov",
      "__typename": "HieDirectMessagesByOrganization",
      "name": "Huntsville Hospital",
      "lat": 34.721,
      "lng": -86.577,
      "coordinates": [
        -86.577,
        34.721
      ]
    },
    {
      "date": "09/2017",
      "month": 10,
      "year": 2017,
      "messagesDelivered": 168,
      "organization": "helenkeller.direct.alohr.alabama.gov",
      "__typename": "HieDirectMessagesByOrganization",
      "name": "Hellen Keller Hospital",
      "lat": 34.7463559,
      "lng": -87.6990647,
      "coordinates": [
        -87.6990647,
        34.7463559
      ]
    }
  ];

  const clusteredData = wrapper.instance()._updateCluster({
    iconCount: {
      data: mockData
    },
    viewport: {
      "latitude": 32.57277584075925,
      "longitude": -86.68069076538085,
      "zoom": 5,
      "pitch": 0,
      "bearing": 0
    },
    groupKey: 'organization',
    countKey: 'messagesDelivered'
  });

  it('should cluster data points', () => {
    // console.log(clusteredData);
    expect(clusteredData.length).toEqual(4);
    expect(clusteredData[0].points.length).toBeGreaterThan(1);
    expect(clusteredData[3].points.length).toEqual(1);

  });

});