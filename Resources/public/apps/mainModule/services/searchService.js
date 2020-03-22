/**
 * @file
 * Handle search requests for search node.
 */

angular.module('mainModule').service('searchService', ['$q', '$http', 'busService',
  function ($q, $http, busService) {
    'use strict';

    var socket = null;

    function getAuth(reauth) {
      var deferred = $q.defer();

      var url = 'api/auth/search' + (reauth ? '/reauth' : '');

      $http.get(url)
        .success(function (data) {
          deferred.resolve(data.token);
        })
        .error(function (data, status) {
          deferred.reject(status);
        });

      return deferred.promise;
    }

    /**
     * Connect to the web-socket.
     *
     * @param token
     *   The connection token.
     */
    function getSocket(token) {
      var deferred = $q.defer();

      // Get connected to the server.
      socket = io.connect(window.config.search.address, {
        'query': 'token=' + token,
        'force new connection': true,
        'max reconnection attempts': Infinity
      });

      // Handle error events.
      socket.on('error', function (reason) {
        if (reason === 'Not authorized') {
          getAuth(true).then(
            function success(token) {
              getSocket(token).then(
                function success(socket) {
                  deferred.resolve(socket);
                },
                function error(reason) {
                  busService.$emit('log.error', {
                    'cause': reason,
                    'msg': 'Search socket error.'
                  });
                  deferred.reject(reason);
                }
              );
            },
            function error(reason) {
              busService.$emit('log.error', {
                'cause': reason,
                'msg': 'Search socket error.'
              });
              deferred.reject(reason);
            }
          );
        } else {
          busService.$emit('log.error', {
            'cause': reason,
            'msg': 'Search socket error.'
          });
          deferred.reject(reason);
        }
      });

      socket.on('connect', function () {
        deferred.resolve(socket);
      });

      // Handle disconnect event (fires when disconnected or connection fails).
      socket.on('disconnect', function (reason) {
        // @todo: re-connection is automatically handled by socket.io library,
        // but we might need to stop sending request until reconnection or the
        // request will be queued and send all at once... which could give some
        // strange side effects in the application if not handled.
      });

      return deferred.promise;
    }

    /**
     * Create the connection to the server.
     *
     * @return {promise}
     *   An promise is return that will be resolved on connection.
     */
    function connect() {
      // Try to connect to the server if not already connected.
      var deferred = $q.defer();

      if (socket === null) {
        getAuth().then(
          function success(token) {
            getSocket(token).then(
              function success(socket) {
                deferred.resolve(socket);
              },
              function error() {
                deferred.reject('Error connecting to search service.');
              }
            );
          },
          function error() {
            getAuth(true).then(
              function success(token) {
                getSocket(token).then(
                  function success(socket) {
                    deferred.resolve(socket);
                  },
                  function error() {
                    deferred.reject('Error connecting to search service.');
                  }
                );
              },
              function error() {
                deferred.reject('Error re-authenticating to search service.');
              }
            );
          }
        );
      }
      else {
        deferred.resolve(socket);
      }

      return deferred.promise;
    }

    /**
     * Send search request to the engine.
     *
     * @TODO: Defined the search object in this comment.
     *
     * @param search
     *   This is a json object describing the search.
     *
     * @returns {promise}
     *   When data is received from the backend. If no data found an empty JSON
     *   object is returned.
     */
    busService.$on('searchService.request', function (event, message) {
      // Build default match all search query.
      var query = {
        "index": window.config.search.index,
        "type": message.type,
        "query": {
          "match_all": {}
        }
      };

      // Text given build field search query.
      // The analyser ensures that we match the who text string sent not part
      // of.
      if (message.text !== undefined && message.text !== '') {
        query.query = {
          "multi_match": {
            "query": message.text,
            "type": "best_fields",
            "operator": "or",
            "fields": message.fields,
            "analyzer": 'string_search'
          }
        };
      }

      // Add sort
      query.sort = message.sort;

      // Add filter.
      if (message.filter !== undefined) {
        query.query = {
          "filtered": {
            "query": query.query,
            "filter": message.filter
          }
        };
      }

      // Add pager to the query.
      if (message.hasOwnProperty('pager')) {
        query.size = message.pager.size;
        query.from = message.pager.page * message.pager.size;
      }

      // Use an MD5 hash to make a unique callback/message in the socket
      // connection. This is needed to ensure that more that one search query
      // can be fired into the connection a the right response ends up with
      // the component that send the request.
      query.uuid = CryptoJS.MD5(JSON.stringify(query)).toString();
      query.callbacks = {
        'hits': 'hits-' + query.uuid,
        'error': 'error-' + query.uuid
      };

      connect().then(
        function success(socket) {
          socket.once(query.callbacks.hits, function (hits) {
            busService.$emit(message.callbacks.hits, hits);
          });

          // Catch search errors.
          socket.once(query.callbacks.error, function (error) {
            busService.$emit('log.error', {
              'cause': error.message,
              'msg': 'Search error.'
            });

            busService.$emit(message.callbacks.error, error.message);
          });

          socket.emit('search', query);
        },
        function error() {
          busService.$emit('log.error', {
            'cause': error.message,
            'msg': 'Search error.'
          });
        }
      );
    });
  }
]);
