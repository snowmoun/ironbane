angular
    .module('game.ui.inventoryBar', [
        'game.world-root'
    ])
    .directive('inventoryBar', [
        '$log',
        '$rootWorld',
        function($log, $rootWorld) {
            'use strict';

            var config = {
                restrict: 'E',
                templateUrl: 'client/game/ui/inventoryBar/inventoryBar.ng.html',
                scope: {
                    forEntity: '='
                },
                bindToController: true,
                controllerAs: 'inventoryBar',
                controller: ['$scope', '$element', function($scope, $element) {
                    var ctrl = this;
                    ctrl.slots = [];

                    var inventorySystem = $rootWorld.getSystem('inventory');

                    var changeHandler = function(entity) {
                        $log.debug('inventoryBar changeHandler: ', entity);
                        if (entity.id !== ctrl.forEntity.id) {
                            return;
                        }
                        var inventory = entity.getComponent('inventory'),
                            slots = Object.keys(inventory);

                        $log.debug('inventoryBar: ', slots, inventory);

                        ctrl.slots = _.map(slots, function(slot) {
                            var bg = ['0px', '0px'];
                            if (slot.search(/slot/) === 0) {
                                bg[0] = '0px';
                                bg[1] = '-32px';
                            }
                            if (slot.search(/relic/) === 0) {
                                bg[0] = '-32px';
                                bg[1] = '-96px';
                            }
                            if (slot.search(/hand/ig) >= 0) {
                                bg[0] = '-96px';
                                bg[1] = '-32px';
                            }
                            if (slot === 'head') {
                                bg[0] = '-64px';
                                bg[1] = '-32px';
                            }
                            if (slot === 'feet') {
                                bg[0] = '-32px';
                                bg[1] = '0px';
                            }
                            if (slot === 'body') {
                                bg[0] = '-64px';
                                bg[1] = '0px';
                            }

                            var images = [
                                'url(images/ui/inventory.png) ' + bg.join(' ') + ' no-repeat' // background LAST
                            ];

                            if (inventory[slot] !== null) {
                                // TODO: armor
                                images.unshift('url(images/items/' + inventory[slot].image + '.png) center no-repeat');
                            }

                            $log.debug('invbar: images: ', images);

                            return {
                                klass: slot,
                                css: {
                                    background: images.join(',')
                                }
                            };
                        });
                    };

                    inventorySystem.onEquipItem.add(changeHandler);
                    inventorySystem.onUnEquipItem.add(changeHandler);
                    inventorySystem.onItemAdded.add(changeHandler);
                    inventorySystem.onItemRemoved.add(changeHandler);

                    $scope.$watch(function() {
                        return ctrl.forEntity;
                    }, function(entity) {
                        if (!entity) {
                            return;
                        }
                        changeHandler(entity);
                    });
                }]
            };

            return config;
        }
    ]);
