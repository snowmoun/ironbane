angular
    .module('game.ai.states.local')
    .factory('SeekEntity', function(Class, THREE, IbUtils, Patrol, BaseState, $rootWorld, Debugger) {
            'use strict';

            return BaseState.extend({
                init: function(entity, config, world) {
                    this._super.apply(this, arguments);

                    this.findPathTimeoutTimer = 0.0;
                },
                findPathToEntity: function (targetEntity) {
                    var me = this;

                    this.calculatedPath = Patrol.findPath(this.entity.position.clone(),
                        targetEntity.position.clone(), this.entity.level)
                        .then(function (path) {
                            me.calculatedPath = path;
                            //Debugger.drawPath(me.entity.uuid + 'seekEntity', me.calculatedPath);
                        });

                },
                update: function(dTime) {
                    this._super.apply(this, arguments);

                    if (!this.targetEntity) {
                        this.targetEntity = this.world.scene.getObjectByProperty('uuid', this.targetEntityUuid);;
                        return;
                    }

                    this.findPathTimeoutTimer -= dTime;
                    if (this.findPathTimeoutTimer <= 0) {
                        this.findPathToEntity(this.targetEntity);

                        this.findPathTimeoutTimer = 1.0;
                    }

                    if (this.calculatedPath && this.calculatedPath.length > 1) {
                        if (this.calculatedPath[0].distanceToSquared(this.entity.position) > 1 * 1) {
                            this.steeringBehaviour.seek(this.calculatedPath[0]);
                        }
                        else {
                            // Remove node from the path we calculated
                            this.calculatedPath.shift();
                        }
                    }
                    else if (this.entity.position.distanceToSquared(this.targetEntity.position) > 1.2 * 1.2) {
                        this.steeringBehaviour.arrive(this.targetEntity.position);
                    }
                    else {
                        // Stop!
                        this.steeringBehaviour.brake(1.0);
                    }
                },
                destroy: function() {
                    Debugger.clearPath(this.entity.uuid + 'seekEntity');
                },
                handleMessage: function(message, data) {

                }
            });
        }
    )