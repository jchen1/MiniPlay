angular.module('app', ['ui.router']);

angular.module('app').config(($compileProvider, $stateProvider) => {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
  const states = {
    playing: {
      templateUrl: 'templates/playing.html',
      controller: 'PlayingController'
    },
    // tabbed: {
    //   templateUrl: 'templates/tabbed.html',
    //   controller: 'TabbedController'
    // },
    // 'tabbed.list': {
    //   templateUrl: 'templates/tabbed-list.html',
    //   controller: 'TabbedListController'
    // },
    // 'tabbed.grid': {
    //   templateUrl: 'templates/tabbed-grid.html',
    //   controller: 'TabbedGridController'
    // }

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
