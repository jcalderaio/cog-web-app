// Libs
import React from 'react';
import gitPackage from '../../package.json';

export default function VersionNumber() {
  return <span className="version-number">Version {gitPackage.version} - {gitPackage.commit}</span>;
}
