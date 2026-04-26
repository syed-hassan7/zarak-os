import type { AppId, OSAction, OSState } from './types';

export function createInitialOSState(defaultOpenApps: AppId[]): OSState {
  return {
    openApps: defaultOpenApps,
    activeApp: defaultOpenApps[0] ?? null,
    minimizedApps: [],
    zOrder: defaultOpenApps,
    windowLayouts: {},
  };
}

function withoutApp(apps: AppId[], appId: AppId): AppId[] {
  return apps.filter((id) => id !== appId);
}

function appendUnique(apps: AppId[], appId: AppId): AppId[] {
  return apps.includes(appId) ? apps : [...apps, appId];
}

function moveToFront(apps: AppId[], appId: AppId): AppId[] {
  return [...withoutApp(apps, appId), appId];
}

export function osReducer(state: OSState, action: OSAction): OSState {
  switch (action.type) {
    case 'OPEN_APP':
      return {
        ...state,
        openApps: appendUnique(state.openApps, action.appId),
        minimizedApps: withoutApp(state.minimizedApps, action.appId),
        zOrder: moveToFront(state.zOrder, action.appId),
        activeApp: action.appId,
      };

    case 'FOCUS_APP':
      if (!state.openApps.includes(action.appId)) {
        return state;
      }

      return {
        ...state,
        minimizedApps: withoutApp(state.minimizedApps, action.appId),
        zOrder: moveToFront(state.zOrder, action.appId),
        activeApp: action.appId,
      };

    case 'RESTORE_APP':
      if (!state.openApps.includes(action.appId)) {
        return osReducer(state, { type: 'OPEN_APP', appId: action.appId });
      }

      return {
        ...state,
        minimizedApps: withoutApp(state.minimizedApps, action.appId),
        zOrder: moveToFront(state.zOrder, action.appId),
        activeApp: action.appId,
      };

    case 'MINIMIZE_APP':
      if (!state.openApps.includes(action.appId)) {
        return state;
      }

      return {
        ...state,
        minimizedApps: appendUnique(state.minimizedApps, action.appId),
        activeApp: state.activeApp === action.appId ? null : state.activeApp,
      };

    case 'CLOSE_APP': {
      const openApps = withoutApp(state.openApps, action.appId);

      return {
        ...state,
        openApps,
        minimizedApps: withoutApp(state.minimizedApps, action.appId),
        zOrder: withoutApp(state.zOrder, action.appId),
        activeApp: state.activeApp === action.appId ? null : state.activeApp,
      };
    }

    case 'UPDATE_WINDOW_LAYOUT':
      return {
        ...state,
        windowLayouts: {
          ...state.windowLayouts,
          [action.appId]: action.layout,
        },
      };

    case 'TOGGLE_APP': {
      if (!state.openApps.includes(action.appId)) {
        return osReducer(state, { type: 'OPEN_APP', appId: action.appId });
      }

      if (state.activeApp === action.appId) {
        return osReducer(state, { type: 'MINIMIZE_APP', appId: action.appId });
      }

      return osReducer(state, { type: 'FOCUS_APP', appId: action.appId });
    }

    default:
      return state;
  }
}
