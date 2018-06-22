import React from "react";
import * as ReactDOM from "react-dom";

import { AppHost, activateLog } from '@cognosante/react-app';

// Styles
import "material-design-iconic-font/dist/css/material-design-iconic-font.css";
import "./assets/sass/style.scss";

import AppContainer from "./AppContainer";

activateLog('app:*');
// activateLog('auth:*');
// activateLog('inform:*');

const MOUNT_NODE = document.getElementById("root");

ReactDOM.render(
  <AppHost>
    <AppContainer/>
  </AppHost>,
  MOUNT_NODE
);
