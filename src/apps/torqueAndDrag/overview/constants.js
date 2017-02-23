export const CATEGORY = 'torqueAndDrag';
export const NAME = 'overview';
export const SUBSCRIPTIONS = [
  {appKey: 'corva.torque-and-drag', collection: 'overview'}
];
export const METADATA = {
  title: 'T&D Overview',
  settingsTitle: 'T&D Overview',
  subtitle: 'Weight transfer to bit efficiency and drag severity',
  developer: {name: 'Corva', url: 'http://www.corva.ai/'},
  version: 'v2.1',
  publishedAt: '2016-07-01T00:00:00'
};
export const SUPPORTED_ASSET_TYPES = ['rig'];
export const INITIAL_SIZE = {w: 2, h: 10};
export const SUPPORTED_CHART_SERIES = {
  drag_trend: {label: 'Drag Trend', defaultColor: '#f7e47a'}
};
