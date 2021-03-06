var $ = require('jquery');

window.jQuery = $;
var bootstrap = require('bootstrap'); //eslint-disable-line no-unused-vars
var bootbox = require('bootbox');

var Pubsub = require('../lib/pubsub');
var Router = require('../router');

var BaseView = require('./base');
var HeaderView = require('./header');
var TopicsView = require('./topics');
var TopicView = require('./topic');
var ChannelView = require('./channel');
var LookupView = require('./lookup');
var NodesView = require('./nodes');
var NodeView = require('./node');
var CounterView = require('./counter');

var Node = require('../models/node');
var Topic = require('../models/topic');
var Channel = require('../models/channel');

var AppView = BaseView.extend({
    // not a fan of setting a view's el to an existing element on the page
    // for the top-level AppView, it seems appropriate, however
    el: '#container',

    events: {
        'click .link': 'onLinkClick',
        'click .tombstone-link': 'onTombstoneClick'
    },

    initialize: function() {
        BaseView.prototype.initialize.apply(this, arguments);

        this.listenTo(Pubsub, 'topics:show', this.showTopics);
        this.listenTo(Pubsub, 'topic:show', this.showTopic);
        this.listenTo(Pubsub, 'channel:show', this.showChannel);
        this.listenTo(Pubsub, 'lookup:show', this.showLookup);
        this.listenTo(Pubsub, 'nodes:show', this.showNodes);
        this.listenTo(Pubsub, 'node:show', this.showNode);
        this.listenTo(Pubsub, 'counter:show', this.showCounter);

        this.listenTo(Pubsub, 'view:ready', function() {
            $('.rate').each(function() {
                $.get(AppState.url('/graphite'), {
                    'metric': 'rate',
                    'target': $(this).attr('target')
                }).done(function(data) {
                    $(this).html(data['rate']);
                }.bind(this));
            });
        });

        this.render();
    },

    postRender: function() {
        this.appendSubview(new HeaderView());
    },

    showView: function(f) {
        window.scrollTo(0, 0);
        if (this.currentView) {
            this.currentView.remove();
        }
        this.currentView = f();
        this.appendSubview(this.currentView);
    },

    showTopics: function() {
        this.showView(function() {
            return new TopicsView();
        });
    },

    showTopic: function(topic) {
        this.showView(function() {
            var model = new Topic({'name': topic});
            return new TopicView({'model': model});
        });
    },

    showChannel: function(topic, channel) {
        this.showView(function() {
            var model = new Channel({'topic': topic, 'name': channel});
            return new ChannelView({'model': model});
        });
    },

    showLookup: function() {
        this.showView(function() {
            return new LookupView();
        });
    },

    showNodes: function() {
        this.showView(function() {
            return new NodesView();
        });
    },

    showNode: function(node) {
        this.showView(function() {
            var model = new Node({'name': node});
            return new NodeView({'model': model});
        });
    },

    showCounter: function() {
        this.showView(function() {
            return new CounterView();
        });
    },

    onLinkClick: function(e) {
        e.preventDefault();
        e.stopPropagation();
        Router.navigate($(e.currentTarget).attr('href'), {'trigger': true});
    },

    onTombstoneClick: function(e) {
        e.preventDefault();
        e.stopPropagation();
        var nodeName = $(e.target).data('node');
        var topicName = $(e.target).data('topic');
        var txt = 'Are you sure you want to <strong>tombstone</strong> <em>' + nodeName + '</em>?';
        bootbox.confirm(txt, function(result) {
            if (result !== true) {
                return;
            }
            var node = new Node({
                'name': nodeName
            });
            node.tombstoneTopic(topicName).done(function() {
                window.location.reload(true);
            });
        });
    }
});

module.exports = AppView;
