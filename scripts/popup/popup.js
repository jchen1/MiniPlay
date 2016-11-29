angular.module('app', ['ui.router', 'ngMaterial']);

angular.module('app').config(($compileProvider, $stateProvider, $provide) => {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
  const states = {
    playing: {
      templateUrl: 'templates/playing.html',
      controller: 'PlayingController'
    },
    tabbed: {
      templateUrl: 'templates/tabbed.html',
      controller: 'TabbedController',
      resolve: {
        data: $stateParams => $stateParams.promise
      },
      params: { promise: null },
    },
    'tabbed.grid': {
      views: {
        tab: {
          templateUrl: 'templates/tabbed-grid.html',
          controller: 'TabbedGridController',
        }
      },
      params: { tabIndex: null },
      resolve: {
        tabIndex: $stateParams => $stateParams.tabIndex
      },
    },
    'tabbed.list': {
      views: {
        tab: {
          templateUrl: 'templates/tabbed-list.html',
          controller: 'TabbedListController',
        }
      },
      params: { tabIndex: null },
      resolve: {
        tabIndex: $stateParams => $stateParams.tabIndex
      },
    },
    loading: {
      templateUrl: 'templates/loading.html'
    }

  };

  _.each(states, (state, name) => $stateProvider.state(name, state));
});

// allow HTML to access enums
angular.module('app').run($rootScope => {
  $rootScope.StateEnum = StateEnum;
  $rootScope.RepeatEnum = RepeatEnum;
  $rootScope.ThumbEnum = ThumbEnum;
  $rootScope.StatusEnum = StatusEnum;
});

// list view
// grid view

/*
 * nowPlaying
 * tabbed
 *  tabbed.list
 *  tabbed.grid
 *  tabbed.settings
 */
