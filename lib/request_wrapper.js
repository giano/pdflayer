'use strict';

const _ = require('lodash');
const Promise = require('any-promise');
const rp = require('request');
const PdfResponse = require('./pdf_response');

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
     *        apiKey:                                           // Your Api Key. Required
     *    };
     */
    constructor(options = {}) {
        this.config = _.pick(_.defaults({}, options, {
            apiUrl: 'http://api.pdflayer.com/api/convert',
            method: 'POST',
        }), 'apiUrl', 'method', 'apiKey');

        if (!this.config.apiKey) {
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
            let alreadyReturned = false;
            const requestOptions = {
                method: method,
                uri: uri,
                body: options,
                followAllRedirects: true,
                resolveWithFullResponse: true
            };
            const requestEl = rp(requestOptions, (error, response, body) => {
                if (alreadyReturned) {
                    return false;
                }
                if (error) {
                    return reject(error);
                }
                if (response) {
                    try {
                        if (response.headers['content-type'] === 'application/pdf') {
                            return resolve(new PdfResponse({
                                url: response.url,
                                options: options,
                                headers: response.headers,
                                content: requestEl,
                                wrapper: this
                            }));
                        } else if (_.startsWith(response.headers['content-type'], 'application/json')) {
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
                    return Promise.reject(new Error('Response empty'));
                }
            }).on('error', function(err) {
                alreadyReturned = true;
                return reject(error);
            });
        });
    }
};

module.exports = RequestWrapper;