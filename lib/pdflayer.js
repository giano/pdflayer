'use strict';

const _ = require('lodash');
const Promise = require('any-promise');
const RequestWrapper = require('./request_wrapper');
const validUrl = require('valid-url');

/**
 * A 'sane' default
 */
const DEFAULT_REQUEST_CONFIG = {
    accept_lang: 'en-US',
    test: false,
    text_encoding: 'utf-8',
    test: 0,
};

/**
 * Mirrors the specs of https://api.pdflayer.com/api/convert page
 */

const DEFAULT_REQUEST_KEYS = [
    'document_url', // The document url,
    'document_html', // The document raw html,
    'document_name', // specify a PDF name of up to 180 characters.
    'custom_unit', // set to px (Pixels), pt (Points), in (Inches) or mm (Millimeters)
    'user_agent', // set to your preferred User-Agent header string
    'accept_lang', // set to your preferred Accept-Language header string
    'text_encoding', // set to your preferred text encoding string
    'ttl', // the time (in seconds) a generated PDF is cached
    'force', // set to 1 to force new PDF
    'inline', // set to 1 to display PDF document inline
    'auth_user', // specify username used to access password-protected site
    'auth_pass', // specify password used to access password-protected site
    'encryption', // set to 40 (40-bit) or 128 (128-bit)
    'owner_password', // specify owner password to password protect PDF
    'user_password', // specify user password to password protect PDF
    'no_images', // Set to 1 in order to disable images
    'no_hyperlinks', // Set to 1 in order to disable hyperlinks
    'no_backgrounds', // Set to 1 in order to disable CSS backgrounds
    'no_javascript', // Set to 1 in order to disable JavaScript
    'use_print_media', // Set to 1 in order to activate CSS @media print declarations
    'grayscale', // Set to 1 in order to remove all colours
    'low_quality', // Set to 1 in order to generate low quality PDF
    'forms', // Set to 1 in order to enable forms on your PDF
    'page_width', // Page Width
    'page_height', // Page Height
    'page_size', // Page Size: See https://pdflayer.com/documentation#page_size for a list. Default is A4
    'no_print', // Set to 1 in order to disable printing of the final PDF document
    'no_modify', // Set to 1 in order to disable modification of the final PDF document
    'no_copy', // Set to 1 in order to disable the possibility to copy any text of the final PDF document
    'orientation', // portrait or landscape. Default is portrait
    'margin_top', // Margin top in document units. Default is 10 mm
    'margin_bottom', // Margin bottom in document units. Default is 10 mm
    'margin_left', // Margin left in document units. Default is 10 mm
    'margin_right', // Margin right in document units. Default is 10 mm
    'header_text', // Document Header Text. See https://pdflayer.com/documentation#page_numbering for consuming page numbers and other variables in header
    'header_align', // Header alignment (center, left, right). Defaults to center
    'header_url', // Header url
    'header_html', // Header raw html
    'header_spacing', // Header extra spacing in document units. Default is 0
    'footer_text', // Document Footer Text. See https://pdflayer.com/documentation#page_numbering for consuming page numbers and other variables in footer
    'footer_align', // Footer alignment (center, left, right). Defaults to center
    'footer_url', // Footer url
    'footer_html', // Footer raw html
    'footer_spacing', // Footer extra spacing in document units. Default is 0
    'viewport', // Browser viewport in pixels, format: width x height
    'css_url', // Css url to be loaded and injected in the document
    'delay', // Delay in milliseconds before generating PDF. Allows some elements to be animated and javascript to be executed before the snapshot
    'dpi', // Dots Per Inch. Default is 96
    'zoom', // Html whole zoom factor. Default is 1
    'page_numbering_offset', // Page numbering offset. Default is 0
    'watermark_url', // Watermark url to a png (recommended) or jpg
    'watermark_opacity', // Main opacity of watermark
    'watermark_offset_x', // X Offset of the watermark from top left of page in document units
    'watermark_offset_y', // Y Offset of the watermark from top left of page in document units
    'watermark_in_background', // Set to 1 and watermark images will be placed in the PDF document's background.
    'title', // Pdf document title
    'subject', // Pdf document subject
    'creator', // Pdf document creator
    'author', // Pdf document author
    'test', // Set to 1 or true if you want to receive a sample pdf (a pdf with "sample" printed on). Does not count on month's pdf limit
    'secret_key' // The secret key if you decide to go with url encription. See https://pdflayer.com/documentation#url_encryption for more infos.
];

function getConfigKeys(options = {}) {
    let params = _.pick(options, DEFAULT_REQUEST_KEYS);
    return _.omitBy(_.mapValues(params, function(value, key, object) {
        return _.isBoolean(value) ? (value ? 1 : 0) : value;
    }), _.isNil);
}

/**
 * The main Library class
 * 
 * 
 * @class Pdflayer
 */
class Pdflayer {

    /**
     * Creates an instance of Pdflayer.
     * @param {Object} [options={}] 
     * @memberof Pdflayer
     * 
     *    options = {
     *        apiUrl: 'http://api.pdflayer.com/api/convert'     // PdfLayer base api url. Defaults to http://api.pdflayer.com/api/convert
     *        method: 'POST '                                   // Base method for requests. Defaults to POST
     *        apiKey:                                           // Your Api Key. Required
     *        test:   false                                     // Set to true (even on single requests) to create a watermarked pdf without hitting your request limits. 
     *    };
     */
    constructor(options = {}) {

        this.config = _.pick(_.defaults({}, options, {
            apiUrl: 'http://api.pdflayer.com/api/convert',
            method: 'POST'
        }), 'apiUrl', 'method', 'apiKey');
        this.defaultRequestConfig = getConfigKeys(_.defaults({}, options, DEFAULT_REQUEST_CONFIG));
        this.wrapper = new RequestWrapper(config);
    }

    /**
     * Request a pdf and return a promise.
     * @param {string} htmlOrUrl                            // The url to document or the raw html to be converted
     * @param {Object} [options={}]                         // Options for this request
     * @memberof Pdflayer
     * @return {Promise}  Returns a promise that resolve to a PdfResponse instance.
     * 
     */
    generate(htmlOrUrl = '', options = {}) {
        return new Promise((resolve, reject) => {
            htmlOrUrl = _.trim(htmlOrUrl);
            if (htmlOrUrl && validUrl.isUri(htmlOrUrl)) {
                options = getConfigKeys(_.defaults({
                    document_url: htmlOrUrl
                }, options, this.defaultRequestConfig));
            } else if (htmlOrUrl && htmlOrUrl.length) {
                options = getConfigKeys(_.defaults({
                    document_html: htmlOrUrl
                }, options, this.defaultRequestConfig));
            } else {
                return reject(new Error('You should pass an URL to the document or valid HTML'));
            }
            this.wrapper.request(options).then(response).catch(reject);
        });
    }
};

module.exports = Pdflayer;