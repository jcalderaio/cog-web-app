/**
 * index.js
 * This file contains references to all of the widgets available
 * for use in dashboards. New widgets must "register" here.
 * Note the `find()` function makes it easy to dynamically
 * reference widgets using dot syntax. This helps keep
 * widget components better structured and organized.
 *
 * TODO: An enhancement here would be having Webpack
 * maintain this list of widgets based on what it sees
 * in the "widgets" directory, but also based on NPM
 * modules. One day there may be widgets defined outside
 * of this package entirely, taking a more modular approach.
 *
 * This list is a small hassle to maintain...But is also
 * something that makes sense for configuration. When widgets
 * are housed separate from the application, they could be
 * licensed separately. So depending on the client's license,
 * certain widgets wouldn't even be built into the application.
 *
 * Second, it also removes (or "tree shakes") unused widgets by
 * the specific application. So if one cilent didn't use half
 * of the widgets, they could end up with a smaller application.
 *
 * This isn't super important immediately, but as the application
 * grows and as we start adding more and more widgets (many of which
 * will ultimately be for marketing and demos or be client specific)
 * it would be nice to consider this kind of performance and security.
 *
 * Example Usage:
 * ```
 * import Widgets from 'widgets';
 * ...
 *
 * render() {
 *   const AbstractedWidgetName = Widgets.find('HIE.Utilization');
 *   return (
 *      <div>
 *         <AbstractedWidgetName />
 *      </div>
 *   )
 * }
 * ```
 */
import React from 'react';
import Utilization from 'widgets/HIE/Utilization';
// import DirectMessages from 'widgets/HIE/DirectMessages'; // <--- deprecated
import DirectMessages from 'widgets/HIE/Management/DirectMessages';
import PatientDistribution from 'widgets/HIE/PatientDistribution';
import ProviderTableContainer from 'widgets/HIE/ProviderTable/container';
import ProviderDirectoryContainer from 'widgets/HIE/ProviderDirectory/container';
import NetworkGrowthContainer from 'widgets/HIE/NetworkGrowth/container';
import ParticipationByRegion from 'widgets/HIE/ParticipationByRegion';
import EhrIncentivesByRegion from 'widgets/HIE/EhrIncentivesByRegion';
import Measures from 'widgets/Measures/MeasureWidget';
import OpioidsPrescriberTableContainer from 'widgets/Opioids/PrescriberTable/container';
import RegisteredUsers from './HIE/RegisteredUsers';
import RegisteredDocuments from './HIE/RegisteredDocuments';
import PatientsConsentPolicies from './HIE/PatientsConsentPolicies/index.jsx';
import Mrns from './HIE/Mrns/index.jsx';
import Mpiids from './HIE/Mpiids/index.jsx';
import Streamlets from './HIE/Streamlets/index.jsx';
import PatientSearches from './HIE/PatientSearches';

export const WidgetRegistry = {
  find: function(path) {
    if (!path || path === 'find') {
      return React.createElement;
    }
    const obj = this;
    var paths = path.split('.'),
      current = obj,
      i;

    for (i = 0; i < paths.length; ++i) {
      if (current[paths[i]] === undefined) {
        return undefined;
      } else {
        current = current[paths[i]];
      }
    }
    return current;
  },
  findTitle: function(code) {
    return this.Measures[code];
  },
  // Available widgets
  HIE: {
    Utilization,
    DirectMessages,
    PatientDistribution,
    ProviderTable: ProviderTableContainer, // <-- change/deprecate
    ProviderDirectory: ProviderDirectoryContainer,
    NetworkGrowth: NetworkGrowthContainer,
    ParticipationByRegion,
    EhrIncentivesByRegion,
    Measures,
    RegisteredUsers,
    RegisteredDocuments,
    PatientsConsentPolicies,
    Mrns,
    Mpiids,
    Streamlets,
    PatientSearches
  },
  Measures: {
    PreNatalCare: 'Pre Natal Care',
    BreastCancerScreening: 'Breast Cancer Screening',
    WellChildVisit15: 'Well Child Visit (First 15 Months)'
  },
  Opioids: {
    PrescriberTable: OpioidsPrescriberTableContainer
  }
};
