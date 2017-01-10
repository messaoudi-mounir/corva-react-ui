import { createSelector } from 'reselect'
import { Map } from 'immutable';
import { isEmpty, trim } from 'lodash';
import { NAME, ASSET_TYPES } from './constants';

export const assets = state => state[NAME];

// A list of assets, filtered and sorted according to the params prop.
// The items in the list will, on top of regular asset properties, have a parents 
// key of their parent assets.
export const assetList = createSelector(
  assets,
  (_, props) => props.params.assetType,
  (_, props) => trim(props.location.query.search || '').toLowerCase(),
  (_, props) => props.location.query.sortField || 'name',
  (_, props) => props.location.query.sortOrder === 'desc',
  (allAssets, assetTypeCode, search, sortField, reverseSort) => {
    const parentTypes = collectParentAssetTypes(assetTypeCode);
    const assets = allAssets
      .valueSeq()
      .filter(a => a.get('type') === assetTypeCode)
      .filter(a => isEmpty(search) || a.get('name').toLowerCase().indexOf(search) >= 0)
      .map(a => a.set('parents', collectParentAssets(allAssets, a)))
      .sortBy(
        a => a.get(sortField) || a.getIn(['parents', sortField, 'name']),
        makeAssetComparator(reverseSort)
      );
    return Map({assets, parentTypes});
  }
  
);

// The asset currently shown on the page, based on the params prop, usually coming from a route.
// If the asset is a a resolvable asset, resolves it to its active descendant (e.g. rig->well).
// May return undefined/null if the asset or its active descendants have not been loaded.
export const currentAsset = createSelector(
  assets,
  (_, props) => props.params.assetId,
  (allAssets, assetId) => {
    const asset = getActiveDescendant(allAssets, assetId);
    if (asset && asset.get('parent_id')) {
      return asset.set('parent', allAssets.get(asset.get('parent_id')));
    } else {
      return asset;
    }
  }
);

// "Recent" assets to show e.g. in the navigation. Right now just takes a 
// few rigs, since we don't currently have a way to know what's "recent" for the user.
export const recentAssets = createSelector(
  assets,
  allAssets => allAssets
    .valueSeq()
    .filter(a => a.get('type') === 'rig')
    .toList()
    .take(7)
    .sortBy(a => a.get('name'))
);

export function isResolvableAsset(asset) {
  return ASSET_TYPES.get(asset.get('type')).get('isResolvedToActiveChild');
}

export function isResolvedAsset(asset) {
  return asset.has('activeChildId');
}

function getActiveDescendant(allAssets, assetId) {
  let asset = allAssets.get(assetId);
  while (asset && isResolvableAsset(asset)) {
    if (isResolvedAsset(asset)) {
      asset = allAssets.get(asset.get('activeChildId'));
    } else {
      return null;
    }
  }
  return asset;
}

function collectParentAssetTypes(assetTypeCode) {
  let parentTypes = Map();
  let nextParentCode = assetTypeCode;
  while (ASSET_TYPES.hasIn([nextParentCode, 'parent_type'])) {
    nextParentCode = ASSET_TYPES.getIn([nextParentCode, 'parent_type']);
    parentTypes = parentTypes.set(nextParentCode, ASSET_TYPES.get(nextParentCode));
  }
  return parentTypes;
}

function collectParentAssets(allAssets, asset) {
  let parents = Map();
  let nextParent = asset;
  while (nextParent && nextParent.has('parent_id')) {
    nextParent = allAssets.get(nextParent.get('parent_id'));
    if (nextParent) {
      parents = parents.set(nextParent.get('type'), nextParent);
    }
  }
  return parents;
}

function makeAssetComparator(reverseSort) {
  return (a, b) => {
    if (a === b) {
      return 0;
    } else if (a < b) {
      return reverseSort ? 1 : -1;
    } else if (a > b) {
      return reverseSort ? -1 : 1;
    }
  }
}
