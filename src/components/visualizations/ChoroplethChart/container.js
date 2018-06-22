import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Terraformer from "terraformer";
import _ from "lodash";
import { graphql } from "providers/GraphQL";

import { Choropleth } from "./index";
const topojson = require("topojson");

import { withConfig } from "@cognosante/react-app";

function cleanTitle(title) {
  return title.replace(/_/g, " ");
}

/**
 * Region Charts require the following for rendering:
 *  shape data - this is a static CDN fetched asset. File names look like `Michigan.topo.json`. They
 *  contain the data required to draw the region as a svg
 *
 *  Taxonomy:
 *    Layers:
 *      - Maps are rendered in layers. This is done using D3 and topojson libaries
 *      - layers are usually specified with json file formats:
 *        - geojson - json format for specifiying geometric shapes that can be rendered
 *        - topojson - this is actually built on top of geojson
 *    Topology:
 *      - e.g. Missouri.topo.json
 *      - format: topojson
 *      - these will attempt to be fetched from CDN - we should display a failure if
 *        fail to fetch a topology file
 *        - file url from props: /{country}/{regionType}/{region}/
 *          - if DNE show failure
 *    Feature Collection files:
 *      - e.g. Missouri.geo.json
 *      - format: geojson
 *      - these are FeatureCollection json files which can contain Points, Polygons etc.
 *
 *    Hierarchy: There exist hierarchies between certain topologies. We assume some here for the purpose
 *      of zooming in on the map
 *      - example hierarchy from US Census: http://www2.census.gov/geo/pdfs/reference/geodiagram.pdf
 *
 *      Assumptions:
 *        - state -> county (or municipality) -> city
 *        - we assume the TOP layer is a topojson layer and the
 *          subsequent `feature` layers are geojson layers
 *
 *    Rendering:
 *      - try to fetch topology based on props from CDN
 *      - if there exists a natural hierachy that we assume (see above),
 *        we try to fetch the subsequent feature collections if specified by props
 *      - the collection properties that will be graphed need to be specified. This data
 *        should be fetchable by props.getData() (in the future we'll need some way to map arbitrary
 *        data to a proper feature collection if the raw feature collection data isnt expected from the API)
 *        - currently we'll only support graphing these as circles on the graph
 *
 *    e.g. props: {
 *      country: us,
 *      regionType: county,
 *      region: Puerto_Rico,
 *      data: {}, // geo json feature collection
 *      featureProps: {} // tell map with feature properties to chart (as circles or points)
 *    }
 *
 *
 *
 * @class ChoroplethContainer
 * @extends {React.Component}
 */
class ChoroplethContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      polygonData: [],
      meshData: [],
      regionCityData: [],
      parentRegion: "",
      atParentLevel: true,
      mapLayers: [],
      unfilteredMapLayers: []
    };

    this.changeRegion = this.changeRegion.bind(this);
    this.toParentRegion = this.toParentRegion.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.mapRegionTypeToFormat = this.mapRegionTypeToFormat.bind(this);
    this.filterCityData = this.filterCityData.bind(this);
    this.constructCDNUrl = this.constructCDNUrl.bind(this);
  }

  componentDidMount() {
    this.changeRegion(this.props.regionType, this.props.region);

    if (!this.props.data) {
      this.fetchData().then(data => {
        this.setState({
          mapLayers: [data],
          unfilteredMapLayers: [data]
        });
      });
    } else {
      this.setState({
        mapLayers: [this.props.data],
        unfilteredMapLayers: [this.props.data]
      });
    }
  }

  fetchData() {
    if (this.props.getData) return this.props.getData();
    return Promise.reject();
  }

  constructCDNUrl(regionType, region, format) {
    return Promise.resolve(`${this.props.config.geoDataBaseURL}/us/${regionType}/${region}.${format}.json`);
  }

  fetchSetShapeData(regionType, region, format) {
    this.constructCDNUrl(regionType, region, format)
      .then(axios.get)
      .then(result => {
        const collectionKey = `${region}.geo`;
        const polygonData = topojson.feature(result.data, result.data.objects[collectionKey]);
        const meshData = topojson.mesh(result.data, result.data.objects[collectionKey], (a, b) => {
          return a !== b;
        });
        const featuresData = polygonData.features;
        this.setState({
          polygonData: polygonData,
          meshData: meshData,
          featuresData: featuresData
        });
      });
  }

  getShapeData(regionType, region, parentRegion, format) {
    // If rendering an element, the data will already be present from the previous region data loaded.
    // The element is a polygon (geo Feature) within the larger one (which was a FeatureCollection).
    if (regionType !== "element.county") {
      this.fetchSetShapeData(regionType, region, format);
    }

    // If the regionType is 'element.county' then it's a subsection of the region geojson which has already been fetched.
    // We can render the polygon just fine without loading another JSON file; however, we won't have the zcta data.
    // So load the zcta (zip code tabluation area) data for the state for the mesh. Though we don't want to draw lines
    // outside of the polygon of course, so the array needs to be filtered to only include zip codes for the county.
    // How do we know which zip codes belong to which county? By cross referencing ZIP/FIPS (another data set).
    // Then after that, all that will remain are the zipcodes we want to draw on top of the county polygon as lines/mesh.
    // In the future, clicking on that again could drill down to render a zcta polygon by itself (we have no further details
    // beyond that though, so there would be no mesh at that point -- but perhaps we can find points to label cities... which
    // is also something that may be desired at a higher zoom level anyway).
    if (regionType === "element.county") {
      // console.log('element to draw', region);
      // Since the region is of type 'element.county' it will have a fips property to use to figure out the zipcodes.
      const singleFeatureCollection = {
        type: "FeatureCollection",
        features: [region]
      };

      // NOTE: Do not render a mesh for county level detail. The zip code tabulation areas can fall outside county polygons.
      // Without clipping them, it looks weird and even when clipping them it makes it a bit confusing. Drawing other features
      // would be more helpful to the user as a guide.
      //
      // console.log('loading:', `/assets/data/geo/zcta/${parentRegion}.${format}.json`);
      // // Note: zcta contains topology with polygons. zipcodes directory contains geojson with points.
      // // The challenge here is that zipcode bounary lines (from zip code tabulation areas) can fall outside county polygons.
      // // So it may or may not make sense to render those lines. Alternatively, we can plot zip codes in counties as labels.
      // // Perhaps the largest cities as well (need more data for that).
      // axios.get(`/assets/data/geo/zcta/${parentRegion}.${format}.json`)
      //   .then(result => {
      //     const collectionKey = `${parentRegion}.geo`;
      //     // no need for this polygon data (it's the state again), we are rendering the county
      //     // const polygonData = topojson.feature(result.data, result.data.objects[collectionKey]);

      //     // but we will take the mesh data
      //     // TODO: filter out zipcodes not in the current county
      //     const meshData = topojson.mesh(
      //       result.data, result.data.objects[collectionKey], (a, b) => { return a !== b; }
      //     );
      //     // console.log('poly data', polygonData);

      //     this.setState({ polygonData: singleFeatureCollection, meshData: meshData });
      //   });

      this.setState({ polygonData: singleFeatureCollection, meshData: null });
    }
  }

  // getTopCityLabels will return a subset of city data for a given region
  getTopCityLabels(regionType, region, format, filterOptions = { polygon: false, sort: "population", limit: 5 }) {
    // Get the city data for the region if not already retrieved
    // TODO: OR if the region has changed where new data would be needed (ie. changing states, which we can't do in the current demo)
    if (this.state.regionCityData.length === 0) {
      this.constructCDNUrl(regionType, region, format)
        .then(axios.get)
        .then(result => {
          this.setState({ regionCityData: result.data }, () => {
            // if county, filter the data
            // if (regionType === 'element.county') {
            //   this.filterCityData(filterPolygon);
            // }
            if (filterOptions.polygon) {
              this.filterCityData(filterOptions.polygon, filterOptions.sort, filterOptions.limit);
            } else {
              // For state level, we can show more cities. Take 20.
              // Actually, they get fairly bottled up. Cities with higher population tend to cluster.
              // this.filterCityData(false, filterOptions.sort, 20);
              this.filterCityData();
            }
          });
        });
    }
  }

  // TODO: refactor. loop and filter all passed data layers for the region.
  // In fact, this can probably even filter the city data along with the user passed data.
  // Might even be nice to allow filtering functions to be provided.
  // That way when the region is changed, not only are points outside the polygon automatically
  // excluded, but specific logic can be passed down to further filter/limit.
  // Maybe even have optional filtering for points outside the polygon, there may be cases
  // where it's desirable to see points outside the polygon...indicating data in a neighboring
  // region or county. Perhaps make it a little less assuming.
  filterLayers(filterPolygon) {
    // TODO: filter all layer data on update... will be an array of layers data.
    if (this.state.unfilteredMapLayers && this.state.unfilteredMapLayers[0]) {
      const mapLayers = Object.assign({}, this.state.unfilteredMapLayers[0]);
      const layerFeatures = mapLayers.features.slice();

      if (filterPolygon) {
        mapLayers.features = layerFeatures.filter(feature => {
          const point = new Terraformer.Primitive({
            type: "Point",
            coordinates: feature.geometry.coordinates
          });
          return point.within(filterPolygon);
        });
      }

      this.setState({ mapLayers: [mapLayers] });
    }
  }

  // filterCityData will check to see if the city is within a given region polygon (county, state, etc.)
  filterCityData(filterPolygon = false, sort = "population", limit = 10) {
    // Be sure to copy from state
    const cityLabels = Object.assign({}, this.state.regionCityData);

    const features = this.state.regionCityData.features.slice();
    const sortByPopulation = function(cityA, cityB) {
      if (cityA.properties.show === true) {
        return -1;
      } else if (cityB.properties.show === true) {
        return 1;
      }

      const popA = cityA.properties.population || cityA.properties.pop_2010;
      const popB = cityB.properties.population || cityB.properties.pop_2010;

      if (popA === undefined && popB === undefined) return 0;
      else if (popA === undefined) return 1;
      else if (popB === undefined) return -1;

      return popA > popB ? -1 : popB > popA ? 1 : 0;
    };

    // Sort by population largest by default
    switch (sort) {
      case "population":
      default:
        features.sort(sortByPopulation);
    }

    const filteredCities = features.filter(feature => {
      // If filterPolygon is false then don't filter by within().
      if (!filterPolygon) {
        return true;
      }
      const point = new Terraformer.Primitive({
        type: "Point",
        coordinates: feature.geometry.coordinates
      });
      return point.within(filterPolygon);
    });

    // limit to 10 by default
    cityLabels.features = filteredCities.slice(0, 15);
    // console.log('filtered city data', cityLabels);
    // console.log('original', this.state.regionCityData);
    this.setState({ cityLabelData: cityLabels });
  }

  mapRegionTypeToFormat(regionType) {
    // The files used have different names based on their format. Most are topojson.
    // TODO: the key below won't be valid for zipcodes... "counties" have "Washington.geo" keys but zipcodes don't.
    // So collectionKey below needs to change based on regionType

    if (regionType === "counties" || regionType === "zcta") {
      return "topo";
    } else {
      // regionType === 'zipcodes' || regionType === 'cities' ...
      return "geo";
    }
  }

  changeRegion(regionType, region, parentRegion) {
    let format = this.mapRegionTypeToFormat(regionType);
    // Get the region data (draws polygons and lines)
    this.getShapeData(regionType, region, parentRegion, format);

    // TODO: Something more generic perhaps, that has rules around what and how much to plot.
    // Get the plottable data (labels for cities, etc. things based on Point values instead of Polygon or MultiPolygon)
    // this.getPointData(regionType, region, parentRegion, format);

    // For now, show top populated city labels (which may always be a simple flag, but could be part of the more generic
    // getPointData() function).
    this.getTopCityLabels("cities", region, this.mapRegionTypeToFormat("cities"));
    // if there's a parent region, the current region is the county level (for now). Filter out anything not there
    // so it's not seen off the edges of the polygon. This filter function also limits to 10.
    if (parentRegion !== undefined && parentRegion !== "") {
      this.filterCityData(region);
      this.filterLayers(region);
      // TODO: ensure the "county" label remains accurate as "parent" won't always mean state.
      this.setState({ atParentLevel: false, mapTitle: "(" + cleanTitle(`${region.properties.name} County`) + ")" });
    } else {
      // TODO: this has to be redone for more zoom/nav levels. ie. Country -> State -> County
      this.setState({ parentRegion: region, parentRegionType: regionType });
      this.setState({ atParentLevel: true, mapTitle: "(" + cleanTitle(region) + ")" });
    }
  }

  toParentRegion() {
    if (this.state.parentRegion !== "") {
      this.changeRegion(this.state.parentRegionType, this.state.parentRegion);
      this.filterCityData();
      this.filterLayers();
    }
  }

  render() {
    return (
      <Choropleth
        polygonData={this.state.polygonData}
        meshData={this.state.meshData}
        featuresData={this.state.featuresData}
        cityLabelData={this.state.cityLabelData}
        width={this.props.widgetWidth}
        height={this.props.dataGrid ? this.props.widgetHeight - 120 : this.props.widgetHeight}
        handleChange={this.changeRegion}
        handleToParentRegion={this.toParentRegion}
        atParentLevel={this.state.atParentLevel}
        mapTitle={this.state.mapTitle}
        showTooltip
        layers={this.state.mapLayers}
        {...this.props}
      />
    );
  }
}

// Default Choropleth props
ChoroplethContainer.defaultProps = {
  style: {},
  region: "",
  regionType: "counties"
};

// Props validation
ChoroplethContainer.propTypes = {
  style: PropTypes.object,
  region: PropTypes.string,
  regionType: PropTypes.string
};

export default withConfig(graphql(ChoroplethContainer));
