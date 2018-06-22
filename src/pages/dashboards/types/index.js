/**
 * index.js
 * This file contains references to all of the available
 * dashboard "types." These are less dynamic in nature in
 * that they don't need to be full of "widgets." They are
 * essentially just rendered components or "pages."
 * We just think of them as dashboards and keep them
 * under the dashboards and keep the same route in the
 * router so that we don't need to create new router
 * entries for each new type.
 *
 * New dashboards must "register" here.
 * Note the `find()` function makes it easy to dynamically
 * reference dashboards using dot syntax. This helps keep
 * dashboards types better structured and organized.
 *
 * It works very much like the widget resitry.
 *
 * Example Usage:
 * ```
 * import DashboardTypes from 'pages/dashboards/types';
 * ...
 *
 * render() {
 *   const SomeDashboardType = DashboardTypes.find('Foo');
 *   return (
 *      <div>
 *         <SomeDashboardType />
 *      </div>
 *   )
 * }
 * ```
 */
import React from 'react';
import HEDISMeasures from 'pages/dashboards/types/HEDISMeasures'; // <-- old, deprecate (still used in demos)
import Cardiology from 'pages/dashboards/types/Cardiology'; // <-- old, deprecate (still used in demos)
import W15Dashboard from 'pages/dashboards/types/W15Dashboard'; // <-- old, deprecate (still used in demos)
import BMIDashboard from 'pages/dashboards/types/BMI/container'; // <-- old, deprecate (still used in demos)
// New custom dashboards/pages
import PrenatalCare from 'pages/dashboards/types/HIE/Measures/PrenatalCare/index.jsx';
import WellChild from 'pages/dashboards/types/HIE/Measures/WellChild/index.jsx';
import BreastCancer from 'pages/dashboards/types/HIE/Measures/BreastCancer/index.jsx';
import Mips236Details from 'pages/dashboards/types/HIE/Measures/MIPS/index.jsx';
import Map from 'pages/dashboards/types/Example/Map.jsx';
import HIEQueries from 'pages/dashboards/types/Example/HIEQueries.jsx';
import RegisteredUsersDetail from 'pages/dashboards/types/HIE/Management/RegisteredUsersDetail/index.jsx';
import RegisteredDocumentsDetail from 'pages/dashboards/types/HIE/Management/RegisteredDocumentsDetail/index.jsx';
// eslint-disable-next-line
import PatientsConsentPoliciesDetail from 'pages/dashboards/types/HIE/Management/PatientsConsentPoliciesDetail/index.jsx';
import DirectSecureMessagesDetail from 'pages/dashboards/types/HIE/Management/DirectSecureMessagesDetail/index.jsx';
import StreamletsByFacilityDetail from 'pages/dashboards/types/HIE/Management/StreamletsByFacilityDetail/index.jsx';
import MrnsDetail from 'pages/dashboards/types/HIE/Management/MrnsDetail/index.jsx';
import MpiidsDetail from 'pages/dashboards/types/HIE/Management/MpiidsDetail';
import PatientSearchDetails from 'pages/dashboards/types/HIE/Management/PatientSearchDetails';

export const DashboardTypeRegistry = {
  /**
   * This find is case insensitive.
   * It will loop through this object to find matching keys.
   * Note that it will exclude this "find" function key.
   * No dashboard should include the word "find" (if this becomes
   * problematic, can prefix with _ or something, but doubtful it'd
   * become a problem because that's a strange name for a dashboard).
   *
   * @param path string Dot.separated.path string to find a function (Component) in this registry object
   */
  find: function(path) {
    path = path.toLowerCase();
    if (!path || path === 'find') {
      return React.createElement;
    }
    const obj = this;
    var paths = path.split('.'),
      current = obj,
      i;

    for (i = 0; i < paths.length; ++i) {
      for (let key in current) {
        if (key !== 'find') {
          if (paths[i] === key.toLocaleLowerCase()) {
            current = current[key];
          }
        }
      }
    }

    return typeof current === 'function' ? current : undefined;
  },
  // Available dashboard types
  HEDISMeasures: HEDISMeasures, // <-- old, depcreate
  Cardiology: Cardiology, // <-- old, depcreate
  W15Dashboard: W15Dashboard, // <-- old, deprecate
  BMIDashboard: BMIDashboard, // <-- old, deprecate
  // New measures dashboards held under pages/dashboards/types/HIE/Measures/...
  // For paths like: site.com/#/dashboard/HIE.Measures.PrenatalCare
  HIE: {
    Measures: {
      'MIPS-236': Mips236Details,
      PrenatalCare: PrenatalCare,
      WellChildVisit15: WellChild,
      BreastCancerScreening: BreastCancer
    },
    Management: {
      RegisteredUsersDetail,
      RegisteredDocumentsDetail,
      PatientsConsentPoliciesDetail,
      DirectSecureMessagesDetail,
      StreamletsByFacilityDetail,
      MrnsDetail,
      MpiidsDetail,
      PatientSearchDetails
    }
  },
  Example: {
    Map: Map,
    HIEQueries: HIEQueries
  }
  // Example under a directory.
  // 'Subfolder': {
  //   'SomeType': SomeTypeComponent
  // }
};
