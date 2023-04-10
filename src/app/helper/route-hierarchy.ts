interface RouteHierarchy {
  [path: string]: RouteHierarchy;
}

interface CachedRouteHierarchy {
  [path: string]: string;
}

const routeHierarchy: RouteHierarchy = {
  '': {
    'settings': {
      'settings/account': {
        'settings/account/export': {},
        'settings/account/sharing': {
          'settings/account/sharing/invite': {},
        },
      },
      'settings/general': {},
    },
    'children/select-child': {
      'children/add': {},
    },
    'auth/logout': {},
    'activities/feeding': {},
    'activities/summary': {},
  },
  'auth/register': {},
  'children/create-first': {},
  'unsupported-browser': {},
  'privacy': {},
};

let cachedRouteHierarchy: CachedRouteHierarchy | null = null;

function compileRouteHierarchy(hierarchy: RouteHierarchy, parent: string = ''): void {
  if (cachedRouteHierarchy === null) {
    cachedRouteHierarchy = {};
  }
  for (const routeName of Object.keys(hierarchy)) {
    const route = hierarchy[routeName];
    if (typeof cachedRouteHierarchy[routeName] !== 'undefined') {
      throw new Error(`Duplicate route in route hierarchy: '${routeName}'`);
    }
    cachedRouteHierarchy[routeName] = parent;
    compileRouteHierarchy(route, routeName);
  }
}

export function findRouteParent(route: string): string {
  if (route.startsWith('/')) {
    route = route.substring(1);
  }
  if (cachedRouteHierarchy === null) {
    compileRouteHierarchy(routeHierarchy);
  }
  const routes = <CachedRouteHierarchy>cachedRouteHierarchy;
  if (typeof routes[route] === 'undefined') {
    throw new Error(`Failed to find parent for route: '${route}'`);
  }

  return routes[route];
}
