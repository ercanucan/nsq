var _ = require('underscore');
var $ = require('jquery');

var AppState = require('../app_state');
var BaseView = require('./base');

var Topic = require('../models/topic');
var Channel = require('../models/channel');

var LookupView = BaseView.extend({
    className: 'lookup container-fluid',

    template: require('./spinner.hbs'),

    events: {
        'click .hierarchy button': 'onCreateTopicChannel',
        'click .delete-topic-link': 'onDeleteTopic',
        'click .delete-channel-link': 'onDeleteChannel'
    },

    initialize: function() {
        BaseView.prototype.initialize.apply(this, arguments);
        $.ajax(AppState.url('/topics?inactive=true')).done(function(data) {
            this.template = require('./lookup.hbs');
            this.render({
                'topics': _.map(data['topics'], function(v, k) {
                    return {'name': k, 'channels': v};
                })
            });
        }.bind(this));
    },

    onCreateTopicChannel: function(e) {
        e.preventDefault();
        e.stopPropagation();
        var topic = $(e.target.form.elements['topic']).val();
        var channel = $(e.target.form.elements['channel']).val();
        if (topic === '' && channel === '') {
            return;
        }
        $.post(AppState.url('/topics'), JSON.stringify({
            'topic': topic,
            'channel': channel
        })).done(function() {
            window.location.reload(true);
        });
    },

    onDeleteTopic: function(e) {
        e.preventDefault();
        e.stopPropagation();
        var topic = new Topic({
            'name': $(e.target).data('topic')
        });
        topic.destroy({
            'dataType': 'text'
        }).done(function() {
            window.location.reload(true);
        });
    },

    onDeleteChannel: function(e) {
        e.preventDefault();
        e.stopPropagation();
        var channel = new Channel({
            'topic': $(e.target).data('topic'),
            'name': $(e.target).data('channel')
        });
        channel.destroy({
            'dataType': 'text'
        }).done(function() {
            window.location.reload(true);
        });
    }
});

module.exports = LookupView;
