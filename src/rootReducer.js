import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux'

import login from './login';
import pages from './pages';
import torqueAndDragBroomstick from './apps/torqueAndDragBroomstick';

export default combineReducers({
  routing: routerReducer,
  [login.constants.NAME]: login.reducer,
  [pages.constants.NAME]: pages.reducer,
  [torqueAndDragBroomstick.constants.NAME]: torqueAndDragBroomstick.reducer
});
