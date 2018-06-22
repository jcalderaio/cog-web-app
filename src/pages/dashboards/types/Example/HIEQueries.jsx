import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import { LineLayer, ScatterplotLayer } from 'deck.gl';
//import flights from './heathrow-flights.js';
import patientQueries from './patient_care_site_queries_100.js';
// import patientQueries250 from './patient_care_site_queries_250.js';

import StaticMap from 'visualizations/Map/Static';

class HIEQueries extends Component {

  render() {
    //window.luma.log.priority=2;
    //window.deck.log.priority=2;
    // wants them in lon/lat
    // eslint-disable-next-line max-len
    // const data = [{"id":966715093951713280,"source":[-95.6890,39.0558],"destination":[-97.22754327,37.75003838],"sourceName":"WESLEY WOODLAWN HOSPITAL","destinationName":"KANSAS HEART HOSPITAL"}];
    // old start: 37.73122465,-97.26058197

    // console.log(patientQueries);
   
    // styleLayers={["place.*", "barrier.*", "water.*", "admin.*", "state-label.*", "country-label.*"]} 
    return (
      <div>
        <StaticMap 
          stateName="Alabama" 
          data={patientQueries.filter(item => item.source !== null)}
          pitch={0}
        />
      </div>
    );
  }

}

// Defines the default props
HIEQueries.defaultProps = {
};

// Defines propTypes
HIEQueries.propTypes = {
};

export default HIEQueries;