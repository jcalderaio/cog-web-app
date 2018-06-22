import { scaleOrdinal, schemeCategory10, schemeCategory20 } from 'd3-scale';

export const Constants = {
  scheme: function(i) {
    const colors = [
      '#0071bc', // U.S. Primary Blue
      '#f89000', // Cog Orange
      '#494440', // U.S. Dark Warm Gray <-- hard to see in some cases. not terrible. but not sure it should be a primary color.
      // '#18a39e', // Cog Teal <-- either this or the mint, but both seemed to lack some contract. this created issues with the primary blue too when tinted
      // '#60b5ce', // Cog Blue (light) <-- this is too close to the teal or mint in contrast
      '#7ae8a6', // Cog Mint
      '#9a2c00', // Cog Red (brownish)
      '#112e51', // U.S. Primary Darkest Blue
      // '#e8dd26', // Cog Yellow <-- hard to see against gray
      '#cd2026', // U.S. Red Dark
      '#7053aa', // Older Cog Purple
      '#6caf3d', // Older Cog Green
    ];
    return colors[i] || colors[0];
  },
  scheme10: scaleOrdinal(schemeCategory10).range(),
  scheme20: scaleOrdinal(schemeCategory20)
}

export default {
  Constants
};