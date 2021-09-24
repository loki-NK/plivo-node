import * as _ from "lodash";

import {
    PlivoResource,
    PlivoResourceInterface
} from '../base';
import {
    extend,
    validate
} from '../utils/common.js';

const action = 'Message/';
const idField = 'messageUuid';
let actionKey = Symbol('api action');
let klassKey = Symbol('constructor');
let idKey = Symbol('id filed');
let clientKey = Symbol('make api call');

export class MessageResponse {
    constructor(params) {
        params = params || {};
        this.apiId = params.apiId;
        this.message = params.message;
        this.messageUuid = params.messageUuid;
        if params.invalid_number!= [] {
          this.invalidNumber = params.invalid_number
        }
    }
}

export class MessageGetResponse {
    constructor(params) {
        params = params || {};
        this.apiId = params.apiId;
        this.errorCode = params.errorCode;
        this.fromNumber = params.fromNumber;
        this.messageDirection = params.messageDirection;
        this.messageState = params.messageState;
        this.messageTime = params.messageTime;
        this.messageType = params.messageType;
        this.messageUuid = params.messageUuid;
        this.resourceUri = params.resourceUri;
        this.toNumber = params.toNumber;
        this.totalAmount = params.totalAmount;
        this.totalRate = params.totalRate;
        this.units = params.units;
        this.powerpackID = params.powerpackId
    }
}

export class MessageListResponse {
    constructor(params) {
        params = params || {};
        this.errorCode = params.errorCode;
        this.fromNumber = params.fromNumber;
        this.messageDirection = params.messageDirection;
        this.messageState = params.messageState;
        this.messageTime = params.messageTime;
        this.messageType = params.messageType;
        this.messageUuid = params.messageUuid;
        this.resourceUri = params.resourceUri;
        this.toNumber = params.toNumber;
        this.totalAmount = params.totalAmount;
        this.totalRate = params.totalRate;
        this.units = params.units;
        this.powerpackID = params.powerpackId;
    }
}

export class MMSMediaResponse {

    constructor(params) {
        params = params || {};
        this.apiId = params.apiId;
        let MMSMediaList = []
        params.objects.forEach(item => {
            MMSMediaList.push(new MMSMedia(item));
        });
        this.objects = MMSMediaList;
    }
}

export class MMSMedia {
    constructor(params) {
        params = params || {};
        this.contentType = params.contentType;
        this.fileName = params.fileName;
        this.mediaId = params.mediaId;
        this.mediaUrl = params.mediaUrl;
        this.messageUuid = params.messageUuid;
        this.size = params.size;
        this.uploadTime = params.uploadTime;
    }
}

/**
 * Represents a Message
 * @constructor
 * @param {function} client - make api call
 * @param {object} [data] - data of call
 */
export class Message extends PlivoResource {
    constructor(client, data = {}) {
        super(action, Message, idField, client);
        this[actionKey] = action;
        this[clientKey] = client;
        if (idField in data) {
            this.id = data[idField];
        };

        extend(this, data);
    }

    listMedia() {
        //return super.executeAction(this.id + '/Media/', 'Get', {});
        let client = this[clientKey];
        let idField = this[idKey];
        return new Promise((resolve, reject) => {
            client('Get', this[actionKey] + this.id + '/Media/', {})
                .then(response => {
                    resolve(new MMSMediaResponse(response.body, idField));
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

}
/**
 * Represents a Message Interface
 * @constructor
 * @param {function} client - make api call
 * @param {object} [data] - data of call
 */

export class MessageInterface extends PlivoResourceInterface {

    constructor(client, data = {}) {
        super(action, Message, idField, client);
        extend(this, data);
        this[clientKey] = client;
        this[actionKey] = action;
        this[klassKey] = Message;
        this[idKey] = idField;

    }

    /**
     * Send Message
     * @method
     * @param {string} src - source number
     * @param {string} dst - destination number
     * @param {string} text - text to send
     * @param {object} optionalParams - Optional Params to send message
     * @param {string} [optionalParams.type] - The type of message. Should be `sms` or `mms`. Defaults to `sms`.
     * @param {string} [optionalParams.url] The URL to which with the status of the message is sent.
     * @param {string} [optionalParams.method] The method used to call the url. Defaults to POST.
     * @param {list} [optionalParams.media_urls] For sending mms, specify the media urls in list of string
     * @param {boolean} [optionalParams.log] If set to false, the content of this message will not be logged on the Plivo infrastructure and the dst value will be masked (e.g., 141XXXXX528). Default is set to true.
     * @promise {object} return {@link PlivoGenericMessage} object if success
     * @fail {Error} return Error
     */
    send(src, dst, text, optionalParams) {
        return this.create(src, dst, text, optionalParams);
    }

    /**
     * Create Message
     * @method
     * @param {string} src - source number
     * @param {string} dst - destination number
     * @param {string} text - text to send
     * @param {object} optionalParams - Optional Params to send message
     * @param {string} [optionalParams.type] - The type of message. Should be `sms` or `mms`. Defaults to `sms`.
     * @param {string} [optionalParams.url] The URL to which with the status of the message is sent.
     * @param {string} [optionalParams.method] The method used to call the url. Defaults to POST.
     * @param {boolean} [optionalParams.log] If set to false, the content of this message will not be logged on the Plivo infrastructure and the dst value will be masked (e.g., 141XXXXX528). Default is set to true.
     * @param {Array} [optionalParams.media_urls] For sending mms, specify the media urls in list of string
     * @promise {object} return {@link MessageResponse} object if success
     * @fail {Error} return Error
     */
    create(src, dst, text, optionalParams, powerpackUUID) {
        let errors = validate([{
            field: 'dst',
            value: dst,
            validators: ['isRequired']
        }]);

        if (errors) {
            return errors;
        }

        if (!src && !powerpackUUID) {
            let errorText = 'Neither of src or powerpack uuid present, either one is required'
            return new Promise(function(resolve, reject) {
                reject(new Error(errorText));
            });
        }

        if (src && powerpackUUID) {
            let errorText = 'Either of src or powerpack uuid, both of them are present'
            return new Promise(function(resolve, reject) {
                reject(new Error(errorText));
            })
        }

        let params = optionalParams || {};
        if (src) {
            params.src = src;
        }
        params.dst = _.isArray(dst) ? _.join(dst, '<') : dst;
        params.text = text;
        if (powerpackUUID) {
            params.powerpackUUID = powerpackUUID;
        }

        let client = this[clientKey];
        let idField = this[idKey];
        let action = this[actionKey] + (this.id ? this.id + '/' : '');

        return new Promise((resolve, reject) => {
            client('POST', action, params)
                .then(response => {
                    resolve(new MessageResponse(response.body, idField));
                })
                .catch(error => {
                    reject(error);
                });
        })
    }

    /**
     * Get Message by given id
     * @method
     * @param {string} id - id of message
     * @promise {object} return {@link Message} object if success
     * @fail {Error} return Error
     */
    get(id) {
        let errors = validate([{
            field: 'id',
            value: id,
            validators: ['isRequired']
        }]);

        if (errors) {
            return errors;
        }

        let client = this[clientKey];
        let action = this[actionKey];

        return new Promise((resolve, reject) => {
            if (action !== '' && !id) {
                reject(new Error(this[idKey] + ' must be set'));
            }
            client('GET', action + (id ? id + '/' : ''))
                .then(response => {
                    resolve(new MessageGetResponse(response.body, client));
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    list(params) {
        let client = this[clientKey];
        let action = this[actionKey];
        return new Promise((resolve, reject) => {
            client('GET', action, params)
                .then(response => {
                    let objects = [];
                    Object.defineProperty(objects, 'meta', {
                        value: response.body.meta,
                        enumerable: true
                    });
                    response.body.objects.forEach(item => {
                        objects.push(new MessageListResponse(item, client));
                    });
                    resolve(objects);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    listMedia(messageUUID) {
        return new Message(this[clientKey], {
            id: messageUUID
        }).listMedia();
    }

}
