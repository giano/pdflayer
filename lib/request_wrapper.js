'use strict';

const _ = require('lodash');
const Promise = require('any-promise');
const rp = require('request');
const PdfResponse = require('./pdf_response');
const stream = require("stream");

const POST_PARAMS = [
    'header_html',
    'footer_html',
    'document_html',
]

/**
 * A wrapper to the request library.
 * 
 * @class RequestWrapper
 */

class RequestWrapper {
    /**
     * Creates an instance of RequestWrapper.
     * @param {Object} [options={}] 
     * @memberof RequestWrapper
     *    options = {
     *        apiUrl: 'http://api.pdflayer.com/api/convert'     // PdfLayer base api url. Defaults to http://api.pdflayer.com/api/convert
     *        method: 'POST '                                   // Base method for requests. Defaults to POST
     *        access_key:                                           // Your Api Key. Required
     *    };
     */
    constructor(options = {}) {
        this.config = _.pick(_.defaults({}, options, {
            apiUrl: 'http://api.pdflayer.com/api/convert',
            method: 'POST',
        }), 'apiUrl', 'method', 'access_key');

        if (!this.config.access_key) {
            throw (new Error('Api Key was not specified'));
        }
    }

    /**
     * Request a Pdf from pdflayer
     * 
     * @param {object} [options={}] 
     * @returns 
     * @memberof RequestWrapper
     * @return {Promise}  Returns a promise that resolve to a PdfResponse instance.
     */

    request(options = {}) {
        return new Promise((resolve, reject) => {
            reject = _.once(reject);
            resolve = _.once(resolve);
            options = _.defaults(options, this.config);
            const uri = options.apiUrl;
            const method = options.method;
            delete options.apiUrl;
            delete options.method;

            const requestOptions = {
                method: method,
                uri: uri,
                body: options,
                followAllRedirects: true
            };

            requestOptions.qs = _.omit(options, POST_PARAMS);

            if (requestOptions.method.toUpperCase() == 'POST') {
                requestOptions.form = _.pick(options, POST_PARAMS);
            }

            const passThroughStream = new stream.PassThrough();

            let manageResponse = _.once((error, response, body) => {
                if (error) return reject(error);
                if (response) {
                    try {
                        if (response.headers['content-type'] === 'application/pdf') {
                            return resolve(new PdfResponse({
                                url: response.request.href,
                                options: options,
                                headers: response.headers,
                                content: passThroughStream,
                                wrapper: this
                            }));
                        } else if (_.startsWith(response.headers['content-type'], 'application/json') && body) {
                            let parsedResponse = JSON.parse(body);
                            if (!parsedResponse.success && parsedResponse.error) {
                                const outError = new Error(parsedResponse.error.info);
                                outError.name = parsedResponse.error.type;
                                outError.number = parsedResponse.error.code;
                                return reject(outError);
                            } else {
                                return reject(new Error('Response malformed. Not a PDF?'));
                            }
                        }
                    } catch (error) {
                        return reject(error);
                    }
                } else {
                    return reject(new Error('Response empty'));
                }
            });

            const requestEl = rp(requestOptions, manageResponse).on('error', (err) => {
                return manageResponse(err);
            }).on('response', (response) => {
                return manageResponse(null, response);
            }).pipe(passThroughStream);
        });
    }
};

module.exports = RequestWrapper;