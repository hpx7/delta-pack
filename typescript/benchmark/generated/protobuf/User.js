/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const user = $root.user = (() => {

    /**
     * Namespace user.
     * @exports user
     * @namespace
     */
    const user = {};

    /**
     * HairColor enum.
     * @name user.HairColor
     * @enum {number}
     * @property {number} HAIR_COLOR_UNSPECIFIED=0 HAIR_COLOR_UNSPECIFIED value
     * @property {number} BLACK=1 BLACK value
     * @property {number} BROWN=2 BROWN value
     * @property {number} BLOND=3 BLOND value
     * @property {number} RED=4 RED value
     * @property {number} WHITE=5 WHITE value
     * @property {number} OTHER=6 OTHER value
     */
    user.HairColor = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "HAIR_COLOR_UNSPECIFIED"] = 0;
        values[valuesById[1] = "BLACK"] = 1;
        values[valuesById[2] = "BROWN"] = 2;
        values[valuesById[3] = "BLOND"] = 3;
        values[valuesById[4] = "RED"] = 4;
        values[valuesById[5] = "WHITE"] = 5;
        values[valuesById[6] = "OTHER"] = 6;
        return values;
    })();

    user.Address = (function() {

        /**
         * Properties of an Address.
         * @memberof user
         * @interface IAddress
         * @property {string|null} [street] Address street
         * @property {string|null} [zip] Address zip
         * @property {string|null} [state] Address state
         */

        /**
         * Constructs a new Address.
         * @memberof user
         * @classdesc Represents an Address.
         * @implements IAddress
         * @constructor
         * @param {user.IAddress=} [properties] Properties to set
         */
        function Address(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Address street.
         * @member {string} street
         * @memberof user.Address
         * @instance
         */
        Address.prototype.street = "";

        /**
         * Address zip.
         * @member {string} zip
         * @memberof user.Address
         * @instance
         */
        Address.prototype.zip = "";

        /**
         * Address state.
         * @member {string} state
         * @memberof user.Address
         * @instance
         */
        Address.prototype.state = "";

        /**
         * Creates a new Address instance using the specified properties.
         * @function create
         * @memberof user.Address
         * @static
         * @param {user.IAddress=} [properties] Properties to set
         * @returns {user.Address} Address instance
         */
        Address.create = function create(properties) {
            return new Address(properties);
        };

        /**
         * Encodes the specified Address message. Does not implicitly {@link user.Address.verify|verify} messages.
         * @function encode
         * @memberof user.Address
         * @static
         * @param {user.IAddress} message Address message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Address.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.street != null && Object.hasOwnProperty.call(message, "street"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.street);
            if (message.zip != null && Object.hasOwnProperty.call(message, "zip"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.zip);
            if (message.state != null && Object.hasOwnProperty.call(message, "state"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.state);
            return writer;
        };

        /**
         * Encodes the specified Address message, length delimited. Does not implicitly {@link user.Address.verify|verify} messages.
         * @function encodeDelimited
         * @memberof user.Address
         * @static
         * @param {user.IAddress} message Address message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Address.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Address message from the specified reader or buffer.
         * @function decode
         * @memberof user.Address
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {user.Address} Address
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Address.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.user.Address();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.street = reader.string();
                        break;
                    }
                case 2: {
                        message.zip = reader.string();
                        break;
                    }
                case 3: {
                        message.state = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Address message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof user.Address
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {user.Address} Address
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Address.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Address message.
         * @function verify
         * @memberof user.Address
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Address.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.street != null && message.hasOwnProperty("street"))
                if (!$util.isString(message.street))
                    return "street: string expected";
            if (message.zip != null && message.hasOwnProperty("zip"))
                if (!$util.isString(message.zip))
                    return "zip: string expected";
            if (message.state != null && message.hasOwnProperty("state"))
                if (!$util.isString(message.state))
                    return "state: string expected";
            return null;
        };

        /**
         * Creates an Address message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof user.Address
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {user.Address} Address
         */
        Address.fromObject = function fromObject(object) {
            if (object instanceof $root.user.Address)
                return object;
            let message = new $root.user.Address();
            if (object.street != null)
                message.street = String(object.street);
            if (object.zip != null)
                message.zip = String(object.zip);
            if (object.state != null)
                message.state = String(object.state);
            return message;
        };

        /**
         * Creates a plain object from an Address message. Also converts values to other types if specified.
         * @function toObject
         * @memberof user.Address
         * @static
         * @param {user.Address} message Address
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Address.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.street = "";
                object.zip = "";
                object.state = "";
            }
            if (message.street != null && message.hasOwnProperty("street"))
                object.street = message.street;
            if (message.zip != null && message.hasOwnProperty("zip"))
                object.zip = message.zip;
            if (message.state != null && message.hasOwnProperty("state"))
                object.state = message.state;
            return object;
        };

        /**
         * Converts this Address to JSON.
         * @function toJSON
         * @memberof user.Address
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Address.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Address
         * @function getTypeUrl
         * @memberof user.Address
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Address.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/user.Address";
        };

        return Address;
    })();

    user.EmailContact = (function() {

        /**
         * Properties of an EmailContact.
         * @memberof user
         * @interface IEmailContact
         * @property {string|null} [email] EmailContact email
         */

        /**
         * Constructs a new EmailContact.
         * @memberof user
         * @classdesc Represents an EmailContact.
         * @implements IEmailContact
         * @constructor
         * @param {user.IEmailContact=} [properties] Properties to set
         */
        function EmailContact(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * EmailContact email.
         * @member {string} email
         * @memberof user.EmailContact
         * @instance
         */
        EmailContact.prototype.email = "";

        /**
         * Creates a new EmailContact instance using the specified properties.
         * @function create
         * @memberof user.EmailContact
         * @static
         * @param {user.IEmailContact=} [properties] Properties to set
         * @returns {user.EmailContact} EmailContact instance
         */
        EmailContact.create = function create(properties) {
            return new EmailContact(properties);
        };

        /**
         * Encodes the specified EmailContact message. Does not implicitly {@link user.EmailContact.verify|verify} messages.
         * @function encode
         * @memberof user.EmailContact
         * @static
         * @param {user.IEmailContact} message EmailContact message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EmailContact.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.email);
            return writer;
        };

        /**
         * Encodes the specified EmailContact message, length delimited. Does not implicitly {@link user.EmailContact.verify|verify} messages.
         * @function encodeDelimited
         * @memberof user.EmailContact
         * @static
         * @param {user.IEmailContact} message EmailContact message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EmailContact.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an EmailContact message from the specified reader or buffer.
         * @function decode
         * @memberof user.EmailContact
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {user.EmailContact} EmailContact
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EmailContact.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.user.EmailContact();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.email = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an EmailContact message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof user.EmailContact
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {user.EmailContact} EmailContact
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EmailContact.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an EmailContact message.
         * @function verify
         * @memberof user.EmailContact
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        EmailContact.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.email != null && message.hasOwnProperty("email"))
                if (!$util.isString(message.email))
                    return "email: string expected";
            return null;
        };

        /**
         * Creates an EmailContact message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof user.EmailContact
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {user.EmailContact} EmailContact
         */
        EmailContact.fromObject = function fromObject(object) {
            if (object instanceof $root.user.EmailContact)
                return object;
            let message = new $root.user.EmailContact();
            if (object.email != null)
                message.email = String(object.email);
            return message;
        };

        /**
         * Creates a plain object from an EmailContact message. Also converts values to other types if specified.
         * @function toObject
         * @memberof user.EmailContact
         * @static
         * @param {user.EmailContact} message EmailContact
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        EmailContact.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.email = "";
            if (message.email != null && message.hasOwnProperty("email"))
                object.email = message.email;
            return object;
        };

        /**
         * Converts this EmailContact to JSON.
         * @function toJSON
         * @memberof user.EmailContact
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        EmailContact.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for EmailContact
         * @function getTypeUrl
         * @memberof user.EmailContact
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        EmailContact.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/user.EmailContact";
        };

        return EmailContact;
    })();

    user.PhoneContact = (function() {

        /**
         * Properties of a PhoneContact.
         * @memberof user
         * @interface IPhoneContact
         * @property {string|null} [phone] PhoneContact phone
         * @property {number|null} [extension] PhoneContact extension
         */

        /**
         * Constructs a new PhoneContact.
         * @memberof user
         * @classdesc Represents a PhoneContact.
         * @implements IPhoneContact
         * @constructor
         * @param {user.IPhoneContact=} [properties] Properties to set
         */
        function PhoneContact(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PhoneContact phone.
         * @member {string} phone
         * @memberof user.PhoneContact
         * @instance
         */
        PhoneContact.prototype.phone = "";

        /**
         * PhoneContact extension.
         * @member {number|null|undefined} extension
         * @memberof user.PhoneContact
         * @instance
         */
        PhoneContact.prototype.extension = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(PhoneContact.prototype, "_extension", {
            get: $util.oneOfGetter($oneOfFields = ["extension"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new PhoneContact instance using the specified properties.
         * @function create
         * @memberof user.PhoneContact
         * @static
         * @param {user.IPhoneContact=} [properties] Properties to set
         * @returns {user.PhoneContact} PhoneContact instance
         */
        PhoneContact.create = function create(properties) {
            return new PhoneContact(properties);
        };

        /**
         * Encodes the specified PhoneContact message. Does not implicitly {@link user.PhoneContact.verify|verify} messages.
         * @function encode
         * @memberof user.PhoneContact
         * @static
         * @param {user.IPhoneContact} message PhoneContact message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PhoneContact.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.phone);
            if (message.extension != null && Object.hasOwnProperty.call(message, "extension"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.extension);
            return writer;
        };

        /**
         * Encodes the specified PhoneContact message, length delimited. Does not implicitly {@link user.PhoneContact.verify|verify} messages.
         * @function encodeDelimited
         * @memberof user.PhoneContact
         * @static
         * @param {user.IPhoneContact} message PhoneContact message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PhoneContact.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PhoneContact message from the specified reader or buffer.
         * @function decode
         * @memberof user.PhoneContact
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {user.PhoneContact} PhoneContact
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PhoneContact.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.user.PhoneContact();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.phone = reader.string();
                        break;
                    }
                case 2: {
                        message.extension = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PhoneContact message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof user.PhoneContact
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {user.PhoneContact} PhoneContact
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PhoneContact.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PhoneContact message.
         * @function verify
         * @memberof user.PhoneContact
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PhoneContact.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.phone != null && message.hasOwnProperty("phone"))
                if (!$util.isString(message.phone))
                    return "phone: string expected";
            if (message.extension != null && message.hasOwnProperty("extension")) {
                properties._extension = 1;
                if (!$util.isInteger(message.extension))
                    return "extension: integer expected";
            }
            return null;
        };

        /**
         * Creates a PhoneContact message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof user.PhoneContact
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {user.PhoneContact} PhoneContact
         */
        PhoneContact.fromObject = function fromObject(object) {
            if (object instanceof $root.user.PhoneContact)
                return object;
            let message = new $root.user.PhoneContact();
            if (object.phone != null)
                message.phone = String(object.phone);
            if (object.extension != null)
                message.extension = object.extension >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a PhoneContact message. Also converts values to other types if specified.
         * @function toObject
         * @memberof user.PhoneContact
         * @static
         * @param {user.PhoneContact} message PhoneContact
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PhoneContact.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.phone = "";
            if (message.phone != null && message.hasOwnProperty("phone"))
                object.phone = message.phone;
            if (message.extension != null && message.hasOwnProperty("extension")) {
                object.extension = message.extension;
                if (options.oneofs)
                    object._extension = "extension";
            }
            return object;
        };

        /**
         * Converts this PhoneContact to JSON.
         * @function toJSON
         * @memberof user.PhoneContact
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PhoneContact.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PhoneContact
         * @function getTypeUrl
         * @memberof user.PhoneContact
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PhoneContact.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/user.PhoneContact";
        };

        return PhoneContact;
    })();

    user.Contact = (function() {

        /**
         * Properties of a Contact.
         * @memberof user
         * @interface IContact
         * @property {user.IEmailContact|null} [EmailContact] Contact EmailContact
         * @property {user.IPhoneContact|null} [PhoneContact] Contact PhoneContact
         */

        /**
         * Constructs a new Contact.
         * @memberof user
         * @classdesc Represents a Contact.
         * @implements IContact
         * @constructor
         * @param {user.IContact=} [properties] Properties to set
         */
        function Contact(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Contact EmailContact.
         * @member {user.IEmailContact|null|undefined} EmailContact
         * @memberof user.Contact
         * @instance
         */
        Contact.prototype.EmailContact = null;

        /**
         * Contact PhoneContact.
         * @member {user.IPhoneContact|null|undefined} PhoneContact
         * @memberof user.Contact
         * @instance
         */
        Contact.prototype.PhoneContact = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        /**
         * Contact contactType.
         * @member {"EmailContact"|"PhoneContact"|undefined} contactType
         * @memberof user.Contact
         * @instance
         */
        Object.defineProperty(Contact.prototype, "contactType", {
            get: $util.oneOfGetter($oneOfFields = ["EmailContact", "PhoneContact"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Contact instance using the specified properties.
         * @function create
         * @memberof user.Contact
         * @static
         * @param {user.IContact=} [properties] Properties to set
         * @returns {user.Contact} Contact instance
         */
        Contact.create = function create(properties) {
            return new Contact(properties);
        };

        /**
         * Encodes the specified Contact message. Does not implicitly {@link user.Contact.verify|verify} messages.
         * @function encode
         * @memberof user.Contact
         * @static
         * @param {user.IContact} message Contact message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Contact.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.EmailContact != null && Object.hasOwnProperty.call(message, "EmailContact"))
                $root.user.EmailContact.encode(message.EmailContact, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.PhoneContact != null && Object.hasOwnProperty.call(message, "PhoneContact"))
                $root.user.PhoneContact.encode(message.PhoneContact, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Contact message, length delimited. Does not implicitly {@link user.Contact.verify|verify} messages.
         * @function encodeDelimited
         * @memberof user.Contact
         * @static
         * @param {user.IContact} message Contact message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Contact.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Contact message from the specified reader or buffer.
         * @function decode
         * @memberof user.Contact
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {user.Contact} Contact
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Contact.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.user.Contact();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.EmailContact = $root.user.EmailContact.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.PhoneContact = $root.user.PhoneContact.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Contact message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof user.Contact
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {user.Contact} Contact
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Contact.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Contact message.
         * @function verify
         * @memberof user.Contact
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Contact.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.EmailContact != null && message.hasOwnProperty("EmailContact")) {
                properties.contactType = 1;
                {
                    let error = $root.user.EmailContact.verify(message.EmailContact);
                    if (error)
                        return "EmailContact." + error;
                }
            }
            if (message.PhoneContact != null && message.hasOwnProperty("PhoneContact")) {
                if (properties.contactType === 1)
                    return "contactType: multiple values";
                properties.contactType = 1;
                {
                    let error = $root.user.PhoneContact.verify(message.PhoneContact);
                    if (error)
                        return "PhoneContact." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Contact message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof user.Contact
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {user.Contact} Contact
         */
        Contact.fromObject = function fromObject(object) {
            if (object instanceof $root.user.Contact)
                return object;
            let message = new $root.user.Contact();
            if (object.EmailContact != null) {
                if (typeof object.EmailContact !== "object")
                    throw TypeError(".user.Contact.EmailContact: object expected");
                message.EmailContact = $root.user.EmailContact.fromObject(object.EmailContact);
            }
            if (object.PhoneContact != null) {
                if (typeof object.PhoneContact !== "object")
                    throw TypeError(".user.Contact.PhoneContact: object expected");
                message.PhoneContact = $root.user.PhoneContact.fromObject(object.PhoneContact);
            }
            return message;
        };

        /**
         * Creates a plain object from a Contact message. Also converts values to other types if specified.
         * @function toObject
         * @memberof user.Contact
         * @static
         * @param {user.Contact} message Contact
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Contact.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (message.EmailContact != null && message.hasOwnProperty("EmailContact")) {
                object.EmailContact = $root.user.EmailContact.toObject(message.EmailContact, options);
                if (options.oneofs)
                    object.contactType = "EmailContact";
            }
            if (message.PhoneContact != null && message.hasOwnProperty("PhoneContact")) {
                object.PhoneContact = $root.user.PhoneContact.toObject(message.PhoneContact, options);
                if (options.oneofs)
                    object.contactType = "PhoneContact";
            }
            return object;
        };

        /**
         * Converts this Contact to JSON.
         * @function toJSON
         * @memberof user.Contact
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Contact.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Contact
         * @function getTypeUrl
         * @memberof user.Contact
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Contact.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/user.Contact";
        };

        return Contact;
    })();

    user.User = (function() {

        /**
         * Properties of a User.
         * @memberof user
         * @interface IUser
         * @property {string|null} [id] User id
         * @property {string|null} [name] User name
         * @property {number|null} [age] User age
         * @property {number|null} [weight] User weight
         * @property {boolean|null} [married] User married
         * @property {user.HairColor|null} [hairColor] User hairColor
         * @property {user.IAddress|null} [address] User address
         * @property {Array.<user.IUser>|null} [children] User children
         * @property {Object.<string,string>|null} [metadata] User metadata
         * @property {user.IContact|null} [preferredContact] User preferredContact
         */

        /**
         * Constructs a new User.
         * @memberof user
         * @classdesc Represents a User.
         * @implements IUser
         * @constructor
         * @param {user.IUser=} [properties] Properties to set
         */
        function User(properties) {
            this.children = [];
            this.metadata = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * User id.
         * @member {string} id
         * @memberof user.User
         * @instance
         */
        User.prototype.id = "";

        /**
         * User name.
         * @member {string} name
         * @memberof user.User
         * @instance
         */
        User.prototype.name = "";

        /**
         * User age.
         * @member {number} age
         * @memberof user.User
         * @instance
         */
        User.prototype.age = 0;

        /**
         * User weight.
         * @member {number} weight
         * @memberof user.User
         * @instance
         */
        User.prototype.weight = 0;

        /**
         * User married.
         * @member {boolean} married
         * @memberof user.User
         * @instance
         */
        User.prototype.married = false;

        /**
         * User hairColor.
         * @member {user.HairColor} hairColor
         * @memberof user.User
         * @instance
         */
        User.prototype.hairColor = 0;

        /**
         * User address.
         * @member {user.IAddress|null|undefined} address
         * @memberof user.User
         * @instance
         */
        User.prototype.address = null;

        /**
         * User children.
         * @member {Array.<user.IUser>} children
         * @memberof user.User
         * @instance
         */
        User.prototype.children = $util.emptyArray;

        /**
         * User metadata.
         * @member {Object.<string,string>} metadata
         * @memberof user.User
         * @instance
         */
        User.prototype.metadata = $util.emptyObject;

        /**
         * User preferredContact.
         * @member {user.IContact|null|undefined} preferredContact
         * @memberof user.User
         * @instance
         */
        User.prototype.preferredContact = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(User.prototype, "_address", {
            get: $util.oneOfGetter($oneOfFields = ["address"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(User.prototype, "_preferredContact", {
            get: $util.oneOfGetter($oneOfFields = ["preferredContact"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new User instance using the specified properties.
         * @function create
         * @memberof user.User
         * @static
         * @param {user.IUser=} [properties] Properties to set
         * @returns {user.User} User instance
         */
        User.create = function create(properties) {
            return new User(properties);
        };

        /**
         * Encodes the specified User message. Does not implicitly {@link user.User.verify|verify} messages.
         * @function encode
         * @memberof user.User
         * @static
         * @param {user.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.age);
            if (message.weight != null && Object.hasOwnProperty.call(message, "weight"))
                writer.uint32(/* id 4, wireType 5 =*/37).float(message.weight);
            if (message.married != null && Object.hasOwnProperty.call(message, "married"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.married);
            if (message.hairColor != null && Object.hasOwnProperty.call(message, "hairColor"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.hairColor);
            if (message.address != null && Object.hasOwnProperty.call(message, "address"))
                $root.user.Address.encode(message.address, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.children != null && message.children.length)
                for (let i = 0; i < message.children.length; ++i)
                    $root.user.User.encode(message.children[i], writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 9, wireType 2 =*/74).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
            if (message.preferredContact != null && Object.hasOwnProperty.call(message, "preferredContact"))
                $root.user.Contact.encode(message.preferredContact, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link user.User.verify|verify} messages.
         * @function encodeDelimited
         * @memberof user.User
         * @static
         * @param {user.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a User message from the specified reader or buffer.
         * @function decode
         * @memberof user.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {user.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.user.User(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.age = reader.uint32();
                        break;
                    }
                case 4: {
                        message.weight = reader.float();
                        break;
                    }
                case 5: {
                        message.married = reader.bool();
                        break;
                    }
                case 6: {
                        message.hairColor = reader.int32();
                        break;
                    }
                case 7: {
                        message.address = $root.user.Address.decode(reader, reader.uint32());
                        break;
                    }
                case 8: {
                        if (!(message.children && message.children.length))
                            message.children = [];
                        message.children.push($root.user.User.decode(reader, reader.uint32()));
                        break;
                    }
                case 9: {
                        if (message.metadata === $util.emptyObject)
                            message.metadata = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.string();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.metadata[key] = value;
                        break;
                    }
                case 10: {
                        message.preferredContact = $root.user.Contact.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof user.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {user.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a User message.
         * @function verify
         * @memberof user.User
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        User.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.age != null && message.hasOwnProperty("age"))
                if (!$util.isInteger(message.age))
                    return "age: integer expected";
            if (message.weight != null && message.hasOwnProperty("weight"))
                if (typeof message.weight !== "number")
                    return "weight: number expected";
            if (message.married != null && message.hasOwnProperty("married"))
                if (typeof message.married !== "boolean")
                    return "married: boolean expected";
            if (message.hairColor != null && message.hasOwnProperty("hairColor"))
                switch (message.hairColor) {
                default:
                    return "hairColor: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.address != null && message.hasOwnProperty("address")) {
                properties._address = 1;
                {
                    let error = $root.user.Address.verify(message.address);
                    if (error)
                        return "address." + error;
                }
            }
            if (message.children != null && message.hasOwnProperty("children")) {
                if (!Array.isArray(message.children))
                    return "children: array expected";
                for (let i = 0; i < message.children.length; ++i) {
                    let error = $root.user.User.verify(message.children[i]);
                    if (error)
                        return "children." + error;
                }
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isObject(message.metadata))
                    return "metadata: object expected";
                let key = Object.keys(message.metadata);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.metadata[key[i]]))
                        return "metadata: string{k:string} expected";
            }
            if (message.preferredContact != null && message.hasOwnProperty("preferredContact")) {
                properties._preferredContact = 1;
                {
                    let error = $root.user.Contact.verify(message.preferredContact);
                    if (error)
                        return "preferredContact." + error;
                }
            }
            return null;
        };

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof user.User
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {user.User} User
         */
        User.fromObject = function fromObject(object) {
            if (object instanceof $root.user.User)
                return object;
            let message = new $root.user.User();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.age != null)
                message.age = object.age >>> 0;
            if (object.weight != null)
                message.weight = Number(object.weight);
            if (object.married != null)
                message.married = Boolean(object.married);
            switch (object.hairColor) {
            default:
                if (typeof object.hairColor === "number") {
                    message.hairColor = object.hairColor;
                    break;
                }
                break;
            case "HAIR_COLOR_UNSPECIFIED":
            case 0:
                message.hairColor = 0;
                break;
            case "BLACK":
            case 1:
                message.hairColor = 1;
                break;
            case "BROWN":
            case 2:
                message.hairColor = 2;
                break;
            case "BLOND":
            case 3:
                message.hairColor = 3;
                break;
            case "RED":
            case 4:
                message.hairColor = 4;
                break;
            case "WHITE":
            case 5:
                message.hairColor = 5;
                break;
            case "OTHER":
            case 6:
                message.hairColor = 6;
                break;
            }
            if (object.address != null) {
                if (typeof object.address !== "object")
                    throw TypeError(".user.User.address: object expected");
                message.address = $root.user.Address.fromObject(object.address);
            }
            if (object.children) {
                if (!Array.isArray(object.children))
                    throw TypeError(".user.User.children: array expected");
                message.children = [];
                for (let i = 0; i < object.children.length; ++i) {
                    if (typeof object.children[i] !== "object")
                        throw TypeError(".user.User.children: object expected");
                    message.children[i] = $root.user.User.fromObject(object.children[i]);
                }
            }
            if (object.metadata) {
                if (typeof object.metadata !== "object")
                    throw TypeError(".user.User.metadata: object expected");
                message.metadata = {};
                for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                    message.metadata[keys[i]] = String(object.metadata[keys[i]]);
            }
            if (object.preferredContact != null) {
                if (typeof object.preferredContact !== "object")
                    throw TypeError(".user.User.preferredContact: object expected");
                message.preferredContact = $root.user.Contact.fromObject(object.preferredContact);
            }
            return message;
        };

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @function toObject
         * @memberof user.User
         * @static
         * @param {user.User} message User
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        User.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.children = [];
            if (options.objects || options.defaults)
                object.metadata = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.age = 0;
                object.weight = 0;
                object.married = false;
                object.hairColor = options.enums === String ? "HAIR_COLOR_UNSPECIFIED" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.age != null && message.hasOwnProperty("age"))
                object.age = message.age;
            if (message.weight != null && message.hasOwnProperty("weight"))
                object.weight = options.json && !isFinite(message.weight) ? String(message.weight) : message.weight;
            if (message.married != null && message.hasOwnProperty("married"))
                object.married = message.married;
            if (message.hairColor != null && message.hasOwnProperty("hairColor"))
                object.hairColor = options.enums === String ? $root.user.HairColor[message.hairColor] === undefined ? message.hairColor : $root.user.HairColor[message.hairColor] : message.hairColor;
            if (message.address != null && message.hasOwnProperty("address")) {
                object.address = $root.user.Address.toObject(message.address, options);
                if (options.oneofs)
                    object._address = "address";
            }
            if (message.children && message.children.length) {
                object.children = [];
                for (let j = 0; j < message.children.length; ++j)
                    object.children[j] = $root.user.User.toObject(message.children[j], options);
            }
            let keys2;
            if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                object.metadata = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.metadata[keys2[j]] = message.metadata[keys2[j]];
            }
            if (message.preferredContact != null && message.hasOwnProperty("preferredContact")) {
                object.preferredContact = $root.user.Contact.toObject(message.preferredContact, options);
                if (options.oneofs)
                    object._preferredContact = "preferredContact";
            }
            return object;
        };

        /**
         * Converts this User to JSON.
         * @function toJSON
         * @memberof user.User
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        User.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for User
         * @function getTypeUrl
         * @memberof user.User
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        User.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/user.User";
        };

        return User;
    })();

    return user;
})();

export { $root as default };
