'use strict';

const _ = require('lodash');
const Promise = require('any-promise');
const uuidv1 = require('uuid/v1');

/**
 * The API Response wrapper
 * 
 * @class PdfResponse
 */

class PdfResponse {

    /**
     * Creates an instance of PdfResponse.
     * @param {object} [values={}] 
     * @memberof PdfResponse
     * 
     * values = {
     *        url:          // The request url
     *        options:      // The request options
     *        method:       // The response headers
     *        wrapper:      // The RequestWrapper instance originating this object
     *        content:      // The pdf document stream (request stream)
     *    };
     */

    constructor(values = {}) {
        this._options = values.options;
        this._headers = values.headers;
        this._content = values.content;
        this._wrapper = values.wrapper;
        this._uuid = uuidv1();
        this._defaultFilename = this._uuid + '.pdf';
    }

    /**
     * Returns the pdf stream
     * 
     * @readonly
     * @memberof PdfResponse
     */

    get stream() {
        return this._content;
    }

    /**
     * Returns the filename
     * 
     * @readonly
     * @memberof PdfResponse
     */

    get fileName() {
        return (this._headers['content-disposition'] || this._defaultFilename).split('filename=').pop() || this._defaultFilename;
    }

    /**
     * Returns the pdf content length in bytes
     * 
     * @readonly
     * @memberof PdfResponse
     */

    get size() {
        return (this._headers['content-length'] || 0) * 1;
    }

    /**
     * Returns the response headers
     * 
     * @readonly
     * @memberof PdfResponse
     */

    get headers() {
        return this._headers;
    }

    /**
     * Require a new Pdf using the same options and wrapper. returns a new instance of PdfResponse;
     * 
     * @returns {PdfResponse} the new instance of PdfResponse
     * @memberof PdfResponse
     */

    refresh() {
        return this._wrapper.request(this._options);
    }
};

module.exports = PdfResponse;