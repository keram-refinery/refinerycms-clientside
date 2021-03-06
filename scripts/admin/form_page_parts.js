/*global $, refinery */

(function (refinery) {

    'use strict';

    /**
     * @constructor
     * @extends {refinery.Object}
     * @param {Object=} options
     */
    refinery.Object.create({

        name: 'FormPageParts',

        module: 'admin',

        /**
         * Create list of page parts for dialog
         *
         * @return {string} dialog content
         */
        get_dialog_content: function (data) {
            var part,
                list = '<ul class="records">';

            for (var i = 0, l = data.length; i < l; i++) {
                part = /** @type {page_part} */(data[i]);
                list += '<li data-part="' + part.name + '" ' +
                            'class="clearfix" >' +
                            '<label class="stripped">' +
                            '<input type="checkbox"' + (part.active ? ' checked="1"' : '') + '> ' +
                             part.title +
                            '</label>' +
                            ' <span class="actions"><span class="icon-small move-icon">' +
                            t('refinery.admin.button_move') + '</span></span>' +
                            '</li>';

            }

            list += '</ul>';

            return list;
        },

        /**
         * Initialize page part dialog and bind events
         *
         * @return {undefined}
         */
        init_configuration_dialog: function () {
            var that = this,
                holder = that.holder,
                nav = holder.find('> .ui-tabs-nav'),
                parts_tabs = nav.find('li'),
                dialog_holder = $('<div/>'),
                dialog_buttons;

            dialog_holder.html(
                that.get_dialog_content(
                    holder.find('#page_parts-options').data('page-parts')
                )
            );

            function update_parts () {
                var list = [], i;

                dialog_holder.find('li').each(function (index) {
                    var li = $(this),
                        part = /** @type string */(li.data('part')),
                        active = li.find('input').is(':checked'),
                        tab = nav.find('li a[href="#page_part_' + part + '"]').parent().detach(),
                        panel = $('#page_part_' + part);

                    if (active) {
                        tab.removeClass('js-hide');
                        panel.removeClass('js-hide');
                    } else {
                        tab.removeClass('ui-tabs-active ui-state-active');
                        tab.addClass('js-hide');
                        panel.addClass('js-hide');
                    }

                    panel.find('input.part-active').prop('checked', active);
                    panel.find('input.part-position').val(index + '');

                    if (tab.length) {
                        list[list.length] = tab;
                    }
                });

                /**
                 * Reordering tabs by parts position
                 *
                 */
                for (i = list.length; i >= 0; i--) {
                    nav.prepend(list[i]);
                }

                /**
                 * Ensure that if we hide current active tab,
                 * will be activated other, first visible tab.
                 */
                if (nav.find('.ui-tabs-active').length === 0) {
                    holder.tabs({
                        'active': /** @type {number} */(parts_tabs.index(nav.find('li:visible').first()))
                    });
                }
            }

            dialog_buttons = [{
                'text': t('refinery.admin.button_done'),
                'class': 'submit-button',
                'click': function () {
                    update_parts();
                    dialog_holder.dialog('close');
                }
            }];

            dialog_holder.dialog({
                'title': t('refinery.admin.form_page_parts_manage'),
                'modal': true,
                'resizable': true,
                'autoOpen': false,
                'width': 400,
                'buttons': dialog_buttons
            });

            holder.on('click', '#page_parts-options', function (e) {
                e.preventDefault();
                dialog_holder.dialog('open');
            });

            that.on('destroy', function () {
                dialog_holder.dialog('destroy');
                dialog_holder.off();
            });
        },

        /**
         * initialisation
         *
         * @param {!jQuery} holder
         *
         * @return {Object} self
         */
        init: function (holder) {
            if (this.is('initialisable')) {
                this.is('initialising', true);
                this.holder = holder;
                this.init_configuration_dialog();
                this.is({'initialised': true, 'initialising': false});
                this.trigger('init');
            }

            return this;
        }
    });

    /**
     * Form initialization
     *
     * @expose
     * @param  {jQuery} holder
     * @param  {refinery.UserInterface} ui
     * @return {undefined}
     */
    refinery.admin.ui.formPageParts = function (holder, ui) {
        holder.find('#page_parts').each(function () {
            ui.addObject( refinery('admin.FormPageParts').init($(this)) );
        });
    };

}(refinery));
