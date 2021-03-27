'use strict';module.exports = function($sce) {    var escapeHtmlText = function (text) {        if (text) {            text = text.replace(/</g, "&lt;");            text = text.replace(/>/g, "&gt;");        }        return text;    };    /**     * Escapes all RegEx special characters, so that those special characters can be in the search string.     * For example, '.' in the search string should search for '.', and not 'any single character'.     */    var regExpQuote = function (str) {        return str.replace(/[.?*+^$|\[\]\/\\(){}]/g, "\\$&");    };    this.highlightSearchedText = function (searchText, text) {        if (searchText) {            var searchText = escapeHtmlText(searchText);            text = escapeHtmlText(text);            var pattern = new RegExp(regExpQuote(searchText), "gi");            return $sce.trustAsHtml(text.replace(pattern, '<span class="highlighted">$&</span>'));        } else {            return $sce.trustAsHtml(escapeHtmlText(text));        }    };};