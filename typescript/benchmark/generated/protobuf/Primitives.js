/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const primitives = $root.primitives = (() => {

    /**
     * Namespace primitives.
     * @exports primitives
     * @namespace
     */
    const primitives = {};

    primitives.Primitives = (function() {

        /**
         * Properties of a Primitives.
         * @memberof primitives
         * @interface IPrimitives
         * @property {string|null} [stringField] Primitives stringField
         * @property {number|null} [signedIntField] Primitives signedIntField
         * @property {number|null} [unsignedIntField] Primitives unsignedIntField
         * @property {number|null} [floatField] Primitives floatField
         * @property {boolean|null} [booleanField] Primitives booleanField
         */

        /**
         * Constructs a new Primitives.
         * @memberof primitives
         * @classdesc Represents a Primitives.
         * @implements IPrimitives
         * @constructor
         * @param {primitives.IPrimitives=} [properties] Properties to set
         */
        function Primitives(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Primitives stringField.
         * @member {string} stringField
         * @memberof primitives.Primitives
         * @instance
         */
        Primitives.prototype.stringField = "";

        /**
         * Primitives signedIntField.
         * @member {number} signedIntField
         * @memberof primitives.Primitives
         * @instance
         */
        Primitives.prototype.signedIntField = 0;

        /**
         * Primitives unsignedIntField.
         * @member {number} unsignedIntField
         * @memberof primitives.Primitives
         * @instance
         */
        Primitives.prototype.unsignedIntField = 0;

        /**
         * Primitives floatField.
         * @member {number} floatField
         * @memberof primitives.Primitives
         * @instance
         */
        Primitives.prototype.floatField = 0;

        /**
         * Primitives booleanField.
         * @member {boolean} booleanField
         * @memberof primitives.Primitives
         * @instance
         */
        Primitives.prototype.booleanField = false;

        /**
         * Creates a new Primitives instance using the specified properties.
         * @function create
         * @memberof primitives.Primitives
         * @static
         * @param {primitives.IPrimitives=} [properties] Properties to set
         * @returns {primitives.Primitives} Primitives instance
         */
        Primitives.create = function create(properties) {
            return new Primitives(properties);
        };

        /**
         * Encodes the specified Primitives message. Does not implicitly {@link primitives.Primitives.verify|verify} messages.
         * @function encode
         * @memberof primitives.Primitives
         * @static
         * @param {primitives.IPrimitives} message Primitives message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Primitives.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.stringField != null && Object.hasOwnProperty.call(message, "stringField"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.stringField);
            if (message.signedIntField != null && Object.hasOwnProperty.call(message, "signedIntField"))
                writer.uint32(/* id 2, wireType 0 =*/16).sint32(message.signedIntField);
            if (message.unsignedIntField != null && Object.hasOwnProperty.call(message, "unsignedIntField"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.unsignedIntField);
            if (message.floatField != null && Object.hasOwnProperty.call(message, "floatField"))
                writer.uint32(/* id 4, wireType 5 =*/37).float(message.floatField);
            if (message.booleanField != null && Object.hasOwnProperty.call(message, "booleanField"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.booleanField);
            return writer;
        };

        /**
         * Encodes the specified Primitives message, length delimited. Does not implicitly {@link primitives.Primitives.verify|verify} messages.
         * @function encodeDelimited
         * @memberof primitives.Primitives
         * @static
         * @param {primitives.IPrimitives} message Primitives message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Primitives.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Primitives message from the specified reader or buffer.
         * @function decode
         * @memberof primitives.Primitives
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {primitives.Primitives} Primitives
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Primitives.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.primitives.Primitives();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.stringField = reader.string();
                        break;
                    }
                case 2: {
                        message.signedIntField = reader.sint32();
                        break;
                    }
                case 3: {
                        message.unsignedIntField = reader.uint32();
                        break;
                    }
                case 4: {
                        message.floatField = reader.float();
                        break;
                    }
                case 5: {
                        message.booleanField = reader.bool();
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
         * Decodes a Primitives message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof primitives.Primitives
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {primitives.Primitives} Primitives
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Primitives.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Primitives message.
         * @function verify
         * @memberof primitives.Primitives
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Primitives.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.stringField != null && message.hasOwnProperty("stringField"))
                if (!$util.isString(message.stringField))
                    return "stringField: string expected";
            if (message.signedIntField != null && message.hasOwnProperty("signedIntField"))
                if (!$util.isInteger(message.signedIntField))
                    return "signedIntField: integer expected";
            if (message.unsignedIntField != null && message.hasOwnProperty("unsignedIntField"))
                if (!$util.isInteger(message.unsignedIntField))
                    return "unsignedIntField: integer expected";
            if (message.floatField != null && message.hasOwnProperty("floatField"))
                if (typeof message.floatField !== "number")
                    return "floatField: number expected";
            if (message.booleanField != null && message.hasOwnProperty("booleanField"))
                if (typeof message.booleanField !== "boolean")
                    return "booleanField: boolean expected";
            return null;
        };

        /**
         * Creates a Primitives message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof primitives.Primitives
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {primitives.Primitives} Primitives
         */
        Primitives.fromObject = function fromObject(object) {
            if (object instanceof $root.primitives.Primitives)
                return object;
            let message = new $root.primitives.Primitives();
            if (object.stringField != null)
                message.stringField = String(object.stringField);
            if (object.signedIntField != null)
                message.signedIntField = object.signedIntField | 0;
            if (object.unsignedIntField != null)
                message.unsignedIntField = object.unsignedIntField >>> 0;
            if (object.floatField != null)
                message.floatField = Number(object.floatField);
            if (object.booleanField != null)
                message.booleanField = Boolean(object.booleanField);
            return message;
        };

        /**
         * Creates a plain object from a Primitives message. Also converts values to other types if specified.
         * @function toObject
         * @memberof primitives.Primitives
         * @static
         * @param {primitives.Primitives} message Primitives
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Primitives.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.stringField = "";
                object.signedIntField = 0;
                object.unsignedIntField = 0;
                object.floatField = 0;
                object.booleanField = false;
            }
            if (message.stringField != null && message.hasOwnProperty("stringField"))
                object.stringField = message.stringField;
            if (message.signedIntField != null && message.hasOwnProperty("signedIntField"))
                object.signedIntField = message.signedIntField;
            if (message.unsignedIntField != null && message.hasOwnProperty("unsignedIntField"))
                object.unsignedIntField = message.unsignedIntField;
            if (message.floatField != null && message.hasOwnProperty("floatField"))
                object.floatField = options.json && !isFinite(message.floatField) ? String(message.floatField) : message.floatField;
            if (message.booleanField != null && message.hasOwnProperty("booleanField"))
                object.booleanField = message.booleanField;
            return object;
        };

        /**
         * Converts this Primitives to JSON.
         * @function toJSON
         * @memberof primitives.Primitives
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Primitives.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Primitives
         * @function getTypeUrl
         * @memberof primitives.Primitives
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Primitives.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/primitives.Primitives";
        };

        return Primitives;
    })();

    return primitives;
})();

export { $root as default };
