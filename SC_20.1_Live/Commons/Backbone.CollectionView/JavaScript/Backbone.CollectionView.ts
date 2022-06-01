/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.CollectionView"/>
import * as _ from 'underscore';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import PluginContainer = require('../../PluginContainer/JavaScript/PluginContainer');

const classProperties = {
    postRowCompile: new PluginContainer()
};

const BackboneCollectionView = BackboneView.extend(
    {
        // @property {Class} childView the View class of this collection view children
        childView: BackboneView,

        template: null,

        // @property {Object} childViewOptions the options to be passed to children views
        childViewOptions: {},

        // @property {Number} viewsPerRow
        viewsPerRow: 3,

        // @property {Number} rowsCount Total number of rows used by the CSS framework
        rowsCount: 12,

        // @property {Function} childTemplate Template used to override the default child view template
        childTemplate: null,

        // @property {Function} cellTemplate Template used to create a cell
        cellTemplate: null,

        // @property {Function} rowTemplate Template used to create a row
        rowTemplate: null,

        // @property  {String} cellsContainerId Defines the data type values used to find the container element of the cells in a row
        cellsContainerId: 'backbone.collection.view.cells',

        // @property  {String} cellContainerId Defines the data type values used to find the container elements of the child view in a cell
        cellContainerId: 'backbone.collection.view.cell',

        // @property  {String} rowsContainerId Defines the data type values used to find the container elements of the rows in a template
        rowsContainerId: 'backbone.collection.view.rows',

        // @property {Object} allows the user to define a custom context.
        context: {},

        initialize: function(options: any) {
            this.childView = options.childView || this.childView;
            this.childViewOptions = options.childViewOptions || this.childViewOptions;
            this.viewsPerRow = options.viewsPerRow ? options.viewsPerRow : this.viewsPerRow;
            if (this.viewsPerRow < 1) {
                this.viewsPerRow = Infinity;
            }

            this.context = options.context || {};
            this.collection = options.collection;
            this.childTemplate = options.childTemplate || this.childTemplate;
            this.cellTemplate = options.cellTemplate || this.cellTemplate;
            this.rowTemplate = options.rowTemplate || this.rowTemplate;
            this.cellsContainerId = options.cellsContainerId || this.cellsContainerId;
            this.cellContainerId = options.cellContainerId || this.cellContainerId;
            this.template = options.template || this.template;

            this.childCells = [];
        },

        createChildElement: function() {
            const data = this.placeholderData || {};
            const tag_name = data.childTagName || 'div';
            const element = jQuery('<' + tag_name + '></' + tag_name + '>');

            if (data.childId) {
                element.attr('id', data.childId);
            }

            if (data.childClass) {
                element.addClass(data.childClass);
            }

            if (data.childDataAction) {
                element.attr('data-action', data.childDataAction);
            }

            if (data.childDataType) {
                element.attr('data-type', data.childDataType);
            }

            return element;
        },

        // @method generateRowContext Generates the context used by the row template. This method is aimed to be overrided @return {Backbone.CollectionView.RowContext}
        generateRowContext: function() {
            // @class Backbone.CollectionView.RowContext
            return {};
        },

        // @method generateCellContext Generates the context used by the cell template @return {Backbone.CollectionView.CellContext}
        generateCellContext: function(child_view_instance: any) {
            const child_view_instance_context = child_view_instance.getTemplateContext
                ? child_view_instance.getTemplateContext()
                : child_view_instance.getContext
                ? child_view_instance.getContext()
                : {};

            // @class Backbone.CollectionView.CellContext
            return _.extend(child_view_instance_context, {
                // @property {Number} spanSize
                spanSize: this.calculateSpanSize()
            });
        },

        calculateSpanSize: function() {
            return this.rowsCount / this.viewsPerRow;
        },

        // @method createCell Internal method for generate the render result of a child view wrapping it into a cell container.
        createCell: function(model: any, index: any) {
            const options = _.extend({}, this.childViewOptions, { model: model, index: index });
            const child_view_instance = new this.childView(options);

            this.childCells.push(child_view_instance);

            if (
                !(
                    child_view_instance.attributes &&
                    child_view_instance.attributes['data-root-component-id']
                )
            ) {
                child_view_instance.attributes = child_view_instance.attributes || {};
                child_view_instance.attributes['data-root-component-id'] =
                    (this.attributes && this.attributes['data-root-component-id']) || '';
            }

            child_view_instance.parentView = child_view_instance.parentView || this;
            child_view_instance.hasParent = true;

            child_view_instance.setElement(this.createChildElement());

            child_view_instance.render();

            if (child_view_instance.$el.children().length === 1) {
                child_view_instance.setElement(child_view_instance.$el.children()[0]);
            }

            if (this.cellTemplate) {
                let $cell = jQuery(
                    this.cellTemplate(this.generateCellContext(child_view_instance))
                );
                const $placeholder = $cell.find('[data-type="' + this.cellContainerId + '"]');

                if ($placeholder.length) {
                    $placeholder.replaceWith(child_view_instance.$el);
                } else {
                    $cell = jQuery('<div></div>');
                    $cell.append(child_view_instance.$el);
                }

                return $cell;
            }
            return child_view_instance.$el;
        },

        // @method appendCellsToRow Add an array of jQuery cells into an jQuery row @param {Array<jQuery>} cells
        appendCellsToRow: function(cells: any) {
            const $cells = jQuery(
                _(cells).map(function(element: any) {
                    return element.get(0);
                })
            );

            if (this.rowTemplate) {
                const tmpl_str = this.rowTemplate(this.generateRowContext());
                BackboneCollectionView.postRowCompile.executeAll(tmpl_str, this);
                let $row = jQuery(tmpl_str);

                const $placeholder = $row.find('[data-type="' + this.cellsContainerId + '"]');

                if ($placeholder.length) {
                    $placeholder.replaceWith($cells);
                } else {
                    $row = jQuery('<div></div>');
                    $row.append($cells);
                }

                return $row;
            }
            return $cells;
        },

        // @method render Override default render to give support to iteration and multiple items per row
        render: function() {
            this.collection =
                this.collection instanceof Backbone.Collection
                    ? this.collection
                    : new Backbone.Collection(this.collection);

            // Empty the div before starting the render
            this.$el.empty();
            if (this.template) {
                this._render();
            }

            const self = this;
            const rows = [];
            let cells_in_row = [];

            if (self.childTemplate) {
                self.childView.prototype.template = self.childTemplate;
            }

            this.viewsPerRow =
                (this.placeholderData && this.placeholderData.viewsPerRow) || this.viewsPerRow;

            // @property {Array<Object>} collection this kind of view should be always have a collection property which is what is rendered.
            this.collection.each(function(model: any, index: any) {
                const cell = self.createCell(model, index);

                if (self.rowTemplate) {
                    cells_in_row.push(cell);

                    if (
                        self.viewsPerRow === 1 ||
                        (index + 1) % self.viewsPerRow === 0 ||
                        index + 1 === self.collection.length
                    ) {
                        rows.push(self.appendCellsToRow(cells_in_row));
                        cells_in_row = [];
                    }
                } else {
                    rows.push(cell);
                }
            });

            const $content = jQuery(
                _(rows).map(function(element: any) {
                    return element.get(0);
                })
            );

            if (this.template) {
                this.$('[data-type="' + this.rowsContainerId + '"]').replaceWith($content);
            } else {
                this.$el.append($content);
            }
        },

        destroy: function() {
            _.each(this.childCells, function(child: any) {
                child && child.destroy();
            });

            BackboneView.prototype.destroy.apply(this, Array.prototype.slice.call(arguments));
        },

        getContext: function() {
            const context = {
                collection: this.collection,
                showCells: !!this.collection.length
            };

            return _.extend(context, this.context);
        }
    },
    classProperties
);

export = BackboneCollectionView;
