/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const gamestate = $root.gamestate = (() => {

    /**
     * Namespace gamestate.
     * @exports gamestate
     * @namespace
     */
    const gamestate = {};

    /**
     * Team enum.
     * @name gamestate.Team
     * @enum {number}
     * @property {number} TEAM_UNSPECIFIED=0 TEAM_UNSPECIFIED value
     * @property {number} RED=1 RED value
     * @property {number} BLUE=2 BLUE value
     * @property {number} GREEN=3 GREEN value
     * @property {number} YELLOW=4 YELLOW value
     */
    gamestate.Team = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "TEAM_UNSPECIFIED"] = 0;
        values[valuesById[1] = "RED"] = 1;
        values[valuesById[2] = "BLUE"] = 2;
        values[valuesById[3] = "GREEN"] = 3;
        values[valuesById[4] = "YELLOW"] = 4;
        return values;
    })();

    /**
     * PlayerStatus enum.
     * @name gamestate.PlayerStatus
     * @enum {number}
     * @property {number} PLAYER_STATUS_UNSPECIFIED=0 PLAYER_STATUS_UNSPECIFIED value
     * @property {number} ALIVE=1 ALIVE value
     * @property {number} DEAD=2 DEAD value
     * @property {number} SPECTATING=3 SPECTATING value
     * @property {number} DISCONNECTED=4 DISCONNECTED value
     */
    gamestate.PlayerStatus = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "PLAYER_STATUS_UNSPECIFIED"] = 0;
        values[valuesById[1] = "ALIVE"] = 1;
        values[valuesById[2] = "DEAD"] = 2;
        values[valuesById[3] = "SPECTATING"] = 3;
        values[valuesById[4] = "DISCONNECTED"] = 4;
        return values;
    })();

    /**
     * WeaponType enum.
     * @name gamestate.WeaponType
     * @enum {number}
     * @property {number} WEAPON_TYPE_UNSPECIFIED=0 WEAPON_TYPE_UNSPECIFIED value
     * @property {number} SWORD=1 SWORD value
     * @property {number} BOW=2 BOW value
     * @property {number} STAFF=3 STAFF value
     * @property {number} DAGGER=4 DAGGER value
     * @property {number} AXE=5 AXE value
     */
    gamestate.WeaponType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "WEAPON_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "SWORD"] = 1;
        values[valuesById[2] = "BOW"] = 2;
        values[valuesById[3] = "STAFF"] = 3;
        values[valuesById[4] = "DAGGER"] = 4;
        values[valuesById[5] = "AXE"] = 5;
        return values;
    })();

    /**
     * ItemRarity enum.
     * @name gamestate.ItemRarity
     * @enum {number}
     * @property {number} ITEM_RARITY_UNSPECIFIED=0 ITEM_RARITY_UNSPECIFIED value
     * @property {number} COMMON=1 COMMON value
     * @property {number} UNCOMMON=2 UNCOMMON value
     * @property {number} RARE=3 RARE value
     * @property {number} EPIC=4 EPIC value
     * @property {number} LEGENDARY=5 LEGENDARY value
     */
    gamestate.ItemRarity = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "ITEM_RARITY_UNSPECIFIED"] = 0;
        values[valuesById[1] = "COMMON"] = 1;
        values[valuesById[2] = "UNCOMMON"] = 2;
        values[valuesById[3] = "RARE"] = 3;
        values[valuesById[4] = "EPIC"] = 4;
        values[valuesById[5] = "LEGENDARY"] = 5;
        return values;
    })();

    /**
     * AbilityType enum.
     * @name gamestate.AbilityType
     * @enum {number}
     * @property {number} ABILITY_TYPE_UNSPECIFIED=0 ABILITY_TYPE_UNSPECIFIED value
     * @property {number} HEAL=1 HEAL value
     * @property {number} DAMAGE=2 DAMAGE value
     * @property {number} SHIELD=3 SHIELD value
     * @property {number} BUFF=4 BUFF value
     * @property {number} DEBUFF=5 DEBUFF value
     * @property {number} TELEPORT=6 TELEPORT value
     */
    gamestate.AbilityType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "ABILITY_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "HEAL"] = 1;
        values[valuesById[2] = "DAMAGE"] = 2;
        values[valuesById[3] = "SHIELD"] = 3;
        values[valuesById[4] = "BUFF"] = 4;
        values[valuesById[5] = "DEBUFF"] = 5;
        values[valuesById[6] = "TELEPORT"] = 6;
        return values;
    })();

    /**
     * EffectType enum.
     * @name gamestate.EffectType
     * @enum {number}
     * @property {number} EFFECT_TYPE_UNSPECIFIED=0 EFFECT_TYPE_UNSPECIFIED value
     * @property {number} POISON=1 POISON value
     * @property {number} BURN=2 BURN value
     * @property {number} FREEZE=3 FREEZE value
     * @property {number} STUN=4 STUN value
     * @property {number} REGEN=5 REGEN value
     * @property {number} HASTE=6 HASTE value
     */
    gamestate.EffectType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "EFFECT_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "POISON"] = 1;
        values[valuesById[2] = "BURN"] = 2;
        values[valuesById[3] = "FREEZE"] = 3;
        values[valuesById[4] = "STUN"] = 4;
        values[valuesById[5] = "REGEN"] = 5;
        values[valuesById[6] = "HASTE"] = 6;
        return values;
    })();

    gamestate.Position = (function() {

        /**
         * Properties of a Position.
         * @memberof gamestate
         * @interface IPosition
         * @property {number|null} [x] Position x
         * @property {number|null} [y] Position y
         */

        /**
         * Constructs a new Position.
         * @memberof gamestate
         * @classdesc Represents a Position.
         * @implements IPosition
         * @constructor
         * @param {gamestate.IPosition=} [properties] Properties to set
         */
        function Position(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Position x.
         * @member {number} x
         * @memberof gamestate.Position
         * @instance
         */
        Position.prototype.x = 0;

        /**
         * Position y.
         * @member {number} y
         * @memberof gamestate.Position
         * @instance
         */
        Position.prototype.y = 0;

        /**
         * Creates a new Position instance using the specified properties.
         * @function create
         * @memberof gamestate.Position
         * @static
         * @param {gamestate.IPosition=} [properties] Properties to set
         * @returns {gamestate.Position} Position instance
         */
        Position.create = function create(properties) {
            return new Position(properties);
        };

        /**
         * Encodes the specified Position message. Does not implicitly {@link gamestate.Position.verify|verify} messages.
         * @function encode
         * @memberof gamestate.Position
         * @static
         * @param {gamestate.IPosition} message Position message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Position.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
            return writer;
        };

        /**
         * Encodes the specified Position message, length delimited. Does not implicitly {@link gamestate.Position.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.Position
         * @static
         * @param {gamestate.IPosition} message Position message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Position.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Position message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.Position
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.Position} Position
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Position.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.Position();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.x = reader.float();
                        break;
                    }
                case 2: {
                        message.y = reader.float();
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
         * Decodes a Position message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.Position
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.Position} Position
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Position.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Position message.
         * @function verify
         * @memberof gamestate.Position
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Position.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.x != null && message.hasOwnProperty("x"))
                if (typeof message.x !== "number")
                    return "x: number expected";
            if (message.y != null && message.hasOwnProperty("y"))
                if (typeof message.y !== "number")
                    return "y: number expected";
            return null;
        };

        /**
         * Creates a Position message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.Position
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.Position} Position
         */
        Position.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.Position)
                return object;
            let message = new $root.gamestate.Position();
            if (object.x != null)
                message.x = Number(object.x);
            if (object.y != null)
                message.y = Number(object.y);
            return message;
        };

        /**
         * Creates a plain object from a Position message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.Position
         * @static
         * @param {gamestate.Position} message Position
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Position.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.x = 0;
                object.y = 0;
            }
            if (message.x != null && message.hasOwnProperty("x"))
                object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
            if (message.y != null && message.hasOwnProperty("y"))
                object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
            return object;
        };

        /**
         * Converts this Position to JSON.
         * @function toJSON
         * @memberof gamestate.Position
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Position.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Position
         * @function getTypeUrl
         * @memberof gamestate.Position
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Position.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.Position";
        };

        return Position;
    })();

    gamestate.Velocity = (function() {

        /**
         * Properties of a Velocity.
         * @memberof gamestate
         * @interface IVelocity
         * @property {number|null} [vx] Velocity vx
         * @property {number|null} [vy] Velocity vy
         */

        /**
         * Constructs a new Velocity.
         * @memberof gamestate
         * @classdesc Represents a Velocity.
         * @implements IVelocity
         * @constructor
         * @param {gamestate.IVelocity=} [properties] Properties to set
         */
        function Velocity(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Velocity vx.
         * @member {number} vx
         * @memberof gamestate.Velocity
         * @instance
         */
        Velocity.prototype.vx = 0;

        /**
         * Velocity vy.
         * @member {number} vy
         * @memberof gamestate.Velocity
         * @instance
         */
        Velocity.prototype.vy = 0;

        /**
         * Creates a new Velocity instance using the specified properties.
         * @function create
         * @memberof gamestate.Velocity
         * @static
         * @param {gamestate.IVelocity=} [properties] Properties to set
         * @returns {gamestate.Velocity} Velocity instance
         */
        Velocity.create = function create(properties) {
            return new Velocity(properties);
        };

        /**
         * Encodes the specified Velocity message. Does not implicitly {@link gamestate.Velocity.verify|verify} messages.
         * @function encode
         * @memberof gamestate.Velocity
         * @static
         * @param {gamestate.IVelocity} message Velocity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Velocity.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.vx != null && Object.hasOwnProperty.call(message, "vx"))
                writer.uint32(/* id 1, wireType 5 =*/13).float(message.vx);
            if (message.vy != null && Object.hasOwnProperty.call(message, "vy"))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.vy);
            return writer;
        };

        /**
         * Encodes the specified Velocity message, length delimited. Does not implicitly {@link gamestate.Velocity.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.Velocity
         * @static
         * @param {gamestate.IVelocity} message Velocity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Velocity.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Velocity message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.Velocity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.Velocity} Velocity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Velocity.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.Velocity();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.vx = reader.float();
                        break;
                    }
                case 2: {
                        message.vy = reader.float();
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
         * Decodes a Velocity message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.Velocity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.Velocity} Velocity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Velocity.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Velocity message.
         * @function verify
         * @memberof gamestate.Velocity
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Velocity.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.vx != null && message.hasOwnProperty("vx"))
                if (typeof message.vx !== "number")
                    return "vx: number expected";
            if (message.vy != null && message.hasOwnProperty("vy"))
                if (typeof message.vy !== "number")
                    return "vy: number expected";
            return null;
        };

        /**
         * Creates a Velocity message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.Velocity
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.Velocity} Velocity
         */
        Velocity.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.Velocity)
                return object;
            let message = new $root.gamestate.Velocity();
            if (object.vx != null)
                message.vx = Number(object.vx);
            if (object.vy != null)
                message.vy = Number(object.vy);
            return message;
        };

        /**
         * Creates a plain object from a Velocity message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.Velocity
         * @static
         * @param {gamestate.Velocity} message Velocity
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Velocity.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.vx = 0;
                object.vy = 0;
            }
            if (message.vx != null && message.hasOwnProperty("vx"))
                object.vx = options.json && !isFinite(message.vx) ? String(message.vx) : message.vx;
            if (message.vy != null && message.hasOwnProperty("vy"))
                object.vy = options.json && !isFinite(message.vy) ? String(message.vy) : message.vy;
            return object;
        };

        /**
         * Converts this Velocity to JSON.
         * @function toJSON
         * @memberof gamestate.Velocity
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Velocity.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Velocity
         * @function getTypeUrl
         * @memberof gamestate.Velocity
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Velocity.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.Velocity";
        };

        return Velocity;
    })();

    gamestate.InventoryItem = (function() {

        /**
         * Properties of an InventoryItem.
         * @memberof gamestate
         * @interface IInventoryItem
         * @property {string|null} [itemId] InventoryItem itemId
         * @property {string|null} [name] InventoryItem name
         * @property {number|null} [quantity] InventoryItem quantity
         * @property {gamestate.ItemRarity|null} [rarity] InventoryItem rarity
         * @property {number|null} [durability] InventoryItem durability
         * @property {number|null} [enchantmentLevel] InventoryItem enchantmentLevel
         */

        /**
         * Constructs a new InventoryItem.
         * @memberof gamestate
         * @classdesc Represents an InventoryItem.
         * @implements IInventoryItem
         * @constructor
         * @param {gamestate.IInventoryItem=} [properties] Properties to set
         */
        function InventoryItem(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * InventoryItem itemId.
         * @member {string} itemId
         * @memberof gamestate.InventoryItem
         * @instance
         */
        InventoryItem.prototype.itemId = "";

        /**
         * InventoryItem name.
         * @member {string} name
         * @memberof gamestate.InventoryItem
         * @instance
         */
        InventoryItem.prototype.name = "";

        /**
         * InventoryItem quantity.
         * @member {number} quantity
         * @memberof gamestate.InventoryItem
         * @instance
         */
        InventoryItem.prototype.quantity = 0;

        /**
         * InventoryItem rarity.
         * @member {gamestate.ItemRarity} rarity
         * @memberof gamestate.InventoryItem
         * @instance
         */
        InventoryItem.prototype.rarity = 0;

        /**
         * InventoryItem durability.
         * @member {number|null|undefined} durability
         * @memberof gamestate.InventoryItem
         * @instance
         */
        InventoryItem.prototype.durability = null;

        /**
         * InventoryItem enchantmentLevel.
         * @member {number|null|undefined} enchantmentLevel
         * @memberof gamestate.InventoryItem
         * @instance
         */
        InventoryItem.prototype.enchantmentLevel = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(InventoryItem.prototype, "_durability", {
            get: $util.oneOfGetter($oneOfFields = ["durability"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(InventoryItem.prototype, "_enchantmentLevel", {
            get: $util.oneOfGetter($oneOfFields = ["enchantmentLevel"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new InventoryItem instance using the specified properties.
         * @function create
         * @memberof gamestate.InventoryItem
         * @static
         * @param {gamestate.IInventoryItem=} [properties] Properties to set
         * @returns {gamestate.InventoryItem} InventoryItem instance
         */
        InventoryItem.create = function create(properties) {
            return new InventoryItem(properties);
        };

        /**
         * Encodes the specified InventoryItem message. Does not implicitly {@link gamestate.InventoryItem.verify|verify} messages.
         * @function encode
         * @memberof gamestate.InventoryItem
         * @static
         * @param {gamestate.IInventoryItem} message InventoryItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InventoryItem.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.itemId != null && Object.hasOwnProperty.call(message, "itemId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.itemId);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.quantity != null && Object.hasOwnProperty.call(message, "quantity"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.quantity);
            if (message.rarity != null && Object.hasOwnProperty.call(message, "rarity"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.rarity);
            if (message.durability != null && Object.hasOwnProperty.call(message, "durability"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.durability);
            if (message.enchantmentLevel != null && Object.hasOwnProperty.call(message, "enchantmentLevel"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.enchantmentLevel);
            return writer;
        };

        /**
         * Encodes the specified InventoryItem message, length delimited. Does not implicitly {@link gamestate.InventoryItem.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.InventoryItem
         * @static
         * @param {gamestate.IInventoryItem} message InventoryItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InventoryItem.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an InventoryItem message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.InventoryItem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.InventoryItem} InventoryItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InventoryItem.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.InventoryItem();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.itemId = reader.string();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.quantity = reader.uint32();
                        break;
                    }
                case 4: {
                        message.rarity = reader.int32();
                        break;
                    }
                case 5: {
                        message.durability = reader.uint32();
                        break;
                    }
                case 6: {
                        message.enchantmentLevel = reader.uint32();
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
         * Decodes an InventoryItem message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.InventoryItem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.InventoryItem} InventoryItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InventoryItem.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an InventoryItem message.
         * @function verify
         * @memberof gamestate.InventoryItem
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        InventoryItem.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.itemId != null && message.hasOwnProperty("itemId"))
                if (!$util.isString(message.itemId))
                    return "itemId: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.quantity != null && message.hasOwnProperty("quantity"))
                if (!$util.isInteger(message.quantity))
                    return "quantity: integer expected";
            if (message.rarity != null && message.hasOwnProperty("rarity"))
                switch (message.rarity) {
                default:
                    return "rarity: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                }
            if (message.durability != null && message.hasOwnProperty("durability")) {
                properties._durability = 1;
                if (!$util.isInteger(message.durability))
                    return "durability: integer expected";
            }
            if (message.enchantmentLevel != null && message.hasOwnProperty("enchantmentLevel")) {
                properties._enchantmentLevel = 1;
                if (!$util.isInteger(message.enchantmentLevel))
                    return "enchantmentLevel: integer expected";
            }
            return null;
        };

        /**
         * Creates an InventoryItem message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.InventoryItem
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.InventoryItem} InventoryItem
         */
        InventoryItem.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.InventoryItem)
                return object;
            let message = new $root.gamestate.InventoryItem();
            if (object.itemId != null)
                message.itemId = String(object.itemId);
            if (object.name != null)
                message.name = String(object.name);
            if (object.quantity != null)
                message.quantity = object.quantity >>> 0;
            switch (object.rarity) {
            default:
                if (typeof object.rarity === "number") {
                    message.rarity = object.rarity;
                    break;
                }
                break;
            case "ITEM_RARITY_UNSPECIFIED":
            case 0:
                message.rarity = 0;
                break;
            case "COMMON":
            case 1:
                message.rarity = 1;
                break;
            case "UNCOMMON":
            case 2:
                message.rarity = 2;
                break;
            case "RARE":
            case 3:
                message.rarity = 3;
                break;
            case "EPIC":
            case 4:
                message.rarity = 4;
                break;
            case "LEGENDARY":
            case 5:
                message.rarity = 5;
                break;
            }
            if (object.durability != null)
                message.durability = object.durability >>> 0;
            if (object.enchantmentLevel != null)
                message.enchantmentLevel = object.enchantmentLevel >>> 0;
            return message;
        };

        /**
         * Creates a plain object from an InventoryItem message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.InventoryItem
         * @static
         * @param {gamestate.InventoryItem} message InventoryItem
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        InventoryItem.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.itemId = "";
                object.name = "";
                object.quantity = 0;
                object.rarity = options.enums === String ? "ITEM_RARITY_UNSPECIFIED" : 0;
            }
            if (message.itemId != null && message.hasOwnProperty("itemId"))
                object.itemId = message.itemId;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.quantity != null && message.hasOwnProperty("quantity"))
                object.quantity = message.quantity;
            if (message.rarity != null && message.hasOwnProperty("rarity"))
                object.rarity = options.enums === String ? $root.gamestate.ItemRarity[message.rarity] === undefined ? message.rarity : $root.gamestate.ItemRarity[message.rarity] : message.rarity;
            if (message.durability != null && message.hasOwnProperty("durability")) {
                object.durability = message.durability;
                if (options.oneofs)
                    object._durability = "durability";
            }
            if (message.enchantmentLevel != null && message.hasOwnProperty("enchantmentLevel")) {
                object.enchantmentLevel = message.enchantmentLevel;
                if (options.oneofs)
                    object._enchantmentLevel = "enchantmentLevel";
            }
            return object;
        };

        /**
         * Converts this InventoryItem to JSON.
         * @function toJSON
         * @memberof gamestate.InventoryItem
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        InventoryItem.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for InventoryItem
         * @function getTypeUrl
         * @memberof gamestate.InventoryItem
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        InventoryItem.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.InventoryItem";
        };

        return InventoryItem;
    })();

    gamestate.Equipment = (function() {

        /**
         * Properties of an Equipment.
         * @memberof gamestate
         * @interface IEquipment
         * @property {gamestate.WeaponType|null} [weapon] Equipment weapon
         * @property {string|null} [armor] Equipment armor
         * @property {string|null} [accessory1] Equipment accessory1
         * @property {string|null} [accessory2] Equipment accessory2
         */

        /**
         * Constructs a new Equipment.
         * @memberof gamestate
         * @classdesc Represents an Equipment.
         * @implements IEquipment
         * @constructor
         * @param {gamestate.IEquipment=} [properties] Properties to set
         */
        function Equipment(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Equipment weapon.
         * @member {gamestate.WeaponType|null|undefined} weapon
         * @memberof gamestate.Equipment
         * @instance
         */
        Equipment.prototype.weapon = null;

        /**
         * Equipment armor.
         * @member {string|null|undefined} armor
         * @memberof gamestate.Equipment
         * @instance
         */
        Equipment.prototype.armor = null;

        /**
         * Equipment accessory1.
         * @member {string|null|undefined} accessory1
         * @memberof gamestate.Equipment
         * @instance
         */
        Equipment.prototype.accessory1 = null;

        /**
         * Equipment accessory2.
         * @member {string|null|undefined} accessory2
         * @memberof gamestate.Equipment
         * @instance
         */
        Equipment.prototype.accessory2 = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Equipment.prototype, "_weapon", {
            get: $util.oneOfGetter($oneOfFields = ["weapon"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Equipment.prototype, "_armor", {
            get: $util.oneOfGetter($oneOfFields = ["armor"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Equipment.prototype, "_accessory1", {
            get: $util.oneOfGetter($oneOfFields = ["accessory1"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Equipment.prototype, "_accessory2", {
            get: $util.oneOfGetter($oneOfFields = ["accessory2"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Equipment instance using the specified properties.
         * @function create
         * @memberof gamestate.Equipment
         * @static
         * @param {gamestate.IEquipment=} [properties] Properties to set
         * @returns {gamestate.Equipment} Equipment instance
         */
        Equipment.create = function create(properties) {
            return new Equipment(properties);
        };

        /**
         * Encodes the specified Equipment message. Does not implicitly {@link gamestate.Equipment.verify|verify} messages.
         * @function encode
         * @memberof gamestate.Equipment
         * @static
         * @param {gamestate.IEquipment} message Equipment message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Equipment.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.weapon != null && Object.hasOwnProperty.call(message, "weapon"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.weapon);
            if (message.armor != null && Object.hasOwnProperty.call(message, "armor"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.armor);
            if (message.accessory1 != null && Object.hasOwnProperty.call(message, "accessory1"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.accessory1);
            if (message.accessory2 != null && Object.hasOwnProperty.call(message, "accessory2"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.accessory2);
            return writer;
        };

        /**
         * Encodes the specified Equipment message, length delimited. Does not implicitly {@link gamestate.Equipment.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.Equipment
         * @static
         * @param {gamestate.IEquipment} message Equipment message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Equipment.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Equipment message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.Equipment
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.Equipment} Equipment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Equipment.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.Equipment();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.weapon = reader.int32();
                        break;
                    }
                case 2: {
                        message.armor = reader.string();
                        break;
                    }
                case 3: {
                        message.accessory1 = reader.string();
                        break;
                    }
                case 4: {
                        message.accessory2 = reader.string();
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
         * Decodes an Equipment message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.Equipment
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.Equipment} Equipment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Equipment.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Equipment message.
         * @function verify
         * @memberof gamestate.Equipment
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Equipment.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.weapon != null && message.hasOwnProperty("weapon")) {
                properties._weapon = 1;
                switch (message.weapon) {
                default:
                    return "weapon: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                }
            }
            if (message.armor != null && message.hasOwnProperty("armor")) {
                properties._armor = 1;
                if (!$util.isString(message.armor))
                    return "armor: string expected";
            }
            if (message.accessory1 != null && message.hasOwnProperty("accessory1")) {
                properties._accessory1 = 1;
                if (!$util.isString(message.accessory1))
                    return "accessory1: string expected";
            }
            if (message.accessory2 != null && message.hasOwnProperty("accessory2")) {
                properties._accessory2 = 1;
                if (!$util.isString(message.accessory2))
                    return "accessory2: string expected";
            }
            return null;
        };

        /**
         * Creates an Equipment message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.Equipment
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.Equipment} Equipment
         */
        Equipment.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.Equipment)
                return object;
            let message = new $root.gamestate.Equipment();
            switch (object.weapon) {
            default:
                if (typeof object.weapon === "number") {
                    message.weapon = object.weapon;
                    break;
                }
                break;
            case "WEAPON_TYPE_UNSPECIFIED":
            case 0:
                message.weapon = 0;
                break;
            case "SWORD":
            case 1:
                message.weapon = 1;
                break;
            case "BOW":
            case 2:
                message.weapon = 2;
                break;
            case "STAFF":
            case 3:
                message.weapon = 3;
                break;
            case "DAGGER":
            case 4:
                message.weapon = 4;
                break;
            case "AXE":
            case 5:
                message.weapon = 5;
                break;
            }
            if (object.armor != null)
                message.armor = String(object.armor);
            if (object.accessory1 != null)
                message.accessory1 = String(object.accessory1);
            if (object.accessory2 != null)
                message.accessory2 = String(object.accessory2);
            return message;
        };

        /**
         * Creates a plain object from an Equipment message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.Equipment
         * @static
         * @param {gamestate.Equipment} message Equipment
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Equipment.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (message.weapon != null && message.hasOwnProperty("weapon")) {
                object.weapon = options.enums === String ? $root.gamestate.WeaponType[message.weapon] === undefined ? message.weapon : $root.gamestate.WeaponType[message.weapon] : message.weapon;
                if (options.oneofs)
                    object._weapon = "weapon";
            }
            if (message.armor != null && message.hasOwnProperty("armor")) {
                object.armor = message.armor;
                if (options.oneofs)
                    object._armor = "armor";
            }
            if (message.accessory1 != null && message.hasOwnProperty("accessory1")) {
                object.accessory1 = message.accessory1;
                if (options.oneofs)
                    object._accessory1 = "accessory1";
            }
            if (message.accessory2 != null && message.hasOwnProperty("accessory2")) {
                object.accessory2 = message.accessory2;
                if (options.oneofs)
                    object._accessory2 = "accessory2";
            }
            return object;
        };

        /**
         * Converts this Equipment to JSON.
         * @function toJSON
         * @memberof gamestate.Equipment
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Equipment.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Equipment
         * @function getTypeUrl
         * @memberof gamestate.Equipment
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Equipment.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.Equipment";
        };

        return Equipment;
    })();

    gamestate.PlayerStats = (function() {

        /**
         * Properties of a PlayerStats.
         * @memberof gamestate
         * @interface IPlayerStats
         * @property {number|null} [health] PlayerStats health
         * @property {number|null} [maxHealth] PlayerStats maxHealth
         * @property {number|null} [mana] PlayerStats mana
         * @property {number|null} [maxMana] PlayerStats maxMana
         * @property {number|null} [stamina] PlayerStats stamina
         * @property {number|null} [maxStamina] PlayerStats maxStamina
         * @property {number|null} [level] PlayerStats level
         * @property {number|null} [experience] PlayerStats experience
         * @property {number|null} [strength] PlayerStats strength
         * @property {number|null} [agility] PlayerStats agility
         * @property {number|null} [intelligence] PlayerStats intelligence
         * @property {number|null} [defense] PlayerStats defense
         */

        /**
         * Constructs a new PlayerStats.
         * @memberof gamestate
         * @classdesc Represents a PlayerStats.
         * @implements IPlayerStats
         * @constructor
         * @param {gamestate.IPlayerStats=} [properties] Properties to set
         */
        function PlayerStats(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PlayerStats health.
         * @member {number} health
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.health = 0;

        /**
         * PlayerStats maxHealth.
         * @member {number} maxHealth
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.maxHealth = 0;

        /**
         * PlayerStats mana.
         * @member {number} mana
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.mana = 0;

        /**
         * PlayerStats maxMana.
         * @member {number} maxMana
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.maxMana = 0;

        /**
         * PlayerStats stamina.
         * @member {number} stamina
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.stamina = 0;

        /**
         * PlayerStats maxStamina.
         * @member {number} maxStamina
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.maxStamina = 0;

        /**
         * PlayerStats level.
         * @member {number} level
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.level = 0;

        /**
         * PlayerStats experience.
         * @member {number} experience
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.experience = 0;

        /**
         * PlayerStats strength.
         * @member {number} strength
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.strength = 0;

        /**
         * PlayerStats agility.
         * @member {number} agility
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.agility = 0;

        /**
         * PlayerStats intelligence.
         * @member {number} intelligence
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.intelligence = 0;

        /**
         * PlayerStats defense.
         * @member {number} defense
         * @memberof gamestate.PlayerStats
         * @instance
         */
        PlayerStats.prototype.defense = 0;

        /**
         * Creates a new PlayerStats instance using the specified properties.
         * @function create
         * @memberof gamestate.PlayerStats
         * @static
         * @param {gamestate.IPlayerStats=} [properties] Properties to set
         * @returns {gamestate.PlayerStats} PlayerStats instance
         */
        PlayerStats.create = function create(properties) {
            return new PlayerStats(properties);
        };

        /**
         * Encodes the specified PlayerStats message. Does not implicitly {@link gamestate.PlayerStats.verify|verify} messages.
         * @function encode
         * @memberof gamestate.PlayerStats
         * @static
         * @param {gamestate.IPlayerStats} message PlayerStats message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerStats.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.health != null && Object.hasOwnProperty.call(message, "health"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.health);
            if (message.maxHealth != null && Object.hasOwnProperty.call(message, "maxHealth"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.maxHealth);
            if (message.mana != null && Object.hasOwnProperty.call(message, "mana"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.mana);
            if (message.maxMana != null && Object.hasOwnProperty.call(message, "maxMana"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.maxMana);
            if (message.stamina != null && Object.hasOwnProperty.call(message, "stamina"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.stamina);
            if (message.maxStamina != null && Object.hasOwnProperty.call(message, "maxStamina"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.maxStamina);
            if (message.level != null && Object.hasOwnProperty.call(message, "level"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.level);
            if (message.experience != null && Object.hasOwnProperty.call(message, "experience"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.experience);
            if (message.strength != null && Object.hasOwnProperty.call(message, "strength"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.strength);
            if (message.agility != null && Object.hasOwnProperty.call(message, "agility"))
                writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.agility);
            if (message.intelligence != null && Object.hasOwnProperty.call(message, "intelligence"))
                writer.uint32(/* id 11, wireType 0 =*/88).uint32(message.intelligence);
            if (message.defense != null && Object.hasOwnProperty.call(message, "defense"))
                writer.uint32(/* id 12, wireType 0 =*/96).uint32(message.defense);
            return writer;
        };

        /**
         * Encodes the specified PlayerStats message, length delimited. Does not implicitly {@link gamestate.PlayerStats.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.PlayerStats
         * @static
         * @param {gamestate.IPlayerStats} message PlayerStats message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerStats.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PlayerStats message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.PlayerStats
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.PlayerStats} PlayerStats
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerStats.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.PlayerStats();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.health = reader.uint32();
                        break;
                    }
                case 2: {
                        message.maxHealth = reader.uint32();
                        break;
                    }
                case 3: {
                        message.mana = reader.uint32();
                        break;
                    }
                case 4: {
                        message.maxMana = reader.uint32();
                        break;
                    }
                case 5: {
                        message.stamina = reader.uint32();
                        break;
                    }
                case 6: {
                        message.maxStamina = reader.uint32();
                        break;
                    }
                case 7: {
                        message.level = reader.uint32();
                        break;
                    }
                case 8: {
                        message.experience = reader.uint32();
                        break;
                    }
                case 9: {
                        message.strength = reader.uint32();
                        break;
                    }
                case 10: {
                        message.agility = reader.uint32();
                        break;
                    }
                case 11: {
                        message.intelligence = reader.uint32();
                        break;
                    }
                case 12: {
                        message.defense = reader.uint32();
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
         * Decodes a PlayerStats message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.PlayerStats
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.PlayerStats} PlayerStats
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerStats.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PlayerStats message.
         * @function verify
         * @memberof gamestate.PlayerStats
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PlayerStats.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.health != null && message.hasOwnProperty("health"))
                if (!$util.isInteger(message.health))
                    return "health: integer expected";
            if (message.maxHealth != null && message.hasOwnProperty("maxHealth"))
                if (!$util.isInteger(message.maxHealth))
                    return "maxHealth: integer expected";
            if (message.mana != null && message.hasOwnProperty("mana"))
                if (!$util.isInteger(message.mana))
                    return "mana: integer expected";
            if (message.maxMana != null && message.hasOwnProperty("maxMana"))
                if (!$util.isInteger(message.maxMana))
                    return "maxMana: integer expected";
            if (message.stamina != null && message.hasOwnProperty("stamina"))
                if (!$util.isInteger(message.stamina))
                    return "stamina: integer expected";
            if (message.maxStamina != null && message.hasOwnProperty("maxStamina"))
                if (!$util.isInteger(message.maxStamina))
                    return "maxStamina: integer expected";
            if (message.level != null && message.hasOwnProperty("level"))
                if (!$util.isInteger(message.level))
                    return "level: integer expected";
            if (message.experience != null && message.hasOwnProperty("experience"))
                if (!$util.isInteger(message.experience))
                    return "experience: integer expected";
            if (message.strength != null && message.hasOwnProperty("strength"))
                if (!$util.isInteger(message.strength))
                    return "strength: integer expected";
            if (message.agility != null && message.hasOwnProperty("agility"))
                if (!$util.isInteger(message.agility))
                    return "agility: integer expected";
            if (message.intelligence != null && message.hasOwnProperty("intelligence"))
                if (!$util.isInteger(message.intelligence))
                    return "intelligence: integer expected";
            if (message.defense != null && message.hasOwnProperty("defense"))
                if (!$util.isInteger(message.defense))
                    return "defense: integer expected";
            return null;
        };

        /**
         * Creates a PlayerStats message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.PlayerStats
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.PlayerStats} PlayerStats
         */
        PlayerStats.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.PlayerStats)
                return object;
            let message = new $root.gamestate.PlayerStats();
            if (object.health != null)
                message.health = object.health >>> 0;
            if (object.maxHealth != null)
                message.maxHealth = object.maxHealth >>> 0;
            if (object.mana != null)
                message.mana = object.mana >>> 0;
            if (object.maxMana != null)
                message.maxMana = object.maxMana >>> 0;
            if (object.stamina != null)
                message.stamina = object.stamina >>> 0;
            if (object.maxStamina != null)
                message.maxStamina = object.maxStamina >>> 0;
            if (object.level != null)
                message.level = object.level >>> 0;
            if (object.experience != null)
                message.experience = object.experience >>> 0;
            if (object.strength != null)
                message.strength = object.strength >>> 0;
            if (object.agility != null)
                message.agility = object.agility >>> 0;
            if (object.intelligence != null)
                message.intelligence = object.intelligence >>> 0;
            if (object.defense != null)
                message.defense = object.defense >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a PlayerStats message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.PlayerStats
         * @static
         * @param {gamestate.PlayerStats} message PlayerStats
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayerStats.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.health = 0;
                object.maxHealth = 0;
                object.mana = 0;
                object.maxMana = 0;
                object.stamina = 0;
                object.maxStamina = 0;
                object.level = 0;
                object.experience = 0;
                object.strength = 0;
                object.agility = 0;
                object.intelligence = 0;
                object.defense = 0;
            }
            if (message.health != null && message.hasOwnProperty("health"))
                object.health = message.health;
            if (message.maxHealth != null && message.hasOwnProperty("maxHealth"))
                object.maxHealth = message.maxHealth;
            if (message.mana != null && message.hasOwnProperty("mana"))
                object.mana = message.mana;
            if (message.maxMana != null && message.hasOwnProperty("maxMana"))
                object.maxMana = message.maxMana;
            if (message.stamina != null && message.hasOwnProperty("stamina"))
                object.stamina = message.stamina;
            if (message.maxStamina != null && message.hasOwnProperty("maxStamina"))
                object.maxStamina = message.maxStamina;
            if (message.level != null && message.hasOwnProperty("level"))
                object.level = message.level;
            if (message.experience != null && message.hasOwnProperty("experience"))
                object.experience = message.experience;
            if (message.strength != null && message.hasOwnProperty("strength"))
                object.strength = message.strength;
            if (message.agility != null && message.hasOwnProperty("agility"))
                object.agility = message.agility;
            if (message.intelligence != null && message.hasOwnProperty("intelligence"))
                object.intelligence = message.intelligence;
            if (message.defense != null && message.hasOwnProperty("defense"))
                object.defense = message.defense;
            return object;
        };

        /**
         * Converts this PlayerStats to JSON.
         * @function toJSON
         * @memberof gamestate.PlayerStats
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PlayerStats.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PlayerStats
         * @function getTypeUrl
         * @memberof gamestate.PlayerStats
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PlayerStats.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.PlayerStats";
        };

        return PlayerStats;
    })();

    gamestate.ActiveEffect = (function() {

        /**
         * Properties of an ActiveEffect.
         * @memberof gamestate
         * @interface IActiveEffect
         * @property {gamestate.EffectType|null} [effectType] ActiveEffect effectType
         * @property {number|null} [duration] ActiveEffect duration
         * @property {number|null} [strength] ActiveEffect strength
         * @property {number|null} [stackCount] ActiveEffect stackCount
         */

        /**
         * Constructs a new ActiveEffect.
         * @memberof gamestate
         * @classdesc Represents an ActiveEffect.
         * @implements IActiveEffect
         * @constructor
         * @param {gamestate.IActiveEffect=} [properties] Properties to set
         */
        function ActiveEffect(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ActiveEffect effectType.
         * @member {gamestate.EffectType} effectType
         * @memberof gamestate.ActiveEffect
         * @instance
         */
        ActiveEffect.prototype.effectType = 0;

        /**
         * ActiveEffect duration.
         * @member {number} duration
         * @memberof gamestate.ActiveEffect
         * @instance
         */
        ActiveEffect.prototype.duration = 0;

        /**
         * ActiveEffect strength.
         * @member {number} strength
         * @memberof gamestate.ActiveEffect
         * @instance
         */
        ActiveEffect.prototype.strength = 0;

        /**
         * ActiveEffect stackCount.
         * @member {number} stackCount
         * @memberof gamestate.ActiveEffect
         * @instance
         */
        ActiveEffect.prototype.stackCount = 0;

        /**
         * Creates a new ActiveEffect instance using the specified properties.
         * @function create
         * @memberof gamestate.ActiveEffect
         * @static
         * @param {gamestate.IActiveEffect=} [properties] Properties to set
         * @returns {gamestate.ActiveEffect} ActiveEffect instance
         */
        ActiveEffect.create = function create(properties) {
            return new ActiveEffect(properties);
        };

        /**
         * Encodes the specified ActiveEffect message. Does not implicitly {@link gamestate.ActiveEffect.verify|verify} messages.
         * @function encode
         * @memberof gamestate.ActiveEffect
         * @static
         * @param {gamestate.IActiveEffect} message ActiveEffect message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActiveEffect.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.effectType != null && Object.hasOwnProperty.call(message, "effectType"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.effectType);
            if (message.duration != null && Object.hasOwnProperty.call(message, "duration"))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.duration);
            if (message.strength != null && Object.hasOwnProperty.call(message, "strength"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.strength);
            if (message.stackCount != null && Object.hasOwnProperty.call(message, "stackCount"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.stackCount);
            return writer;
        };

        /**
         * Encodes the specified ActiveEffect message, length delimited. Does not implicitly {@link gamestate.ActiveEffect.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.ActiveEffect
         * @static
         * @param {gamestate.IActiveEffect} message ActiveEffect message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActiveEffect.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ActiveEffect message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.ActiveEffect
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.ActiveEffect} ActiveEffect
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActiveEffect.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.ActiveEffect();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.effectType = reader.int32();
                        break;
                    }
                case 2: {
                        message.duration = reader.float();
                        break;
                    }
                case 3: {
                        message.strength = reader.uint32();
                        break;
                    }
                case 4: {
                        message.stackCount = reader.uint32();
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
         * Decodes an ActiveEffect message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.ActiveEffect
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.ActiveEffect} ActiveEffect
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActiveEffect.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ActiveEffect message.
         * @function verify
         * @memberof gamestate.ActiveEffect
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ActiveEffect.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.effectType != null && message.hasOwnProperty("effectType"))
                switch (message.effectType) {
                default:
                    return "effectType: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.duration != null && message.hasOwnProperty("duration"))
                if (typeof message.duration !== "number")
                    return "duration: number expected";
            if (message.strength != null && message.hasOwnProperty("strength"))
                if (!$util.isInteger(message.strength))
                    return "strength: integer expected";
            if (message.stackCount != null && message.hasOwnProperty("stackCount"))
                if (!$util.isInteger(message.stackCount))
                    return "stackCount: integer expected";
            return null;
        };

        /**
         * Creates an ActiveEffect message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.ActiveEffect
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.ActiveEffect} ActiveEffect
         */
        ActiveEffect.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.ActiveEffect)
                return object;
            let message = new $root.gamestate.ActiveEffect();
            switch (object.effectType) {
            default:
                if (typeof object.effectType === "number") {
                    message.effectType = object.effectType;
                    break;
                }
                break;
            case "EFFECT_TYPE_UNSPECIFIED":
            case 0:
                message.effectType = 0;
                break;
            case "POISON":
            case 1:
                message.effectType = 1;
                break;
            case "BURN":
            case 2:
                message.effectType = 2;
                break;
            case "FREEZE":
            case 3:
                message.effectType = 3;
                break;
            case "STUN":
            case 4:
                message.effectType = 4;
                break;
            case "REGEN":
            case 5:
                message.effectType = 5;
                break;
            case "HASTE":
            case 6:
                message.effectType = 6;
                break;
            }
            if (object.duration != null)
                message.duration = Number(object.duration);
            if (object.strength != null)
                message.strength = object.strength >>> 0;
            if (object.stackCount != null)
                message.stackCount = object.stackCount >>> 0;
            return message;
        };

        /**
         * Creates a plain object from an ActiveEffect message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.ActiveEffect
         * @static
         * @param {gamestate.ActiveEffect} message ActiveEffect
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ActiveEffect.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.effectType = options.enums === String ? "EFFECT_TYPE_UNSPECIFIED" : 0;
                object.duration = 0;
                object.strength = 0;
                object.stackCount = 0;
            }
            if (message.effectType != null && message.hasOwnProperty("effectType"))
                object.effectType = options.enums === String ? $root.gamestate.EffectType[message.effectType] === undefined ? message.effectType : $root.gamestate.EffectType[message.effectType] : message.effectType;
            if (message.duration != null && message.hasOwnProperty("duration"))
                object.duration = options.json && !isFinite(message.duration) ? String(message.duration) : message.duration;
            if (message.strength != null && message.hasOwnProperty("strength"))
                object.strength = message.strength;
            if (message.stackCount != null && message.hasOwnProperty("stackCount"))
                object.stackCount = message.stackCount;
            return object;
        };

        /**
         * Converts this ActiveEffect to JSON.
         * @function toJSON
         * @memberof gamestate.ActiveEffect
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ActiveEffect.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ActiveEffect
         * @function getTypeUrl
         * @memberof gamestate.ActiveEffect
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ActiveEffect.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.ActiveEffect";
        };

        return ActiveEffect;
    })();

    gamestate.AbilityCooldown = (function() {

        /**
         * Properties of an AbilityCooldown.
         * @memberof gamestate
         * @interface IAbilityCooldown
         * @property {string|null} [abilityId] AbilityCooldown abilityId
         * @property {gamestate.AbilityType|null} [abilityType] AbilityCooldown abilityType
         * @property {number|null} [remainingCooldown] AbilityCooldown remainingCooldown
         */

        /**
         * Constructs a new AbilityCooldown.
         * @memberof gamestate
         * @classdesc Represents an AbilityCooldown.
         * @implements IAbilityCooldown
         * @constructor
         * @param {gamestate.IAbilityCooldown=} [properties] Properties to set
         */
        function AbilityCooldown(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AbilityCooldown abilityId.
         * @member {string} abilityId
         * @memberof gamestate.AbilityCooldown
         * @instance
         */
        AbilityCooldown.prototype.abilityId = "";

        /**
         * AbilityCooldown abilityType.
         * @member {gamestate.AbilityType} abilityType
         * @memberof gamestate.AbilityCooldown
         * @instance
         */
        AbilityCooldown.prototype.abilityType = 0;

        /**
         * AbilityCooldown remainingCooldown.
         * @member {number} remainingCooldown
         * @memberof gamestate.AbilityCooldown
         * @instance
         */
        AbilityCooldown.prototype.remainingCooldown = 0;

        /**
         * Creates a new AbilityCooldown instance using the specified properties.
         * @function create
         * @memberof gamestate.AbilityCooldown
         * @static
         * @param {gamestate.IAbilityCooldown=} [properties] Properties to set
         * @returns {gamestate.AbilityCooldown} AbilityCooldown instance
         */
        AbilityCooldown.create = function create(properties) {
            return new AbilityCooldown(properties);
        };

        /**
         * Encodes the specified AbilityCooldown message. Does not implicitly {@link gamestate.AbilityCooldown.verify|verify} messages.
         * @function encode
         * @memberof gamestate.AbilityCooldown
         * @static
         * @param {gamestate.IAbilityCooldown} message AbilityCooldown message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AbilityCooldown.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.abilityId != null && Object.hasOwnProperty.call(message, "abilityId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.abilityId);
            if (message.abilityType != null && Object.hasOwnProperty.call(message, "abilityType"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.abilityType);
            if (message.remainingCooldown != null && Object.hasOwnProperty.call(message, "remainingCooldown"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.remainingCooldown);
            return writer;
        };

        /**
         * Encodes the specified AbilityCooldown message, length delimited. Does not implicitly {@link gamestate.AbilityCooldown.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.AbilityCooldown
         * @static
         * @param {gamestate.IAbilityCooldown} message AbilityCooldown message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AbilityCooldown.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AbilityCooldown message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.AbilityCooldown
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.AbilityCooldown} AbilityCooldown
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AbilityCooldown.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.AbilityCooldown();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.abilityId = reader.string();
                        break;
                    }
                case 2: {
                        message.abilityType = reader.int32();
                        break;
                    }
                case 3: {
                        message.remainingCooldown = reader.float();
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
         * Decodes an AbilityCooldown message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.AbilityCooldown
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.AbilityCooldown} AbilityCooldown
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AbilityCooldown.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AbilityCooldown message.
         * @function verify
         * @memberof gamestate.AbilityCooldown
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AbilityCooldown.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.abilityId != null && message.hasOwnProperty("abilityId"))
                if (!$util.isString(message.abilityId))
                    return "abilityId: string expected";
            if (message.abilityType != null && message.hasOwnProperty("abilityType"))
                switch (message.abilityType) {
                default:
                    return "abilityType: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.remainingCooldown != null && message.hasOwnProperty("remainingCooldown"))
                if (typeof message.remainingCooldown !== "number")
                    return "remainingCooldown: number expected";
            return null;
        };

        /**
         * Creates an AbilityCooldown message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.AbilityCooldown
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.AbilityCooldown} AbilityCooldown
         */
        AbilityCooldown.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.AbilityCooldown)
                return object;
            let message = new $root.gamestate.AbilityCooldown();
            if (object.abilityId != null)
                message.abilityId = String(object.abilityId);
            switch (object.abilityType) {
            default:
                if (typeof object.abilityType === "number") {
                    message.abilityType = object.abilityType;
                    break;
                }
                break;
            case "ABILITY_TYPE_UNSPECIFIED":
            case 0:
                message.abilityType = 0;
                break;
            case "HEAL":
            case 1:
                message.abilityType = 1;
                break;
            case "DAMAGE":
            case 2:
                message.abilityType = 2;
                break;
            case "SHIELD":
            case 3:
                message.abilityType = 3;
                break;
            case "BUFF":
            case 4:
                message.abilityType = 4;
                break;
            case "DEBUFF":
            case 5:
                message.abilityType = 5;
                break;
            case "TELEPORT":
            case 6:
                message.abilityType = 6;
                break;
            }
            if (object.remainingCooldown != null)
                message.remainingCooldown = Number(object.remainingCooldown);
            return message;
        };

        /**
         * Creates a plain object from an AbilityCooldown message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.AbilityCooldown
         * @static
         * @param {gamestate.AbilityCooldown} message AbilityCooldown
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AbilityCooldown.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.abilityId = "";
                object.abilityType = options.enums === String ? "ABILITY_TYPE_UNSPECIFIED" : 0;
                object.remainingCooldown = 0;
            }
            if (message.abilityId != null && message.hasOwnProperty("abilityId"))
                object.abilityId = message.abilityId;
            if (message.abilityType != null && message.hasOwnProperty("abilityType"))
                object.abilityType = options.enums === String ? $root.gamestate.AbilityType[message.abilityType] === undefined ? message.abilityType : $root.gamestate.AbilityType[message.abilityType] : message.abilityType;
            if (message.remainingCooldown != null && message.hasOwnProperty("remainingCooldown"))
                object.remainingCooldown = options.json && !isFinite(message.remainingCooldown) ? String(message.remainingCooldown) : message.remainingCooldown;
            return object;
        };

        /**
         * Converts this AbilityCooldown to JSON.
         * @function toJSON
         * @memberof gamestate.AbilityCooldown
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AbilityCooldown.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for AbilityCooldown
         * @function getTypeUrl
         * @memberof gamestate.AbilityCooldown
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        AbilityCooldown.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.AbilityCooldown";
        };

        return AbilityCooldown;
    })();

    gamestate.Player = (function() {

        /**
         * Properties of a Player.
         * @memberof gamestate
         * @interface IPlayer
         * @property {string|null} [playerId] Player playerId
         * @property {string|null} [username] Player username
         * @property {gamestate.Team|null} [team] Player team
         * @property {gamestate.PlayerStatus|null} [status] Player status
         * @property {gamestate.IPosition|null} [position] Player position
         * @property {gamestate.IVelocity|null} [velocity] Player velocity
         * @property {number|null} [rotation] Player rotation
         * @property {gamestate.IPlayerStats|null} [stats] Player stats
         * @property {Array.<gamestate.IInventoryItem>|null} [inventory] Player inventory
         * @property {gamestate.IEquipment|null} [equipment] Player equipment
         * @property {Array.<gamestate.IActiveEffect>|null} [activeEffects] Player activeEffects
         * @property {Array.<gamestate.IAbilityCooldown>|null} [abilityCooldowns] Player abilityCooldowns
         * @property {number|null} [kills] Player kills
         * @property {number|null} [deaths] Player deaths
         * @property {number|null} [assists] Player assists
         * @property {number|null} [gold] Player gold
         * @property {number|null} [score] Player score
         * @property {number|null} [ping] Player ping
         * @property {boolean|null} [isJumping] Player isJumping
         * @property {boolean|null} [isCrouching] Player isCrouching
         * @property {boolean|null} [isAiming] Player isAiming
         * @property {number|null} [lastDamageTime] Player lastDamageTime
         * @property {number|null} [respawnTime] Player respawnTime
         */

        /**
         * Constructs a new Player.
         * @memberof gamestate
         * @classdesc Represents a Player.
         * @implements IPlayer
         * @constructor
         * @param {gamestate.IPlayer=} [properties] Properties to set
         */
        function Player(properties) {
            this.inventory = [];
            this.activeEffects = [];
            this.abilityCooldowns = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Player playerId.
         * @member {string} playerId
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.playerId = "";

        /**
         * Player username.
         * @member {string} username
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.username = "";

        /**
         * Player team.
         * @member {gamestate.Team|null|undefined} team
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.team = null;

        /**
         * Player status.
         * @member {gamestate.PlayerStatus} status
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.status = 0;

        /**
         * Player position.
         * @member {gamestate.IPosition|null|undefined} position
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.position = null;

        /**
         * Player velocity.
         * @member {gamestate.IVelocity|null|undefined} velocity
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.velocity = null;

        /**
         * Player rotation.
         * @member {number} rotation
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.rotation = 0;

        /**
         * Player stats.
         * @member {gamestate.IPlayerStats|null|undefined} stats
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.stats = null;

        /**
         * Player inventory.
         * @member {Array.<gamestate.IInventoryItem>} inventory
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.inventory = $util.emptyArray;

        /**
         * Player equipment.
         * @member {gamestate.IEquipment|null|undefined} equipment
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.equipment = null;

        /**
         * Player activeEffects.
         * @member {Array.<gamestate.IActiveEffect>} activeEffects
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.activeEffects = $util.emptyArray;

        /**
         * Player abilityCooldowns.
         * @member {Array.<gamestate.IAbilityCooldown>} abilityCooldowns
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.abilityCooldowns = $util.emptyArray;

        /**
         * Player kills.
         * @member {number} kills
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.kills = 0;

        /**
         * Player deaths.
         * @member {number} deaths
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.deaths = 0;

        /**
         * Player assists.
         * @member {number} assists
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.assists = 0;

        /**
         * Player gold.
         * @member {number} gold
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.gold = 0;

        /**
         * Player score.
         * @member {number} score
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.score = 0;

        /**
         * Player ping.
         * @member {number} ping
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.ping = 0;

        /**
         * Player isJumping.
         * @member {boolean} isJumping
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.isJumping = false;

        /**
         * Player isCrouching.
         * @member {boolean} isCrouching
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.isCrouching = false;

        /**
         * Player isAiming.
         * @member {boolean} isAiming
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.isAiming = false;

        /**
         * Player lastDamageTime.
         * @member {number|null|undefined} lastDamageTime
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.lastDamageTime = null;

        /**
         * Player respawnTime.
         * @member {number|null|undefined} respawnTime
         * @memberof gamestate.Player
         * @instance
         */
        Player.prototype.respawnTime = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Player.prototype, "_team", {
            get: $util.oneOfGetter($oneOfFields = ["team"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Player.prototype, "_lastDamageTime", {
            get: $util.oneOfGetter($oneOfFields = ["lastDamageTime"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Player.prototype, "_respawnTime", {
            get: $util.oneOfGetter($oneOfFields = ["respawnTime"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Player instance using the specified properties.
         * @function create
         * @memberof gamestate.Player
         * @static
         * @param {gamestate.IPlayer=} [properties] Properties to set
         * @returns {gamestate.Player} Player instance
         */
        Player.create = function create(properties) {
            return new Player(properties);
        };

        /**
         * Encodes the specified Player message. Does not implicitly {@link gamestate.Player.verify|verify} messages.
         * @function encode
         * @memberof gamestate.Player
         * @static
         * @param {gamestate.IPlayer} message Player message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Player.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerId != null && Object.hasOwnProperty.call(message, "playerId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.playerId);
            if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
            if (message.team != null && Object.hasOwnProperty.call(message, "team"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.team);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
            if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                $root.gamestate.Position.encode(message.position, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.velocity != null && Object.hasOwnProperty.call(message, "velocity"))
                $root.gamestate.Velocity.encode(message.velocity, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.rotation != null && Object.hasOwnProperty.call(message, "rotation"))
                writer.uint32(/* id 7, wireType 5 =*/61).float(message.rotation);
            if (message.stats != null && Object.hasOwnProperty.call(message, "stats"))
                $root.gamestate.PlayerStats.encode(message.stats, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.inventory != null && message.inventory.length)
                for (let i = 0; i < message.inventory.length; ++i)
                    $root.gamestate.InventoryItem.encode(message.inventory[i], writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.equipment != null && Object.hasOwnProperty.call(message, "equipment"))
                $root.gamestate.Equipment.encode(message.equipment, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.activeEffects != null && message.activeEffects.length)
                for (let i = 0; i < message.activeEffects.length; ++i)
                    $root.gamestate.ActiveEffect.encode(message.activeEffects[i], writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.abilityCooldowns != null && message.abilityCooldowns.length)
                for (let i = 0; i < message.abilityCooldowns.length; ++i)
                    $root.gamestate.AbilityCooldown.encode(message.abilityCooldowns[i], writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            if (message.kills != null && Object.hasOwnProperty.call(message, "kills"))
                writer.uint32(/* id 13, wireType 0 =*/104).uint32(message.kills);
            if (message.deaths != null && Object.hasOwnProperty.call(message, "deaths"))
                writer.uint32(/* id 14, wireType 0 =*/112).uint32(message.deaths);
            if (message.assists != null && Object.hasOwnProperty.call(message, "assists"))
                writer.uint32(/* id 15, wireType 0 =*/120).uint32(message.assists);
            if (message.gold != null && Object.hasOwnProperty.call(message, "gold"))
                writer.uint32(/* id 16, wireType 0 =*/128).uint32(message.gold);
            if (message.score != null && Object.hasOwnProperty.call(message, "score"))
                writer.uint32(/* id 17, wireType 0 =*/136).sint32(message.score);
            if (message.ping != null && Object.hasOwnProperty.call(message, "ping"))
                writer.uint32(/* id 18, wireType 0 =*/144).uint32(message.ping);
            if (message.isJumping != null && Object.hasOwnProperty.call(message, "isJumping"))
                writer.uint32(/* id 19, wireType 0 =*/152).bool(message.isJumping);
            if (message.isCrouching != null && Object.hasOwnProperty.call(message, "isCrouching"))
                writer.uint32(/* id 20, wireType 0 =*/160).bool(message.isCrouching);
            if (message.isAiming != null && Object.hasOwnProperty.call(message, "isAiming"))
                writer.uint32(/* id 21, wireType 0 =*/168).bool(message.isAiming);
            if (message.lastDamageTime != null && Object.hasOwnProperty.call(message, "lastDamageTime"))
                writer.uint32(/* id 22, wireType 5 =*/181).float(message.lastDamageTime);
            if (message.respawnTime != null && Object.hasOwnProperty.call(message, "respawnTime"))
                writer.uint32(/* id 23, wireType 5 =*/189).float(message.respawnTime);
            return writer;
        };

        /**
         * Encodes the specified Player message, length delimited. Does not implicitly {@link gamestate.Player.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.Player
         * @static
         * @param {gamestate.IPlayer} message Player message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Player.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Player message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.Player
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.Player} Player
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Player.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.Player();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerId = reader.string();
                        break;
                    }
                case 2: {
                        message.username = reader.string();
                        break;
                    }
                case 3: {
                        message.team = reader.int32();
                        break;
                    }
                case 4: {
                        message.status = reader.int32();
                        break;
                    }
                case 5: {
                        message.position = $root.gamestate.Position.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.velocity = $root.gamestate.Velocity.decode(reader, reader.uint32());
                        break;
                    }
                case 7: {
                        message.rotation = reader.float();
                        break;
                    }
                case 8: {
                        message.stats = $root.gamestate.PlayerStats.decode(reader, reader.uint32());
                        break;
                    }
                case 9: {
                        if (!(message.inventory && message.inventory.length))
                            message.inventory = [];
                        message.inventory.push($root.gamestate.InventoryItem.decode(reader, reader.uint32()));
                        break;
                    }
                case 10: {
                        message.equipment = $root.gamestate.Equipment.decode(reader, reader.uint32());
                        break;
                    }
                case 11: {
                        if (!(message.activeEffects && message.activeEffects.length))
                            message.activeEffects = [];
                        message.activeEffects.push($root.gamestate.ActiveEffect.decode(reader, reader.uint32()));
                        break;
                    }
                case 12: {
                        if (!(message.abilityCooldowns && message.abilityCooldowns.length))
                            message.abilityCooldowns = [];
                        message.abilityCooldowns.push($root.gamestate.AbilityCooldown.decode(reader, reader.uint32()));
                        break;
                    }
                case 13: {
                        message.kills = reader.uint32();
                        break;
                    }
                case 14: {
                        message.deaths = reader.uint32();
                        break;
                    }
                case 15: {
                        message.assists = reader.uint32();
                        break;
                    }
                case 16: {
                        message.gold = reader.uint32();
                        break;
                    }
                case 17: {
                        message.score = reader.sint32();
                        break;
                    }
                case 18: {
                        message.ping = reader.uint32();
                        break;
                    }
                case 19: {
                        message.isJumping = reader.bool();
                        break;
                    }
                case 20: {
                        message.isCrouching = reader.bool();
                        break;
                    }
                case 21: {
                        message.isAiming = reader.bool();
                        break;
                    }
                case 22: {
                        message.lastDamageTime = reader.float();
                        break;
                    }
                case 23: {
                        message.respawnTime = reader.float();
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
         * Decodes a Player message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.Player
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.Player} Player
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Player.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Player message.
         * @function verify
         * @memberof gamestate.Player
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Player.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.playerId != null && message.hasOwnProperty("playerId"))
                if (!$util.isString(message.playerId))
                    return "playerId: string expected";
            if (message.username != null && message.hasOwnProperty("username"))
                if (!$util.isString(message.username))
                    return "username: string expected";
            if (message.team != null && message.hasOwnProperty("team")) {
                properties._team = 1;
                switch (message.team) {
                default:
                    return "team: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            }
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            if (message.position != null && message.hasOwnProperty("position")) {
                let error = $root.gamestate.Position.verify(message.position);
                if (error)
                    return "position." + error;
            }
            if (message.velocity != null && message.hasOwnProperty("velocity")) {
                let error = $root.gamestate.Velocity.verify(message.velocity);
                if (error)
                    return "velocity." + error;
            }
            if (message.rotation != null && message.hasOwnProperty("rotation"))
                if (typeof message.rotation !== "number")
                    return "rotation: number expected";
            if (message.stats != null && message.hasOwnProperty("stats")) {
                let error = $root.gamestate.PlayerStats.verify(message.stats);
                if (error)
                    return "stats." + error;
            }
            if (message.inventory != null && message.hasOwnProperty("inventory")) {
                if (!Array.isArray(message.inventory))
                    return "inventory: array expected";
                for (let i = 0; i < message.inventory.length; ++i) {
                    let error = $root.gamestate.InventoryItem.verify(message.inventory[i]);
                    if (error)
                        return "inventory." + error;
                }
            }
            if (message.equipment != null && message.hasOwnProperty("equipment")) {
                let error = $root.gamestate.Equipment.verify(message.equipment);
                if (error)
                    return "equipment." + error;
            }
            if (message.activeEffects != null && message.hasOwnProperty("activeEffects")) {
                if (!Array.isArray(message.activeEffects))
                    return "activeEffects: array expected";
                for (let i = 0; i < message.activeEffects.length; ++i) {
                    let error = $root.gamestate.ActiveEffect.verify(message.activeEffects[i]);
                    if (error)
                        return "activeEffects." + error;
                }
            }
            if (message.abilityCooldowns != null && message.hasOwnProperty("abilityCooldowns")) {
                if (!Array.isArray(message.abilityCooldowns))
                    return "abilityCooldowns: array expected";
                for (let i = 0; i < message.abilityCooldowns.length; ++i) {
                    let error = $root.gamestate.AbilityCooldown.verify(message.abilityCooldowns[i]);
                    if (error)
                        return "abilityCooldowns." + error;
                }
            }
            if (message.kills != null && message.hasOwnProperty("kills"))
                if (!$util.isInteger(message.kills))
                    return "kills: integer expected";
            if (message.deaths != null && message.hasOwnProperty("deaths"))
                if (!$util.isInteger(message.deaths))
                    return "deaths: integer expected";
            if (message.assists != null && message.hasOwnProperty("assists"))
                if (!$util.isInteger(message.assists))
                    return "assists: integer expected";
            if (message.gold != null && message.hasOwnProperty("gold"))
                if (!$util.isInteger(message.gold))
                    return "gold: integer expected";
            if (message.score != null && message.hasOwnProperty("score"))
                if (!$util.isInteger(message.score))
                    return "score: integer expected";
            if (message.ping != null && message.hasOwnProperty("ping"))
                if (!$util.isInteger(message.ping))
                    return "ping: integer expected";
            if (message.isJumping != null && message.hasOwnProperty("isJumping"))
                if (typeof message.isJumping !== "boolean")
                    return "isJumping: boolean expected";
            if (message.isCrouching != null && message.hasOwnProperty("isCrouching"))
                if (typeof message.isCrouching !== "boolean")
                    return "isCrouching: boolean expected";
            if (message.isAiming != null && message.hasOwnProperty("isAiming"))
                if (typeof message.isAiming !== "boolean")
                    return "isAiming: boolean expected";
            if (message.lastDamageTime != null && message.hasOwnProperty("lastDamageTime")) {
                properties._lastDamageTime = 1;
                if (typeof message.lastDamageTime !== "number")
                    return "lastDamageTime: number expected";
            }
            if (message.respawnTime != null && message.hasOwnProperty("respawnTime")) {
                properties._respawnTime = 1;
                if (typeof message.respawnTime !== "number")
                    return "respawnTime: number expected";
            }
            return null;
        };

        /**
         * Creates a Player message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.Player
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.Player} Player
         */
        Player.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.Player)
                return object;
            let message = new $root.gamestate.Player();
            if (object.playerId != null)
                message.playerId = String(object.playerId);
            if (object.username != null)
                message.username = String(object.username);
            switch (object.team) {
            default:
                if (typeof object.team === "number") {
                    message.team = object.team;
                    break;
                }
                break;
            case "TEAM_UNSPECIFIED":
            case 0:
                message.team = 0;
                break;
            case "RED":
            case 1:
                message.team = 1;
                break;
            case "BLUE":
            case 2:
                message.team = 2;
                break;
            case "GREEN":
            case 3:
                message.team = 3;
                break;
            case "YELLOW":
            case 4:
                message.team = 4;
                break;
            }
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "PLAYER_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ALIVE":
            case 1:
                message.status = 1;
                break;
            case "DEAD":
            case 2:
                message.status = 2;
                break;
            case "SPECTATING":
            case 3:
                message.status = 3;
                break;
            case "DISCONNECTED":
            case 4:
                message.status = 4;
                break;
            }
            if (object.position != null) {
                if (typeof object.position !== "object")
                    throw TypeError(".gamestate.Player.position: object expected");
                message.position = $root.gamestate.Position.fromObject(object.position);
            }
            if (object.velocity != null) {
                if (typeof object.velocity !== "object")
                    throw TypeError(".gamestate.Player.velocity: object expected");
                message.velocity = $root.gamestate.Velocity.fromObject(object.velocity);
            }
            if (object.rotation != null)
                message.rotation = Number(object.rotation);
            if (object.stats != null) {
                if (typeof object.stats !== "object")
                    throw TypeError(".gamestate.Player.stats: object expected");
                message.stats = $root.gamestate.PlayerStats.fromObject(object.stats);
            }
            if (object.inventory) {
                if (!Array.isArray(object.inventory))
                    throw TypeError(".gamestate.Player.inventory: array expected");
                message.inventory = [];
                for (let i = 0; i < object.inventory.length; ++i) {
                    if (typeof object.inventory[i] !== "object")
                        throw TypeError(".gamestate.Player.inventory: object expected");
                    message.inventory[i] = $root.gamestate.InventoryItem.fromObject(object.inventory[i]);
                }
            }
            if (object.equipment != null) {
                if (typeof object.equipment !== "object")
                    throw TypeError(".gamestate.Player.equipment: object expected");
                message.equipment = $root.gamestate.Equipment.fromObject(object.equipment);
            }
            if (object.activeEffects) {
                if (!Array.isArray(object.activeEffects))
                    throw TypeError(".gamestate.Player.activeEffects: array expected");
                message.activeEffects = [];
                for (let i = 0; i < object.activeEffects.length; ++i) {
                    if (typeof object.activeEffects[i] !== "object")
                        throw TypeError(".gamestate.Player.activeEffects: object expected");
                    message.activeEffects[i] = $root.gamestate.ActiveEffect.fromObject(object.activeEffects[i]);
                }
            }
            if (object.abilityCooldowns) {
                if (!Array.isArray(object.abilityCooldowns))
                    throw TypeError(".gamestate.Player.abilityCooldowns: array expected");
                message.abilityCooldowns = [];
                for (let i = 0; i < object.abilityCooldowns.length; ++i) {
                    if (typeof object.abilityCooldowns[i] !== "object")
                        throw TypeError(".gamestate.Player.abilityCooldowns: object expected");
                    message.abilityCooldowns[i] = $root.gamestate.AbilityCooldown.fromObject(object.abilityCooldowns[i]);
                }
            }
            if (object.kills != null)
                message.kills = object.kills >>> 0;
            if (object.deaths != null)
                message.deaths = object.deaths >>> 0;
            if (object.assists != null)
                message.assists = object.assists >>> 0;
            if (object.gold != null)
                message.gold = object.gold >>> 0;
            if (object.score != null)
                message.score = object.score | 0;
            if (object.ping != null)
                message.ping = object.ping >>> 0;
            if (object.isJumping != null)
                message.isJumping = Boolean(object.isJumping);
            if (object.isCrouching != null)
                message.isCrouching = Boolean(object.isCrouching);
            if (object.isAiming != null)
                message.isAiming = Boolean(object.isAiming);
            if (object.lastDamageTime != null)
                message.lastDamageTime = Number(object.lastDamageTime);
            if (object.respawnTime != null)
                message.respawnTime = Number(object.respawnTime);
            return message;
        };

        /**
         * Creates a plain object from a Player message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.Player
         * @static
         * @param {gamestate.Player} message Player
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Player.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.inventory = [];
                object.activeEffects = [];
                object.abilityCooldowns = [];
            }
            if (options.defaults) {
                object.playerId = "";
                object.username = "";
                object.status = options.enums === String ? "PLAYER_STATUS_UNSPECIFIED" : 0;
                object.position = null;
                object.velocity = null;
                object.rotation = 0;
                object.stats = null;
                object.equipment = null;
                object.kills = 0;
                object.deaths = 0;
                object.assists = 0;
                object.gold = 0;
                object.score = 0;
                object.ping = 0;
                object.isJumping = false;
                object.isCrouching = false;
                object.isAiming = false;
            }
            if (message.playerId != null && message.hasOwnProperty("playerId"))
                object.playerId = message.playerId;
            if (message.username != null && message.hasOwnProperty("username"))
                object.username = message.username;
            if (message.team != null && message.hasOwnProperty("team")) {
                object.team = options.enums === String ? $root.gamestate.Team[message.team] === undefined ? message.team : $root.gamestate.Team[message.team] : message.team;
                if (options.oneofs)
                    object._team = "team";
            }
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.gamestate.PlayerStatus[message.status] === undefined ? message.status : $root.gamestate.PlayerStatus[message.status] : message.status;
            if (message.position != null && message.hasOwnProperty("position"))
                object.position = $root.gamestate.Position.toObject(message.position, options);
            if (message.velocity != null && message.hasOwnProperty("velocity"))
                object.velocity = $root.gamestate.Velocity.toObject(message.velocity, options);
            if (message.rotation != null && message.hasOwnProperty("rotation"))
                object.rotation = options.json && !isFinite(message.rotation) ? String(message.rotation) : message.rotation;
            if (message.stats != null && message.hasOwnProperty("stats"))
                object.stats = $root.gamestate.PlayerStats.toObject(message.stats, options);
            if (message.inventory && message.inventory.length) {
                object.inventory = [];
                for (let j = 0; j < message.inventory.length; ++j)
                    object.inventory[j] = $root.gamestate.InventoryItem.toObject(message.inventory[j], options);
            }
            if (message.equipment != null && message.hasOwnProperty("equipment"))
                object.equipment = $root.gamestate.Equipment.toObject(message.equipment, options);
            if (message.activeEffects && message.activeEffects.length) {
                object.activeEffects = [];
                for (let j = 0; j < message.activeEffects.length; ++j)
                    object.activeEffects[j] = $root.gamestate.ActiveEffect.toObject(message.activeEffects[j], options);
            }
            if (message.abilityCooldowns && message.abilityCooldowns.length) {
                object.abilityCooldowns = [];
                for (let j = 0; j < message.abilityCooldowns.length; ++j)
                    object.abilityCooldowns[j] = $root.gamestate.AbilityCooldown.toObject(message.abilityCooldowns[j], options);
            }
            if (message.kills != null && message.hasOwnProperty("kills"))
                object.kills = message.kills;
            if (message.deaths != null && message.hasOwnProperty("deaths"))
                object.deaths = message.deaths;
            if (message.assists != null && message.hasOwnProperty("assists"))
                object.assists = message.assists;
            if (message.gold != null && message.hasOwnProperty("gold"))
                object.gold = message.gold;
            if (message.score != null && message.hasOwnProperty("score"))
                object.score = message.score;
            if (message.ping != null && message.hasOwnProperty("ping"))
                object.ping = message.ping;
            if (message.isJumping != null && message.hasOwnProperty("isJumping"))
                object.isJumping = message.isJumping;
            if (message.isCrouching != null && message.hasOwnProperty("isCrouching"))
                object.isCrouching = message.isCrouching;
            if (message.isAiming != null && message.hasOwnProperty("isAiming"))
                object.isAiming = message.isAiming;
            if (message.lastDamageTime != null && message.hasOwnProperty("lastDamageTime")) {
                object.lastDamageTime = options.json && !isFinite(message.lastDamageTime) ? String(message.lastDamageTime) : message.lastDamageTime;
                if (options.oneofs)
                    object._lastDamageTime = "lastDamageTime";
            }
            if (message.respawnTime != null && message.hasOwnProperty("respawnTime")) {
                object.respawnTime = options.json && !isFinite(message.respawnTime) ? String(message.respawnTime) : message.respawnTime;
                if (options.oneofs)
                    object._respawnTime = "respawnTime";
            }
            return object;
        };

        /**
         * Converts this Player to JSON.
         * @function toJSON
         * @memberof gamestate.Player
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Player.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Player
         * @function getTypeUrl
         * @memberof gamestate.Player
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Player.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.Player";
        };

        return Player;
    })();

    gamestate.Enemy = (function() {

        /**
         * Properties of an Enemy.
         * @memberof gamestate
         * @interface IEnemy
         * @property {string|null} [enemyId] Enemy enemyId
         * @property {string|null} [name] Enemy name
         * @property {gamestate.IPosition|null} [position] Enemy position
         * @property {gamestate.IVelocity|null} [velocity] Enemy velocity
         * @property {number|null} [health] Enemy health
         * @property {number|null} [maxHealth] Enemy maxHealth
         * @property {number|null} [level] Enemy level
         * @property {boolean|null} [isAggro] Enemy isAggro
         * @property {string|null} [targetPlayerId] Enemy targetPlayerId
         * @property {number|null} [lastAttackTime] Enemy lastAttackTime
         * @property {string|null} [lootTableId] Enemy lootTableId
         */

        /**
         * Constructs a new Enemy.
         * @memberof gamestate
         * @classdesc Represents an Enemy.
         * @implements IEnemy
         * @constructor
         * @param {gamestate.IEnemy=} [properties] Properties to set
         */
        function Enemy(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Enemy enemyId.
         * @member {string} enemyId
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.enemyId = "";

        /**
         * Enemy name.
         * @member {string} name
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.name = "";

        /**
         * Enemy position.
         * @member {gamestate.IPosition|null|undefined} position
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.position = null;

        /**
         * Enemy velocity.
         * @member {gamestate.IVelocity|null|undefined} velocity
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.velocity = null;

        /**
         * Enemy health.
         * @member {number} health
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.health = 0;

        /**
         * Enemy maxHealth.
         * @member {number} maxHealth
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.maxHealth = 0;

        /**
         * Enemy level.
         * @member {number} level
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.level = 0;

        /**
         * Enemy isAggro.
         * @member {boolean} isAggro
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.isAggro = false;

        /**
         * Enemy targetPlayerId.
         * @member {string|null|undefined} targetPlayerId
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.targetPlayerId = null;

        /**
         * Enemy lastAttackTime.
         * @member {number} lastAttackTime
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.lastAttackTime = 0;

        /**
         * Enemy lootTableId.
         * @member {string|null|undefined} lootTableId
         * @memberof gamestate.Enemy
         * @instance
         */
        Enemy.prototype.lootTableId = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Enemy.prototype, "_targetPlayerId", {
            get: $util.oneOfGetter($oneOfFields = ["targetPlayerId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Enemy.prototype, "_lootTableId", {
            get: $util.oneOfGetter($oneOfFields = ["lootTableId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Enemy instance using the specified properties.
         * @function create
         * @memberof gamestate.Enemy
         * @static
         * @param {gamestate.IEnemy=} [properties] Properties to set
         * @returns {gamestate.Enemy} Enemy instance
         */
        Enemy.create = function create(properties) {
            return new Enemy(properties);
        };

        /**
         * Encodes the specified Enemy message. Does not implicitly {@link gamestate.Enemy.verify|verify} messages.
         * @function encode
         * @memberof gamestate.Enemy
         * @static
         * @param {gamestate.IEnemy} message Enemy message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Enemy.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.enemyId != null && Object.hasOwnProperty.call(message, "enemyId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.enemyId);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                $root.gamestate.Position.encode(message.position, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.velocity != null && Object.hasOwnProperty.call(message, "velocity"))
                $root.gamestate.Velocity.encode(message.velocity, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.health != null && Object.hasOwnProperty.call(message, "health"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.health);
            if (message.maxHealth != null && Object.hasOwnProperty.call(message, "maxHealth"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.maxHealth);
            if (message.level != null && Object.hasOwnProperty.call(message, "level"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.level);
            if (message.isAggro != null && Object.hasOwnProperty.call(message, "isAggro"))
                writer.uint32(/* id 8, wireType 0 =*/64).bool(message.isAggro);
            if (message.targetPlayerId != null && Object.hasOwnProperty.call(message, "targetPlayerId"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.targetPlayerId);
            if (message.lastAttackTime != null && Object.hasOwnProperty.call(message, "lastAttackTime"))
                writer.uint32(/* id 10, wireType 5 =*/85).float(message.lastAttackTime);
            if (message.lootTableId != null && Object.hasOwnProperty.call(message, "lootTableId"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.lootTableId);
            return writer;
        };

        /**
         * Encodes the specified Enemy message, length delimited. Does not implicitly {@link gamestate.Enemy.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.Enemy
         * @static
         * @param {gamestate.IEnemy} message Enemy message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Enemy.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Enemy message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.Enemy
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.Enemy} Enemy
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Enemy.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.Enemy();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.enemyId = reader.string();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.position = $root.gamestate.Position.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.velocity = $root.gamestate.Velocity.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        message.health = reader.uint32();
                        break;
                    }
                case 6: {
                        message.maxHealth = reader.uint32();
                        break;
                    }
                case 7: {
                        message.level = reader.uint32();
                        break;
                    }
                case 8: {
                        message.isAggro = reader.bool();
                        break;
                    }
                case 9: {
                        message.targetPlayerId = reader.string();
                        break;
                    }
                case 10: {
                        message.lastAttackTime = reader.float();
                        break;
                    }
                case 11: {
                        message.lootTableId = reader.string();
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
         * Decodes an Enemy message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.Enemy
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.Enemy} Enemy
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Enemy.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Enemy message.
         * @function verify
         * @memberof gamestate.Enemy
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Enemy.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.enemyId != null && message.hasOwnProperty("enemyId"))
                if (!$util.isString(message.enemyId))
                    return "enemyId: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.position != null && message.hasOwnProperty("position")) {
                let error = $root.gamestate.Position.verify(message.position);
                if (error)
                    return "position." + error;
            }
            if (message.velocity != null && message.hasOwnProperty("velocity")) {
                let error = $root.gamestate.Velocity.verify(message.velocity);
                if (error)
                    return "velocity." + error;
            }
            if (message.health != null && message.hasOwnProperty("health"))
                if (!$util.isInteger(message.health))
                    return "health: integer expected";
            if (message.maxHealth != null && message.hasOwnProperty("maxHealth"))
                if (!$util.isInteger(message.maxHealth))
                    return "maxHealth: integer expected";
            if (message.level != null && message.hasOwnProperty("level"))
                if (!$util.isInteger(message.level))
                    return "level: integer expected";
            if (message.isAggro != null && message.hasOwnProperty("isAggro"))
                if (typeof message.isAggro !== "boolean")
                    return "isAggro: boolean expected";
            if (message.targetPlayerId != null && message.hasOwnProperty("targetPlayerId")) {
                properties._targetPlayerId = 1;
                if (!$util.isString(message.targetPlayerId))
                    return "targetPlayerId: string expected";
            }
            if (message.lastAttackTime != null && message.hasOwnProperty("lastAttackTime"))
                if (typeof message.lastAttackTime !== "number")
                    return "lastAttackTime: number expected";
            if (message.lootTableId != null && message.hasOwnProperty("lootTableId")) {
                properties._lootTableId = 1;
                if (!$util.isString(message.lootTableId))
                    return "lootTableId: string expected";
            }
            return null;
        };

        /**
         * Creates an Enemy message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.Enemy
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.Enemy} Enemy
         */
        Enemy.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.Enemy)
                return object;
            let message = new $root.gamestate.Enemy();
            if (object.enemyId != null)
                message.enemyId = String(object.enemyId);
            if (object.name != null)
                message.name = String(object.name);
            if (object.position != null) {
                if (typeof object.position !== "object")
                    throw TypeError(".gamestate.Enemy.position: object expected");
                message.position = $root.gamestate.Position.fromObject(object.position);
            }
            if (object.velocity != null) {
                if (typeof object.velocity !== "object")
                    throw TypeError(".gamestate.Enemy.velocity: object expected");
                message.velocity = $root.gamestate.Velocity.fromObject(object.velocity);
            }
            if (object.health != null)
                message.health = object.health >>> 0;
            if (object.maxHealth != null)
                message.maxHealth = object.maxHealth >>> 0;
            if (object.level != null)
                message.level = object.level >>> 0;
            if (object.isAggro != null)
                message.isAggro = Boolean(object.isAggro);
            if (object.targetPlayerId != null)
                message.targetPlayerId = String(object.targetPlayerId);
            if (object.lastAttackTime != null)
                message.lastAttackTime = Number(object.lastAttackTime);
            if (object.lootTableId != null)
                message.lootTableId = String(object.lootTableId);
            return message;
        };

        /**
         * Creates a plain object from an Enemy message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.Enemy
         * @static
         * @param {gamestate.Enemy} message Enemy
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Enemy.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.enemyId = "";
                object.name = "";
                object.position = null;
                object.velocity = null;
                object.health = 0;
                object.maxHealth = 0;
                object.level = 0;
                object.isAggro = false;
                object.lastAttackTime = 0;
            }
            if (message.enemyId != null && message.hasOwnProperty("enemyId"))
                object.enemyId = message.enemyId;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.position != null && message.hasOwnProperty("position"))
                object.position = $root.gamestate.Position.toObject(message.position, options);
            if (message.velocity != null && message.hasOwnProperty("velocity"))
                object.velocity = $root.gamestate.Velocity.toObject(message.velocity, options);
            if (message.health != null && message.hasOwnProperty("health"))
                object.health = message.health;
            if (message.maxHealth != null && message.hasOwnProperty("maxHealth"))
                object.maxHealth = message.maxHealth;
            if (message.level != null && message.hasOwnProperty("level"))
                object.level = message.level;
            if (message.isAggro != null && message.hasOwnProperty("isAggro"))
                object.isAggro = message.isAggro;
            if (message.targetPlayerId != null && message.hasOwnProperty("targetPlayerId")) {
                object.targetPlayerId = message.targetPlayerId;
                if (options.oneofs)
                    object._targetPlayerId = "targetPlayerId";
            }
            if (message.lastAttackTime != null && message.hasOwnProperty("lastAttackTime"))
                object.lastAttackTime = options.json && !isFinite(message.lastAttackTime) ? String(message.lastAttackTime) : message.lastAttackTime;
            if (message.lootTableId != null && message.hasOwnProperty("lootTableId")) {
                object.lootTableId = message.lootTableId;
                if (options.oneofs)
                    object._lootTableId = "lootTableId";
            }
            return object;
        };

        /**
         * Converts this Enemy to JSON.
         * @function toJSON
         * @memberof gamestate.Enemy
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Enemy.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Enemy
         * @function getTypeUrl
         * @memberof gamestate.Enemy
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Enemy.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.Enemy";
        };

        return Enemy;
    })();

    gamestate.Projectile = (function() {

        /**
         * Properties of a Projectile.
         * @memberof gamestate
         * @interface IProjectile
         * @property {string|null} [projectileId] Projectile projectileId
         * @property {string|null} [ownerId] Projectile ownerId
         * @property {gamestate.IPosition|null} [position] Projectile position
         * @property {gamestate.IVelocity|null} [velocity] Projectile velocity
         * @property {number|null} [damage] Projectile damage
         * @property {number|null} [penetration] Projectile penetration
         * @property {number|null} [timeToLive] Projectile timeToLive
         * @property {Array.<string>|null} [hitPlayers] Projectile hitPlayers
         */

        /**
         * Constructs a new Projectile.
         * @memberof gamestate
         * @classdesc Represents a Projectile.
         * @implements IProjectile
         * @constructor
         * @param {gamestate.IProjectile=} [properties] Properties to set
         */
        function Projectile(properties) {
            this.hitPlayers = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Projectile projectileId.
         * @member {string} projectileId
         * @memberof gamestate.Projectile
         * @instance
         */
        Projectile.prototype.projectileId = "";

        /**
         * Projectile ownerId.
         * @member {string} ownerId
         * @memberof gamestate.Projectile
         * @instance
         */
        Projectile.prototype.ownerId = "";

        /**
         * Projectile position.
         * @member {gamestate.IPosition|null|undefined} position
         * @memberof gamestate.Projectile
         * @instance
         */
        Projectile.prototype.position = null;

        /**
         * Projectile velocity.
         * @member {gamestate.IVelocity|null|undefined} velocity
         * @memberof gamestate.Projectile
         * @instance
         */
        Projectile.prototype.velocity = null;

        /**
         * Projectile damage.
         * @member {number} damage
         * @memberof gamestate.Projectile
         * @instance
         */
        Projectile.prototype.damage = 0;

        /**
         * Projectile penetration.
         * @member {number} penetration
         * @memberof gamestate.Projectile
         * @instance
         */
        Projectile.prototype.penetration = 0;

        /**
         * Projectile timeToLive.
         * @member {number} timeToLive
         * @memberof gamestate.Projectile
         * @instance
         */
        Projectile.prototype.timeToLive = 0;

        /**
         * Projectile hitPlayers.
         * @member {Array.<string>} hitPlayers
         * @memberof gamestate.Projectile
         * @instance
         */
        Projectile.prototype.hitPlayers = $util.emptyArray;

        /**
         * Creates a new Projectile instance using the specified properties.
         * @function create
         * @memberof gamestate.Projectile
         * @static
         * @param {gamestate.IProjectile=} [properties] Properties to set
         * @returns {gamestate.Projectile} Projectile instance
         */
        Projectile.create = function create(properties) {
            return new Projectile(properties);
        };

        /**
         * Encodes the specified Projectile message. Does not implicitly {@link gamestate.Projectile.verify|verify} messages.
         * @function encode
         * @memberof gamestate.Projectile
         * @static
         * @param {gamestate.IProjectile} message Projectile message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Projectile.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.projectileId != null && Object.hasOwnProperty.call(message, "projectileId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.projectileId);
            if (message.ownerId != null && Object.hasOwnProperty.call(message, "ownerId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.ownerId);
            if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                $root.gamestate.Position.encode(message.position, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.velocity != null && Object.hasOwnProperty.call(message, "velocity"))
                $root.gamestate.Velocity.encode(message.velocity, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.damage != null && Object.hasOwnProperty.call(message, "damage"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.damage);
            if (message.penetration != null && Object.hasOwnProperty.call(message, "penetration"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.penetration);
            if (message.timeToLive != null && Object.hasOwnProperty.call(message, "timeToLive"))
                writer.uint32(/* id 7, wireType 5 =*/61).float(message.timeToLive);
            if (message.hitPlayers != null && message.hitPlayers.length)
                for (let i = 0; i < message.hitPlayers.length; ++i)
                    writer.uint32(/* id 8, wireType 2 =*/66).string(message.hitPlayers[i]);
            return writer;
        };

        /**
         * Encodes the specified Projectile message, length delimited. Does not implicitly {@link gamestate.Projectile.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.Projectile
         * @static
         * @param {gamestate.IProjectile} message Projectile message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Projectile.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Projectile message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.Projectile
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.Projectile} Projectile
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Projectile.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.Projectile();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.projectileId = reader.string();
                        break;
                    }
                case 2: {
                        message.ownerId = reader.string();
                        break;
                    }
                case 3: {
                        message.position = $root.gamestate.Position.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.velocity = $root.gamestate.Velocity.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        message.damage = reader.uint32();
                        break;
                    }
                case 6: {
                        message.penetration = reader.uint32();
                        break;
                    }
                case 7: {
                        message.timeToLive = reader.float();
                        break;
                    }
                case 8: {
                        if (!(message.hitPlayers && message.hitPlayers.length))
                            message.hitPlayers = [];
                        message.hitPlayers.push(reader.string());
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
         * Decodes a Projectile message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.Projectile
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.Projectile} Projectile
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Projectile.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Projectile message.
         * @function verify
         * @memberof gamestate.Projectile
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Projectile.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.projectileId != null && message.hasOwnProperty("projectileId"))
                if (!$util.isString(message.projectileId))
                    return "projectileId: string expected";
            if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                if (!$util.isString(message.ownerId))
                    return "ownerId: string expected";
            if (message.position != null && message.hasOwnProperty("position")) {
                let error = $root.gamestate.Position.verify(message.position);
                if (error)
                    return "position." + error;
            }
            if (message.velocity != null && message.hasOwnProperty("velocity")) {
                let error = $root.gamestate.Velocity.verify(message.velocity);
                if (error)
                    return "velocity." + error;
            }
            if (message.damage != null && message.hasOwnProperty("damage"))
                if (!$util.isInteger(message.damage))
                    return "damage: integer expected";
            if (message.penetration != null && message.hasOwnProperty("penetration"))
                if (!$util.isInteger(message.penetration))
                    return "penetration: integer expected";
            if (message.timeToLive != null && message.hasOwnProperty("timeToLive"))
                if (typeof message.timeToLive !== "number")
                    return "timeToLive: number expected";
            if (message.hitPlayers != null && message.hasOwnProperty("hitPlayers")) {
                if (!Array.isArray(message.hitPlayers))
                    return "hitPlayers: array expected";
                for (let i = 0; i < message.hitPlayers.length; ++i)
                    if (!$util.isString(message.hitPlayers[i]))
                        return "hitPlayers: string[] expected";
            }
            return null;
        };

        /**
         * Creates a Projectile message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.Projectile
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.Projectile} Projectile
         */
        Projectile.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.Projectile)
                return object;
            let message = new $root.gamestate.Projectile();
            if (object.projectileId != null)
                message.projectileId = String(object.projectileId);
            if (object.ownerId != null)
                message.ownerId = String(object.ownerId);
            if (object.position != null) {
                if (typeof object.position !== "object")
                    throw TypeError(".gamestate.Projectile.position: object expected");
                message.position = $root.gamestate.Position.fromObject(object.position);
            }
            if (object.velocity != null) {
                if (typeof object.velocity !== "object")
                    throw TypeError(".gamestate.Projectile.velocity: object expected");
                message.velocity = $root.gamestate.Velocity.fromObject(object.velocity);
            }
            if (object.damage != null)
                message.damage = object.damage >>> 0;
            if (object.penetration != null)
                message.penetration = object.penetration >>> 0;
            if (object.timeToLive != null)
                message.timeToLive = Number(object.timeToLive);
            if (object.hitPlayers) {
                if (!Array.isArray(object.hitPlayers))
                    throw TypeError(".gamestate.Projectile.hitPlayers: array expected");
                message.hitPlayers = [];
                for (let i = 0; i < object.hitPlayers.length; ++i)
                    message.hitPlayers[i] = String(object.hitPlayers[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from a Projectile message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.Projectile
         * @static
         * @param {gamestate.Projectile} message Projectile
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Projectile.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.hitPlayers = [];
            if (options.defaults) {
                object.projectileId = "";
                object.ownerId = "";
                object.position = null;
                object.velocity = null;
                object.damage = 0;
                object.penetration = 0;
                object.timeToLive = 0;
            }
            if (message.projectileId != null && message.hasOwnProperty("projectileId"))
                object.projectileId = message.projectileId;
            if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                object.ownerId = message.ownerId;
            if (message.position != null && message.hasOwnProperty("position"))
                object.position = $root.gamestate.Position.toObject(message.position, options);
            if (message.velocity != null && message.hasOwnProperty("velocity"))
                object.velocity = $root.gamestate.Velocity.toObject(message.velocity, options);
            if (message.damage != null && message.hasOwnProperty("damage"))
                object.damage = message.damage;
            if (message.penetration != null && message.hasOwnProperty("penetration"))
                object.penetration = message.penetration;
            if (message.timeToLive != null && message.hasOwnProperty("timeToLive"))
                object.timeToLive = options.json && !isFinite(message.timeToLive) ? String(message.timeToLive) : message.timeToLive;
            if (message.hitPlayers && message.hitPlayers.length) {
                object.hitPlayers = [];
                for (let j = 0; j < message.hitPlayers.length; ++j)
                    object.hitPlayers[j] = message.hitPlayers[j];
            }
            return object;
        };

        /**
         * Converts this Projectile to JSON.
         * @function toJSON
         * @memberof gamestate.Projectile
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Projectile.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Projectile
         * @function getTypeUrl
         * @memberof gamestate.Projectile
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Projectile.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.Projectile";
        };

        return Projectile;
    })();

    gamestate.DroppedLoot = (function() {

        /**
         * Properties of a DroppedLoot.
         * @memberof gamestate
         * @interface IDroppedLoot
         * @property {string|null} [lootId] DroppedLoot lootId
         * @property {gamestate.IPosition|null} [position] DroppedLoot position
         * @property {gamestate.IInventoryItem|null} [item] DroppedLoot item
         * @property {number|null} [despawnTime] DroppedLoot despawnTime
         */

        /**
         * Constructs a new DroppedLoot.
         * @memberof gamestate
         * @classdesc Represents a DroppedLoot.
         * @implements IDroppedLoot
         * @constructor
         * @param {gamestate.IDroppedLoot=} [properties] Properties to set
         */
        function DroppedLoot(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DroppedLoot lootId.
         * @member {string} lootId
         * @memberof gamestate.DroppedLoot
         * @instance
         */
        DroppedLoot.prototype.lootId = "";

        /**
         * DroppedLoot position.
         * @member {gamestate.IPosition|null|undefined} position
         * @memberof gamestate.DroppedLoot
         * @instance
         */
        DroppedLoot.prototype.position = null;

        /**
         * DroppedLoot item.
         * @member {gamestate.IInventoryItem|null|undefined} item
         * @memberof gamestate.DroppedLoot
         * @instance
         */
        DroppedLoot.prototype.item = null;

        /**
         * DroppedLoot despawnTime.
         * @member {number} despawnTime
         * @memberof gamestate.DroppedLoot
         * @instance
         */
        DroppedLoot.prototype.despawnTime = 0;

        /**
         * Creates a new DroppedLoot instance using the specified properties.
         * @function create
         * @memberof gamestate.DroppedLoot
         * @static
         * @param {gamestate.IDroppedLoot=} [properties] Properties to set
         * @returns {gamestate.DroppedLoot} DroppedLoot instance
         */
        DroppedLoot.create = function create(properties) {
            return new DroppedLoot(properties);
        };

        /**
         * Encodes the specified DroppedLoot message. Does not implicitly {@link gamestate.DroppedLoot.verify|verify} messages.
         * @function encode
         * @memberof gamestate.DroppedLoot
         * @static
         * @param {gamestate.IDroppedLoot} message DroppedLoot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DroppedLoot.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.lootId != null && Object.hasOwnProperty.call(message, "lootId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.lootId);
            if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                $root.gamestate.Position.encode(message.position, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.item != null && Object.hasOwnProperty.call(message, "item"))
                $root.gamestate.InventoryItem.encode(message.item, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.despawnTime != null && Object.hasOwnProperty.call(message, "despawnTime"))
                writer.uint32(/* id 4, wireType 5 =*/37).float(message.despawnTime);
            return writer;
        };

        /**
         * Encodes the specified DroppedLoot message, length delimited. Does not implicitly {@link gamestate.DroppedLoot.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.DroppedLoot
         * @static
         * @param {gamestate.IDroppedLoot} message DroppedLoot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DroppedLoot.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DroppedLoot message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.DroppedLoot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.DroppedLoot} DroppedLoot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DroppedLoot.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.DroppedLoot();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.lootId = reader.string();
                        break;
                    }
                case 2: {
                        message.position = $root.gamestate.Position.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.item = $root.gamestate.InventoryItem.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.despawnTime = reader.float();
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
         * Decodes a DroppedLoot message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.DroppedLoot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.DroppedLoot} DroppedLoot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DroppedLoot.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DroppedLoot message.
         * @function verify
         * @memberof gamestate.DroppedLoot
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DroppedLoot.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.lootId != null && message.hasOwnProperty("lootId"))
                if (!$util.isString(message.lootId))
                    return "lootId: string expected";
            if (message.position != null && message.hasOwnProperty("position")) {
                let error = $root.gamestate.Position.verify(message.position);
                if (error)
                    return "position." + error;
            }
            if (message.item != null && message.hasOwnProperty("item")) {
                let error = $root.gamestate.InventoryItem.verify(message.item);
                if (error)
                    return "item." + error;
            }
            if (message.despawnTime != null && message.hasOwnProperty("despawnTime"))
                if (typeof message.despawnTime !== "number")
                    return "despawnTime: number expected";
            return null;
        };

        /**
         * Creates a DroppedLoot message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.DroppedLoot
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.DroppedLoot} DroppedLoot
         */
        DroppedLoot.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.DroppedLoot)
                return object;
            let message = new $root.gamestate.DroppedLoot();
            if (object.lootId != null)
                message.lootId = String(object.lootId);
            if (object.position != null) {
                if (typeof object.position !== "object")
                    throw TypeError(".gamestate.DroppedLoot.position: object expected");
                message.position = $root.gamestate.Position.fromObject(object.position);
            }
            if (object.item != null) {
                if (typeof object.item !== "object")
                    throw TypeError(".gamestate.DroppedLoot.item: object expected");
                message.item = $root.gamestate.InventoryItem.fromObject(object.item);
            }
            if (object.despawnTime != null)
                message.despawnTime = Number(object.despawnTime);
            return message;
        };

        /**
         * Creates a plain object from a DroppedLoot message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.DroppedLoot
         * @static
         * @param {gamestate.DroppedLoot} message DroppedLoot
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DroppedLoot.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.lootId = "";
                object.position = null;
                object.item = null;
                object.despawnTime = 0;
            }
            if (message.lootId != null && message.hasOwnProperty("lootId"))
                object.lootId = message.lootId;
            if (message.position != null && message.hasOwnProperty("position"))
                object.position = $root.gamestate.Position.toObject(message.position, options);
            if (message.item != null && message.hasOwnProperty("item"))
                object.item = $root.gamestate.InventoryItem.toObject(message.item, options);
            if (message.despawnTime != null && message.hasOwnProperty("despawnTime"))
                object.despawnTime = options.json && !isFinite(message.despawnTime) ? String(message.despawnTime) : message.despawnTime;
            return object;
        };

        /**
         * Converts this DroppedLoot to JSON.
         * @function toJSON
         * @memberof gamestate.DroppedLoot
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DroppedLoot.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DroppedLoot
         * @function getTypeUrl
         * @memberof gamestate.DroppedLoot
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DroppedLoot.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.DroppedLoot";
        };

        return DroppedLoot;
    })();

    gamestate.WorldObject = (function() {

        /**
         * Properties of a WorldObject.
         * @memberof gamestate
         * @interface IWorldObject
         * @property {string|null} [objectId] WorldObject objectId
         * @property {string|null} [objectType] WorldObject objectType
         * @property {gamestate.IPosition|null} [position] WorldObject position
         * @property {number|null} [health] WorldObject health
         * @property {boolean|null} [isDestroyed] WorldObject isDestroyed
         * @property {boolean|null} [isInteractable] WorldObject isInteractable
         * @property {string|null} [interactedBy] WorldObject interactedBy
         */

        /**
         * Constructs a new WorldObject.
         * @memberof gamestate
         * @classdesc Represents a WorldObject.
         * @implements IWorldObject
         * @constructor
         * @param {gamestate.IWorldObject=} [properties] Properties to set
         */
        function WorldObject(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WorldObject objectId.
         * @member {string} objectId
         * @memberof gamestate.WorldObject
         * @instance
         */
        WorldObject.prototype.objectId = "";

        /**
         * WorldObject objectType.
         * @member {string} objectType
         * @memberof gamestate.WorldObject
         * @instance
         */
        WorldObject.prototype.objectType = "";

        /**
         * WorldObject position.
         * @member {gamestate.IPosition|null|undefined} position
         * @memberof gamestate.WorldObject
         * @instance
         */
        WorldObject.prototype.position = null;

        /**
         * WorldObject health.
         * @member {number|null|undefined} health
         * @memberof gamestate.WorldObject
         * @instance
         */
        WorldObject.prototype.health = null;

        /**
         * WorldObject isDestroyed.
         * @member {boolean} isDestroyed
         * @memberof gamestate.WorldObject
         * @instance
         */
        WorldObject.prototype.isDestroyed = false;

        /**
         * WorldObject isInteractable.
         * @member {boolean} isInteractable
         * @memberof gamestate.WorldObject
         * @instance
         */
        WorldObject.prototype.isInteractable = false;

        /**
         * WorldObject interactedBy.
         * @member {string|null|undefined} interactedBy
         * @memberof gamestate.WorldObject
         * @instance
         */
        WorldObject.prototype.interactedBy = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorldObject.prototype, "_health", {
            get: $util.oneOfGetter($oneOfFields = ["health"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorldObject.prototype, "_interactedBy", {
            get: $util.oneOfGetter($oneOfFields = ["interactedBy"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new WorldObject instance using the specified properties.
         * @function create
         * @memberof gamestate.WorldObject
         * @static
         * @param {gamestate.IWorldObject=} [properties] Properties to set
         * @returns {gamestate.WorldObject} WorldObject instance
         */
        WorldObject.create = function create(properties) {
            return new WorldObject(properties);
        };

        /**
         * Encodes the specified WorldObject message. Does not implicitly {@link gamestate.WorldObject.verify|verify} messages.
         * @function encode
         * @memberof gamestate.WorldObject
         * @static
         * @param {gamestate.IWorldObject} message WorldObject message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorldObject.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.objectId != null && Object.hasOwnProperty.call(message, "objectId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.objectId);
            if (message.objectType != null && Object.hasOwnProperty.call(message, "objectType"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.objectType);
            if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                $root.gamestate.Position.encode(message.position, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.health != null && Object.hasOwnProperty.call(message, "health"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.health);
            if (message.isDestroyed != null && Object.hasOwnProperty.call(message, "isDestroyed"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.isDestroyed);
            if (message.isInteractable != null && Object.hasOwnProperty.call(message, "isInteractable"))
                writer.uint32(/* id 6, wireType 0 =*/48).bool(message.isInteractable);
            if (message.interactedBy != null && Object.hasOwnProperty.call(message, "interactedBy"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.interactedBy);
            return writer;
        };

        /**
         * Encodes the specified WorldObject message, length delimited. Does not implicitly {@link gamestate.WorldObject.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.WorldObject
         * @static
         * @param {gamestate.IWorldObject} message WorldObject message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorldObject.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WorldObject message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.WorldObject
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.WorldObject} WorldObject
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorldObject.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.WorldObject();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.objectId = reader.string();
                        break;
                    }
                case 2: {
                        message.objectType = reader.string();
                        break;
                    }
                case 3: {
                        message.position = $root.gamestate.Position.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.health = reader.uint32();
                        break;
                    }
                case 5: {
                        message.isDestroyed = reader.bool();
                        break;
                    }
                case 6: {
                        message.isInteractable = reader.bool();
                        break;
                    }
                case 7: {
                        message.interactedBy = reader.string();
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
         * Decodes a WorldObject message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.WorldObject
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.WorldObject} WorldObject
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorldObject.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WorldObject message.
         * @function verify
         * @memberof gamestate.WorldObject
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WorldObject.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.objectId != null && message.hasOwnProperty("objectId"))
                if (!$util.isString(message.objectId))
                    return "objectId: string expected";
            if (message.objectType != null && message.hasOwnProperty("objectType"))
                if (!$util.isString(message.objectType))
                    return "objectType: string expected";
            if (message.position != null && message.hasOwnProperty("position")) {
                let error = $root.gamestate.Position.verify(message.position);
                if (error)
                    return "position." + error;
            }
            if (message.health != null && message.hasOwnProperty("health")) {
                properties._health = 1;
                if (!$util.isInteger(message.health))
                    return "health: integer expected";
            }
            if (message.isDestroyed != null && message.hasOwnProperty("isDestroyed"))
                if (typeof message.isDestroyed !== "boolean")
                    return "isDestroyed: boolean expected";
            if (message.isInteractable != null && message.hasOwnProperty("isInteractable"))
                if (typeof message.isInteractable !== "boolean")
                    return "isInteractable: boolean expected";
            if (message.interactedBy != null && message.hasOwnProperty("interactedBy")) {
                properties._interactedBy = 1;
                if (!$util.isString(message.interactedBy))
                    return "interactedBy: string expected";
            }
            return null;
        };

        /**
         * Creates a WorldObject message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.WorldObject
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.WorldObject} WorldObject
         */
        WorldObject.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.WorldObject)
                return object;
            let message = new $root.gamestate.WorldObject();
            if (object.objectId != null)
                message.objectId = String(object.objectId);
            if (object.objectType != null)
                message.objectType = String(object.objectType);
            if (object.position != null) {
                if (typeof object.position !== "object")
                    throw TypeError(".gamestate.WorldObject.position: object expected");
                message.position = $root.gamestate.Position.fromObject(object.position);
            }
            if (object.health != null)
                message.health = object.health >>> 0;
            if (object.isDestroyed != null)
                message.isDestroyed = Boolean(object.isDestroyed);
            if (object.isInteractable != null)
                message.isInteractable = Boolean(object.isInteractable);
            if (object.interactedBy != null)
                message.interactedBy = String(object.interactedBy);
            return message;
        };

        /**
         * Creates a plain object from a WorldObject message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.WorldObject
         * @static
         * @param {gamestate.WorldObject} message WorldObject
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WorldObject.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.objectId = "";
                object.objectType = "";
                object.position = null;
                object.isDestroyed = false;
                object.isInteractable = false;
            }
            if (message.objectId != null && message.hasOwnProperty("objectId"))
                object.objectId = message.objectId;
            if (message.objectType != null && message.hasOwnProperty("objectType"))
                object.objectType = message.objectType;
            if (message.position != null && message.hasOwnProperty("position"))
                object.position = $root.gamestate.Position.toObject(message.position, options);
            if (message.health != null && message.hasOwnProperty("health")) {
                object.health = message.health;
                if (options.oneofs)
                    object._health = "health";
            }
            if (message.isDestroyed != null && message.hasOwnProperty("isDestroyed"))
                object.isDestroyed = message.isDestroyed;
            if (message.isInteractable != null && message.hasOwnProperty("isInteractable"))
                object.isInteractable = message.isInteractable;
            if (message.interactedBy != null && message.hasOwnProperty("interactedBy")) {
                object.interactedBy = message.interactedBy;
                if (options.oneofs)
                    object._interactedBy = "interactedBy";
            }
            return object;
        };

        /**
         * Converts this WorldObject to JSON.
         * @function toJSON
         * @memberof gamestate.WorldObject
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WorldObject.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WorldObject
         * @function getTypeUrl
         * @memberof gamestate.WorldObject
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WorldObject.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.WorldObject";
        };

        return WorldObject;
    })();

    gamestate.MatchStats = (function() {

        /**
         * Properties of a MatchStats.
         * @memberof gamestate
         * @interface IMatchStats
         * @property {number|null} [totalKills] MatchStats totalKills
         * @property {number|null} [totalDeaths] MatchStats totalDeaths
         * @property {number|null} [totalDamageDealt] MatchStats totalDamageDealt
         * @property {number|null} [totalHealingDone] MatchStats totalHealingDone
         * @property {number|null} [longestKillStreak] MatchStats longestKillStreak
         * @property {number|null} [matchDuration] MatchStats matchDuration
         */

        /**
         * Constructs a new MatchStats.
         * @memberof gamestate
         * @classdesc Represents a MatchStats.
         * @implements IMatchStats
         * @constructor
         * @param {gamestate.IMatchStats=} [properties] Properties to set
         */
        function MatchStats(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MatchStats totalKills.
         * @member {number} totalKills
         * @memberof gamestate.MatchStats
         * @instance
         */
        MatchStats.prototype.totalKills = 0;

        /**
         * MatchStats totalDeaths.
         * @member {number} totalDeaths
         * @memberof gamestate.MatchStats
         * @instance
         */
        MatchStats.prototype.totalDeaths = 0;

        /**
         * MatchStats totalDamageDealt.
         * @member {number} totalDamageDealt
         * @memberof gamestate.MatchStats
         * @instance
         */
        MatchStats.prototype.totalDamageDealt = 0;

        /**
         * MatchStats totalHealingDone.
         * @member {number} totalHealingDone
         * @memberof gamestate.MatchStats
         * @instance
         */
        MatchStats.prototype.totalHealingDone = 0;

        /**
         * MatchStats longestKillStreak.
         * @member {number} longestKillStreak
         * @memberof gamestate.MatchStats
         * @instance
         */
        MatchStats.prototype.longestKillStreak = 0;

        /**
         * MatchStats matchDuration.
         * @member {number} matchDuration
         * @memberof gamestate.MatchStats
         * @instance
         */
        MatchStats.prototype.matchDuration = 0;

        /**
         * Creates a new MatchStats instance using the specified properties.
         * @function create
         * @memberof gamestate.MatchStats
         * @static
         * @param {gamestate.IMatchStats=} [properties] Properties to set
         * @returns {gamestate.MatchStats} MatchStats instance
         */
        MatchStats.create = function create(properties) {
            return new MatchStats(properties);
        };

        /**
         * Encodes the specified MatchStats message. Does not implicitly {@link gamestate.MatchStats.verify|verify} messages.
         * @function encode
         * @memberof gamestate.MatchStats
         * @static
         * @param {gamestate.IMatchStats} message MatchStats message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MatchStats.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.totalKills != null && Object.hasOwnProperty.call(message, "totalKills"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.totalKills);
            if (message.totalDeaths != null && Object.hasOwnProperty.call(message, "totalDeaths"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.totalDeaths);
            if (message.totalDamageDealt != null && Object.hasOwnProperty.call(message, "totalDamageDealt"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.totalDamageDealt);
            if (message.totalHealingDone != null && Object.hasOwnProperty.call(message, "totalHealingDone"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.totalHealingDone);
            if (message.longestKillStreak != null && Object.hasOwnProperty.call(message, "longestKillStreak"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.longestKillStreak);
            if (message.matchDuration != null && Object.hasOwnProperty.call(message, "matchDuration"))
                writer.uint32(/* id 6, wireType 5 =*/53).float(message.matchDuration);
            return writer;
        };

        /**
         * Encodes the specified MatchStats message, length delimited. Does not implicitly {@link gamestate.MatchStats.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.MatchStats
         * @static
         * @param {gamestate.IMatchStats} message MatchStats message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MatchStats.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MatchStats message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.MatchStats
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.MatchStats} MatchStats
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MatchStats.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.MatchStats();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.totalKills = reader.uint32();
                        break;
                    }
                case 2: {
                        message.totalDeaths = reader.uint32();
                        break;
                    }
                case 3: {
                        message.totalDamageDealt = reader.uint32();
                        break;
                    }
                case 4: {
                        message.totalHealingDone = reader.uint32();
                        break;
                    }
                case 5: {
                        message.longestKillStreak = reader.uint32();
                        break;
                    }
                case 6: {
                        message.matchDuration = reader.float();
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
         * Decodes a MatchStats message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.MatchStats
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.MatchStats} MatchStats
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MatchStats.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MatchStats message.
         * @function verify
         * @memberof gamestate.MatchStats
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MatchStats.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.totalKills != null && message.hasOwnProperty("totalKills"))
                if (!$util.isInteger(message.totalKills))
                    return "totalKills: integer expected";
            if (message.totalDeaths != null && message.hasOwnProperty("totalDeaths"))
                if (!$util.isInteger(message.totalDeaths))
                    return "totalDeaths: integer expected";
            if (message.totalDamageDealt != null && message.hasOwnProperty("totalDamageDealt"))
                if (!$util.isInteger(message.totalDamageDealt))
                    return "totalDamageDealt: integer expected";
            if (message.totalHealingDone != null && message.hasOwnProperty("totalHealingDone"))
                if (!$util.isInteger(message.totalHealingDone))
                    return "totalHealingDone: integer expected";
            if (message.longestKillStreak != null && message.hasOwnProperty("longestKillStreak"))
                if (!$util.isInteger(message.longestKillStreak))
                    return "longestKillStreak: integer expected";
            if (message.matchDuration != null && message.hasOwnProperty("matchDuration"))
                if (typeof message.matchDuration !== "number")
                    return "matchDuration: number expected";
            return null;
        };

        /**
         * Creates a MatchStats message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.MatchStats
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.MatchStats} MatchStats
         */
        MatchStats.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.MatchStats)
                return object;
            let message = new $root.gamestate.MatchStats();
            if (object.totalKills != null)
                message.totalKills = object.totalKills >>> 0;
            if (object.totalDeaths != null)
                message.totalDeaths = object.totalDeaths >>> 0;
            if (object.totalDamageDealt != null)
                message.totalDamageDealt = object.totalDamageDealt >>> 0;
            if (object.totalHealingDone != null)
                message.totalHealingDone = object.totalHealingDone >>> 0;
            if (object.longestKillStreak != null)
                message.longestKillStreak = object.longestKillStreak >>> 0;
            if (object.matchDuration != null)
                message.matchDuration = Number(object.matchDuration);
            return message;
        };

        /**
         * Creates a plain object from a MatchStats message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.MatchStats
         * @static
         * @param {gamestate.MatchStats} message MatchStats
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MatchStats.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.totalKills = 0;
                object.totalDeaths = 0;
                object.totalDamageDealt = 0;
                object.totalHealingDone = 0;
                object.longestKillStreak = 0;
                object.matchDuration = 0;
            }
            if (message.totalKills != null && message.hasOwnProperty("totalKills"))
                object.totalKills = message.totalKills;
            if (message.totalDeaths != null && message.hasOwnProperty("totalDeaths"))
                object.totalDeaths = message.totalDeaths;
            if (message.totalDamageDealt != null && message.hasOwnProperty("totalDamageDealt"))
                object.totalDamageDealt = message.totalDamageDealt;
            if (message.totalHealingDone != null && message.hasOwnProperty("totalHealingDone"))
                object.totalHealingDone = message.totalHealingDone;
            if (message.longestKillStreak != null && message.hasOwnProperty("longestKillStreak"))
                object.longestKillStreak = message.longestKillStreak;
            if (message.matchDuration != null && message.hasOwnProperty("matchDuration"))
                object.matchDuration = options.json && !isFinite(message.matchDuration) ? String(message.matchDuration) : message.matchDuration;
            return object;
        };

        /**
         * Converts this MatchStats to JSON.
         * @function toJSON
         * @memberof gamestate.MatchStats
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MatchStats.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MatchStats
         * @function getTypeUrl
         * @memberof gamestate.MatchStats
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MatchStats.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.MatchStats";
        };

        return MatchStats;
    })();

    gamestate.TeamScore = (function() {

        /**
         * Properties of a TeamScore.
         * @memberof gamestate
         * @interface ITeamScore
         * @property {gamestate.Team|null} [team] TeamScore team
         * @property {number|null} [score] TeamScore score
         * @property {number|null} [kills] TeamScore kills
         * @property {number|null} [objectivesCaptured] TeamScore objectivesCaptured
         */

        /**
         * Constructs a new TeamScore.
         * @memberof gamestate
         * @classdesc Represents a TeamScore.
         * @implements ITeamScore
         * @constructor
         * @param {gamestate.ITeamScore=} [properties] Properties to set
         */
        function TeamScore(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TeamScore team.
         * @member {gamestate.Team} team
         * @memberof gamestate.TeamScore
         * @instance
         */
        TeamScore.prototype.team = 0;

        /**
         * TeamScore score.
         * @member {number} score
         * @memberof gamestate.TeamScore
         * @instance
         */
        TeamScore.prototype.score = 0;

        /**
         * TeamScore kills.
         * @member {number} kills
         * @memberof gamestate.TeamScore
         * @instance
         */
        TeamScore.prototype.kills = 0;

        /**
         * TeamScore objectivesCaptured.
         * @member {number} objectivesCaptured
         * @memberof gamestate.TeamScore
         * @instance
         */
        TeamScore.prototype.objectivesCaptured = 0;

        /**
         * Creates a new TeamScore instance using the specified properties.
         * @function create
         * @memberof gamestate.TeamScore
         * @static
         * @param {gamestate.ITeamScore=} [properties] Properties to set
         * @returns {gamestate.TeamScore} TeamScore instance
         */
        TeamScore.create = function create(properties) {
            return new TeamScore(properties);
        };

        /**
         * Encodes the specified TeamScore message. Does not implicitly {@link gamestate.TeamScore.verify|verify} messages.
         * @function encode
         * @memberof gamestate.TeamScore
         * @static
         * @param {gamestate.ITeamScore} message TeamScore message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TeamScore.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.team != null && Object.hasOwnProperty.call(message, "team"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.team);
            if (message.score != null && Object.hasOwnProperty.call(message, "score"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.score);
            if (message.kills != null && Object.hasOwnProperty.call(message, "kills"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.kills);
            if (message.objectivesCaptured != null && Object.hasOwnProperty.call(message, "objectivesCaptured"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.objectivesCaptured);
            return writer;
        };

        /**
         * Encodes the specified TeamScore message, length delimited. Does not implicitly {@link gamestate.TeamScore.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.TeamScore
         * @static
         * @param {gamestate.ITeamScore} message TeamScore message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TeamScore.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TeamScore message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.TeamScore
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.TeamScore} TeamScore
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TeamScore.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.TeamScore();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.team = reader.int32();
                        break;
                    }
                case 2: {
                        message.score = reader.uint32();
                        break;
                    }
                case 3: {
                        message.kills = reader.uint32();
                        break;
                    }
                case 4: {
                        message.objectivesCaptured = reader.uint32();
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
         * Decodes a TeamScore message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.TeamScore
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.TeamScore} TeamScore
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TeamScore.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TeamScore message.
         * @function verify
         * @memberof gamestate.TeamScore
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TeamScore.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.team != null && message.hasOwnProperty("team"))
                switch (message.team) {
                default:
                    return "team: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            if (message.score != null && message.hasOwnProperty("score"))
                if (!$util.isInteger(message.score))
                    return "score: integer expected";
            if (message.kills != null && message.hasOwnProperty("kills"))
                if (!$util.isInteger(message.kills))
                    return "kills: integer expected";
            if (message.objectivesCaptured != null && message.hasOwnProperty("objectivesCaptured"))
                if (!$util.isInteger(message.objectivesCaptured))
                    return "objectivesCaptured: integer expected";
            return null;
        };

        /**
         * Creates a TeamScore message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.TeamScore
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.TeamScore} TeamScore
         */
        TeamScore.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.TeamScore)
                return object;
            let message = new $root.gamestate.TeamScore();
            switch (object.team) {
            default:
                if (typeof object.team === "number") {
                    message.team = object.team;
                    break;
                }
                break;
            case "TEAM_UNSPECIFIED":
            case 0:
                message.team = 0;
                break;
            case "RED":
            case 1:
                message.team = 1;
                break;
            case "BLUE":
            case 2:
                message.team = 2;
                break;
            case "GREEN":
            case 3:
                message.team = 3;
                break;
            case "YELLOW":
            case 4:
                message.team = 4;
                break;
            }
            if (object.score != null)
                message.score = object.score >>> 0;
            if (object.kills != null)
                message.kills = object.kills >>> 0;
            if (object.objectivesCaptured != null)
                message.objectivesCaptured = object.objectivesCaptured >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a TeamScore message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.TeamScore
         * @static
         * @param {gamestate.TeamScore} message TeamScore
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TeamScore.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.team = options.enums === String ? "TEAM_UNSPECIFIED" : 0;
                object.score = 0;
                object.kills = 0;
                object.objectivesCaptured = 0;
            }
            if (message.team != null && message.hasOwnProperty("team"))
                object.team = options.enums === String ? $root.gamestate.Team[message.team] === undefined ? message.team : $root.gamestate.Team[message.team] : message.team;
            if (message.score != null && message.hasOwnProperty("score"))
                object.score = message.score;
            if (message.kills != null && message.hasOwnProperty("kills"))
                object.kills = message.kills;
            if (message.objectivesCaptured != null && message.hasOwnProperty("objectivesCaptured"))
                object.objectivesCaptured = message.objectivesCaptured;
            return object;
        };

        /**
         * Converts this TeamScore to JSON.
         * @function toJSON
         * @memberof gamestate.TeamScore
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TeamScore.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TeamScore
         * @function getTypeUrl
         * @memberof gamestate.TeamScore
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TeamScore.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.TeamScore";
        };

        return TeamScore;
    })();

    gamestate.GameSettings = (function() {

        /**
         * Properties of a GameSettings.
         * @memberof gamestate
         * @interface IGameSettings
         * @property {number|null} [maxPlayers] GameSettings maxPlayers
         * @property {boolean|null} [friendlyFire] GameSettings friendlyFire
         * @property {number|null} [respawnDelay] GameSettings respawnDelay
         * @property {number|null} [roundTimeLimit] GameSettings roundTimeLimit
         * @property {number|null} [startingGold] GameSettings startingGold
         * @property {number|null} [gravityMultiplier] GameSettings gravityMultiplier
         */

        /**
         * Constructs a new GameSettings.
         * @memberof gamestate
         * @classdesc Represents a GameSettings.
         * @implements IGameSettings
         * @constructor
         * @param {gamestate.IGameSettings=} [properties] Properties to set
         */
        function GameSettings(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameSettings maxPlayers.
         * @member {number} maxPlayers
         * @memberof gamestate.GameSettings
         * @instance
         */
        GameSettings.prototype.maxPlayers = 0;

        /**
         * GameSettings friendlyFire.
         * @member {boolean} friendlyFire
         * @memberof gamestate.GameSettings
         * @instance
         */
        GameSettings.prototype.friendlyFire = false;

        /**
         * GameSettings respawnDelay.
         * @member {number} respawnDelay
         * @memberof gamestate.GameSettings
         * @instance
         */
        GameSettings.prototype.respawnDelay = 0;

        /**
         * GameSettings roundTimeLimit.
         * @member {number} roundTimeLimit
         * @memberof gamestate.GameSettings
         * @instance
         */
        GameSettings.prototype.roundTimeLimit = 0;

        /**
         * GameSettings startingGold.
         * @member {number} startingGold
         * @memberof gamestate.GameSettings
         * @instance
         */
        GameSettings.prototype.startingGold = 0;

        /**
         * GameSettings gravityMultiplier.
         * @member {number} gravityMultiplier
         * @memberof gamestate.GameSettings
         * @instance
         */
        GameSettings.prototype.gravityMultiplier = 0;

        /**
         * Creates a new GameSettings instance using the specified properties.
         * @function create
         * @memberof gamestate.GameSettings
         * @static
         * @param {gamestate.IGameSettings=} [properties] Properties to set
         * @returns {gamestate.GameSettings} GameSettings instance
         */
        GameSettings.create = function create(properties) {
            return new GameSettings(properties);
        };

        /**
         * Encodes the specified GameSettings message. Does not implicitly {@link gamestate.GameSettings.verify|verify} messages.
         * @function encode
         * @memberof gamestate.GameSettings
         * @static
         * @param {gamestate.IGameSettings} message GameSettings message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameSettings.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.maxPlayers != null && Object.hasOwnProperty.call(message, "maxPlayers"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.maxPlayers);
            if (message.friendlyFire != null && Object.hasOwnProperty.call(message, "friendlyFire"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.friendlyFire);
            if (message.respawnDelay != null && Object.hasOwnProperty.call(message, "respawnDelay"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.respawnDelay);
            if (message.roundTimeLimit != null && Object.hasOwnProperty.call(message, "roundTimeLimit"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.roundTimeLimit);
            if (message.startingGold != null && Object.hasOwnProperty.call(message, "startingGold"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.startingGold);
            if (message.gravityMultiplier != null && Object.hasOwnProperty.call(message, "gravityMultiplier"))
                writer.uint32(/* id 6, wireType 5 =*/53).float(message.gravityMultiplier);
            return writer;
        };

        /**
         * Encodes the specified GameSettings message, length delimited. Does not implicitly {@link gamestate.GameSettings.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.GameSettings
         * @static
         * @param {gamestate.IGameSettings} message GameSettings message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameSettings.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameSettings message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.GameSettings
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.GameSettings} GameSettings
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameSettings.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.GameSettings();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.maxPlayers = reader.uint32();
                        break;
                    }
                case 2: {
                        message.friendlyFire = reader.bool();
                        break;
                    }
                case 3: {
                        message.respawnDelay = reader.float();
                        break;
                    }
                case 4: {
                        message.roundTimeLimit = reader.uint32();
                        break;
                    }
                case 5: {
                        message.startingGold = reader.uint32();
                        break;
                    }
                case 6: {
                        message.gravityMultiplier = reader.float();
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
         * Decodes a GameSettings message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.GameSettings
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.GameSettings} GameSettings
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameSettings.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameSettings message.
         * @function verify
         * @memberof gamestate.GameSettings
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameSettings.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.maxPlayers != null && message.hasOwnProperty("maxPlayers"))
                if (!$util.isInteger(message.maxPlayers))
                    return "maxPlayers: integer expected";
            if (message.friendlyFire != null && message.hasOwnProperty("friendlyFire"))
                if (typeof message.friendlyFire !== "boolean")
                    return "friendlyFire: boolean expected";
            if (message.respawnDelay != null && message.hasOwnProperty("respawnDelay"))
                if (typeof message.respawnDelay !== "number")
                    return "respawnDelay: number expected";
            if (message.roundTimeLimit != null && message.hasOwnProperty("roundTimeLimit"))
                if (!$util.isInteger(message.roundTimeLimit))
                    return "roundTimeLimit: integer expected";
            if (message.startingGold != null && message.hasOwnProperty("startingGold"))
                if (!$util.isInteger(message.startingGold))
                    return "startingGold: integer expected";
            if (message.gravityMultiplier != null && message.hasOwnProperty("gravityMultiplier"))
                if (typeof message.gravityMultiplier !== "number")
                    return "gravityMultiplier: number expected";
            return null;
        };

        /**
         * Creates a GameSettings message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.GameSettings
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.GameSettings} GameSettings
         */
        GameSettings.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.GameSettings)
                return object;
            let message = new $root.gamestate.GameSettings();
            if (object.maxPlayers != null)
                message.maxPlayers = object.maxPlayers >>> 0;
            if (object.friendlyFire != null)
                message.friendlyFire = Boolean(object.friendlyFire);
            if (object.respawnDelay != null)
                message.respawnDelay = Number(object.respawnDelay);
            if (object.roundTimeLimit != null)
                message.roundTimeLimit = object.roundTimeLimit >>> 0;
            if (object.startingGold != null)
                message.startingGold = object.startingGold >>> 0;
            if (object.gravityMultiplier != null)
                message.gravityMultiplier = Number(object.gravityMultiplier);
            return message;
        };

        /**
         * Creates a plain object from a GameSettings message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.GameSettings
         * @static
         * @param {gamestate.GameSettings} message GameSettings
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameSettings.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.maxPlayers = 0;
                object.friendlyFire = false;
                object.respawnDelay = 0;
                object.roundTimeLimit = 0;
                object.startingGold = 0;
                object.gravityMultiplier = 0;
            }
            if (message.maxPlayers != null && message.hasOwnProperty("maxPlayers"))
                object.maxPlayers = message.maxPlayers;
            if (message.friendlyFire != null && message.hasOwnProperty("friendlyFire"))
                object.friendlyFire = message.friendlyFire;
            if (message.respawnDelay != null && message.hasOwnProperty("respawnDelay"))
                object.respawnDelay = options.json && !isFinite(message.respawnDelay) ? String(message.respawnDelay) : message.respawnDelay;
            if (message.roundTimeLimit != null && message.hasOwnProperty("roundTimeLimit"))
                object.roundTimeLimit = message.roundTimeLimit;
            if (message.startingGold != null && message.hasOwnProperty("startingGold"))
                object.startingGold = message.startingGold;
            if (message.gravityMultiplier != null && message.hasOwnProperty("gravityMultiplier"))
                object.gravityMultiplier = options.json && !isFinite(message.gravityMultiplier) ? String(message.gravityMultiplier) : message.gravityMultiplier;
            return object;
        };

        /**
         * Converts this GameSettings to JSON.
         * @function toJSON
         * @memberof gamestate.GameSettings
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameSettings.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GameSettings
         * @function getTypeUrl
         * @memberof gamestate.GameSettings
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GameSettings.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.GameSettings";
        };

        return GameSettings;
    })();

    gamestate.GameState = (function() {

        /**
         * Properties of a GameState.
         * @memberof gamestate
         * @interface IGameState
         * @property {string|null} [gameId] GameState gameId
         * @property {number|null} [serverTime] GameState serverTime
         * @property {number|null} [tickNumber] GameState tickNumber
         * @property {number|null} [round] GameState round
         * @property {string|null} [phase] GameState phase
         * @property {number|null} [timeRemaining] GameState timeRemaining
         * @property {Object.<string,gamestate.IPlayer>|null} [players] GameState players
         * @property {Object.<string,gamestate.IEnemy>|null} [enemies] GameState enemies
         * @property {Object.<string,gamestate.IProjectile>|null} [projectiles] GameState projectiles
         * @property {Object.<string,gamestate.IDroppedLoot>|null} [droppedLoot] GameState droppedLoot
         * @property {Object.<string,gamestate.IWorldObject>|null} [worldObjects] GameState worldObjects
         * @property {Array.<gamestate.ITeamScore>|null} [teamScores] GameState teamScores
         * @property {gamestate.IMatchStats|null} [matchStats] GameState matchStats
         * @property {gamestate.IGameSettings|null} [settings] GameState settings
         * @property {gamestate.Team|null} [winningTeam] GameState winningTeam
         * @property {string|null} [mapName] GameState mapName
         * @property {number|null} [weatherIntensity] GameState weatherIntensity
         */

        /**
         * Constructs a new GameState.
         * @memberof gamestate
         * @classdesc Represents a GameState.
         * @implements IGameState
         * @constructor
         * @param {gamestate.IGameState=} [properties] Properties to set
         */
        function GameState(properties) {
            this.players = {};
            this.enemies = {};
            this.projectiles = {};
            this.droppedLoot = {};
            this.worldObjects = {};
            this.teamScores = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameState gameId.
         * @member {string} gameId
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.gameId = "";

        /**
         * GameState serverTime.
         * @member {number} serverTime
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.serverTime = 0;

        /**
         * GameState tickNumber.
         * @member {number} tickNumber
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.tickNumber = 0;

        /**
         * GameState round.
         * @member {number} round
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.round = 0;

        /**
         * GameState phase.
         * @member {string} phase
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.phase = "";

        /**
         * GameState timeRemaining.
         * @member {number} timeRemaining
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.timeRemaining = 0;

        /**
         * GameState players.
         * @member {Object.<string,gamestate.IPlayer>} players
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.players = $util.emptyObject;

        /**
         * GameState enemies.
         * @member {Object.<string,gamestate.IEnemy>} enemies
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.enemies = $util.emptyObject;

        /**
         * GameState projectiles.
         * @member {Object.<string,gamestate.IProjectile>} projectiles
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.projectiles = $util.emptyObject;

        /**
         * GameState droppedLoot.
         * @member {Object.<string,gamestate.IDroppedLoot>} droppedLoot
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.droppedLoot = $util.emptyObject;

        /**
         * GameState worldObjects.
         * @member {Object.<string,gamestate.IWorldObject>} worldObjects
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.worldObjects = $util.emptyObject;

        /**
         * GameState teamScores.
         * @member {Array.<gamestate.ITeamScore>} teamScores
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.teamScores = $util.emptyArray;

        /**
         * GameState matchStats.
         * @member {gamestate.IMatchStats|null|undefined} matchStats
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.matchStats = null;

        /**
         * GameState settings.
         * @member {gamestate.IGameSettings|null|undefined} settings
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.settings = null;

        /**
         * GameState winningTeam.
         * @member {gamestate.Team|null|undefined} winningTeam
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.winningTeam = null;

        /**
         * GameState mapName.
         * @member {string} mapName
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.mapName = "";

        /**
         * GameState weatherIntensity.
         * @member {number} weatherIntensity
         * @memberof gamestate.GameState
         * @instance
         */
        GameState.prototype.weatherIntensity = 0;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(GameState.prototype, "_winningTeam", {
            get: $util.oneOfGetter($oneOfFields = ["winningTeam"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new GameState instance using the specified properties.
         * @function create
         * @memberof gamestate.GameState
         * @static
         * @param {gamestate.IGameState=} [properties] Properties to set
         * @returns {gamestate.GameState} GameState instance
         */
        GameState.create = function create(properties) {
            return new GameState(properties);
        };

        /**
         * Encodes the specified GameState message. Does not implicitly {@link gamestate.GameState.verify|verify} messages.
         * @function encode
         * @memberof gamestate.GameState
         * @static
         * @param {gamestate.IGameState} message GameState message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameState.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.gameId);
            if (message.serverTime != null && Object.hasOwnProperty.call(message, "serverTime"))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.serverTime);
            if (message.tickNumber != null && Object.hasOwnProperty.call(message, "tickNumber"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.tickNumber);
            if (message.round != null && Object.hasOwnProperty.call(message, "round"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.round);
            if (message.phase != null && Object.hasOwnProperty.call(message, "phase"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.phase);
            if (message.timeRemaining != null && Object.hasOwnProperty.call(message, "timeRemaining"))
                writer.uint32(/* id 6, wireType 5 =*/53).float(message.timeRemaining);
            if (message.players != null && Object.hasOwnProperty.call(message, "players"))
                for (let keys = Object.keys(message.players), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 7, wireType 2 =*/58).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.gamestate.Player.encode(message.players[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            if (message.enemies != null && Object.hasOwnProperty.call(message, "enemies"))
                for (let keys = Object.keys(message.enemies), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 8, wireType 2 =*/66).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.gamestate.Enemy.encode(message.enemies[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            if (message.projectiles != null && Object.hasOwnProperty.call(message, "projectiles"))
                for (let keys = Object.keys(message.projectiles), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 9, wireType 2 =*/74).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.gamestate.Projectile.encode(message.projectiles[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            if (message.droppedLoot != null && Object.hasOwnProperty.call(message, "droppedLoot"))
                for (let keys = Object.keys(message.droppedLoot), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 10, wireType 2 =*/82).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.gamestate.DroppedLoot.encode(message.droppedLoot[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            if (message.worldObjects != null && Object.hasOwnProperty.call(message, "worldObjects"))
                for (let keys = Object.keys(message.worldObjects), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 11, wireType 2 =*/90).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.gamestate.WorldObject.encode(message.worldObjects[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            if (message.teamScores != null && message.teamScores.length)
                for (let i = 0; i < message.teamScores.length; ++i)
                    $root.gamestate.TeamScore.encode(message.teamScores[i], writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            if (message.matchStats != null && Object.hasOwnProperty.call(message, "matchStats"))
                $root.gamestate.MatchStats.encode(message.matchStats, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
            if (message.settings != null && Object.hasOwnProperty.call(message, "settings"))
                $root.gamestate.GameSettings.encode(message.settings, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
            if (message.winningTeam != null && Object.hasOwnProperty.call(message, "winningTeam"))
                writer.uint32(/* id 15, wireType 0 =*/120).int32(message.winningTeam);
            if (message.mapName != null && Object.hasOwnProperty.call(message, "mapName"))
                writer.uint32(/* id 16, wireType 2 =*/130).string(message.mapName);
            if (message.weatherIntensity != null && Object.hasOwnProperty.call(message, "weatherIntensity"))
                writer.uint32(/* id 17, wireType 5 =*/141).float(message.weatherIntensity);
            return writer;
        };

        /**
         * Encodes the specified GameState message, length delimited. Does not implicitly {@link gamestate.GameState.verify|verify} messages.
         * @function encodeDelimited
         * @memberof gamestate.GameState
         * @static
         * @param {gamestate.IGameState} message GameState message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameState.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameState message from the specified reader or buffer.
         * @function decode
         * @memberof gamestate.GameState
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {gamestate.GameState} GameState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameState.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.gamestate.GameState(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.gameId = reader.string();
                        break;
                    }
                case 2: {
                        message.serverTime = reader.float();
                        break;
                    }
                case 3: {
                        message.tickNumber = reader.uint32();
                        break;
                    }
                case 4: {
                        message.round = reader.uint32();
                        break;
                    }
                case 5: {
                        message.phase = reader.string();
                        break;
                    }
                case 6: {
                        message.timeRemaining = reader.float();
                        break;
                    }
                case 7: {
                        if (message.players === $util.emptyObject)
                            message.players = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.gamestate.Player.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.players[key] = value;
                        break;
                    }
                case 8: {
                        if (message.enemies === $util.emptyObject)
                            message.enemies = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.gamestate.Enemy.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.enemies[key] = value;
                        break;
                    }
                case 9: {
                        if (message.projectiles === $util.emptyObject)
                            message.projectiles = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.gamestate.Projectile.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.projectiles[key] = value;
                        break;
                    }
                case 10: {
                        if (message.droppedLoot === $util.emptyObject)
                            message.droppedLoot = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.gamestate.DroppedLoot.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.droppedLoot[key] = value;
                        break;
                    }
                case 11: {
                        if (message.worldObjects === $util.emptyObject)
                            message.worldObjects = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.gamestate.WorldObject.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.worldObjects[key] = value;
                        break;
                    }
                case 12: {
                        if (!(message.teamScores && message.teamScores.length))
                            message.teamScores = [];
                        message.teamScores.push($root.gamestate.TeamScore.decode(reader, reader.uint32()));
                        break;
                    }
                case 13: {
                        message.matchStats = $root.gamestate.MatchStats.decode(reader, reader.uint32());
                        break;
                    }
                case 14: {
                        message.settings = $root.gamestate.GameSettings.decode(reader, reader.uint32());
                        break;
                    }
                case 15: {
                        message.winningTeam = reader.int32();
                        break;
                    }
                case 16: {
                        message.mapName = reader.string();
                        break;
                    }
                case 17: {
                        message.weatherIntensity = reader.float();
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
         * Decodes a GameState message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof gamestate.GameState
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {gamestate.GameState} GameState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameState.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameState message.
         * @function verify
         * @memberof gamestate.GameState
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameState.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                if (!$util.isString(message.gameId))
                    return "gameId: string expected";
            if (message.serverTime != null && message.hasOwnProperty("serverTime"))
                if (typeof message.serverTime !== "number")
                    return "serverTime: number expected";
            if (message.tickNumber != null && message.hasOwnProperty("tickNumber"))
                if (!$util.isInteger(message.tickNumber))
                    return "tickNumber: integer expected";
            if (message.round != null && message.hasOwnProperty("round"))
                if (!$util.isInteger(message.round))
                    return "round: integer expected";
            if (message.phase != null && message.hasOwnProperty("phase"))
                if (!$util.isString(message.phase))
                    return "phase: string expected";
            if (message.timeRemaining != null && message.hasOwnProperty("timeRemaining"))
                if (typeof message.timeRemaining !== "number")
                    return "timeRemaining: number expected";
            if (message.players != null && message.hasOwnProperty("players")) {
                if (!$util.isObject(message.players))
                    return "players: object expected";
                let key = Object.keys(message.players);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.gamestate.Player.verify(message.players[key[i]]);
                    if (error)
                        return "players." + error;
                }
            }
            if (message.enemies != null && message.hasOwnProperty("enemies")) {
                if (!$util.isObject(message.enemies))
                    return "enemies: object expected";
                let key = Object.keys(message.enemies);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.gamestate.Enemy.verify(message.enemies[key[i]]);
                    if (error)
                        return "enemies." + error;
                }
            }
            if (message.projectiles != null && message.hasOwnProperty("projectiles")) {
                if (!$util.isObject(message.projectiles))
                    return "projectiles: object expected";
                let key = Object.keys(message.projectiles);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.gamestate.Projectile.verify(message.projectiles[key[i]]);
                    if (error)
                        return "projectiles." + error;
                }
            }
            if (message.droppedLoot != null && message.hasOwnProperty("droppedLoot")) {
                if (!$util.isObject(message.droppedLoot))
                    return "droppedLoot: object expected";
                let key = Object.keys(message.droppedLoot);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.gamestate.DroppedLoot.verify(message.droppedLoot[key[i]]);
                    if (error)
                        return "droppedLoot." + error;
                }
            }
            if (message.worldObjects != null && message.hasOwnProperty("worldObjects")) {
                if (!$util.isObject(message.worldObjects))
                    return "worldObjects: object expected";
                let key = Object.keys(message.worldObjects);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.gamestate.WorldObject.verify(message.worldObjects[key[i]]);
                    if (error)
                        return "worldObjects." + error;
                }
            }
            if (message.teamScores != null && message.hasOwnProperty("teamScores")) {
                if (!Array.isArray(message.teamScores))
                    return "teamScores: array expected";
                for (let i = 0; i < message.teamScores.length; ++i) {
                    let error = $root.gamestate.TeamScore.verify(message.teamScores[i]);
                    if (error)
                        return "teamScores." + error;
                }
            }
            if (message.matchStats != null && message.hasOwnProperty("matchStats")) {
                let error = $root.gamestate.MatchStats.verify(message.matchStats);
                if (error)
                    return "matchStats." + error;
            }
            if (message.settings != null && message.hasOwnProperty("settings")) {
                let error = $root.gamestate.GameSettings.verify(message.settings);
                if (error)
                    return "settings." + error;
            }
            if (message.winningTeam != null && message.hasOwnProperty("winningTeam")) {
                properties._winningTeam = 1;
                switch (message.winningTeam) {
                default:
                    return "winningTeam: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            }
            if (message.mapName != null && message.hasOwnProperty("mapName"))
                if (!$util.isString(message.mapName))
                    return "mapName: string expected";
            if (message.weatherIntensity != null && message.hasOwnProperty("weatherIntensity"))
                if (typeof message.weatherIntensity !== "number")
                    return "weatherIntensity: number expected";
            return null;
        };

        /**
         * Creates a GameState message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof gamestate.GameState
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {gamestate.GameState} GameState
         */
        GameState.fromObject = function fromObject(object) {
            if (object instanceof $root.gamestate.GameState)
                return object;
            let message = new $root.gamestate.GameState();
            if (object.gameId != null)
                message.gameId = String(object.gameId);
            if (object.serverTime != null)
                message.serverTime = Number(object.serverTime);
            if (object.tickNumber != null)
                message.tickNumber = object.tickNumber >>> 0;
            if (object.round != null)
                message.round = object.round >>> 0;
            if (object.phase != null)
                message.phase = String(object.phase);
            if (object.timeRemaining != null)
                message.timeRemaining = Number(object.timeRemaining);
            if (object.players) {
                if (typeof object.players !== "object")
                    throw TypeError(".gamestate.GameState.players: object expected");
                message.players = {};
                for (let keys = Object.keys(object.players), i = 0; i < keys.length; ++i) {
                    if (typeof object.players[keys[i]] !== "object")
                        throw TypeError(".gamestate.GameState.players: object expected");
                    message.players[keys[i]] = $root.gamestate.Player.fromObject(object.players[keys[i]]);
                }
            }
            if (object.enemies) {
                if (typeof object.enemies !== "object")
                    throw TypeError(".gamestate.GameState.enemies: object expected");
                message.enemies = {};
                for (let keys = Object.keys(object.enemies), i = 0; i < keys.length; ++i) {
                    if (typeof object.enemies[keys[i]] !== "object")
                        throw TypeError(".gamestate.GameState.enemies: object expected");
                    message.enemies[keys[i]] = $root.gamestate.Enemy.fromObject(object.enemies[keys[i]]);
                }
            }
            if (object.projectiles) {
                if (typeof object.projectiles !== "object")
                    throw TypeError(".gamestate.GameState.projectiles: object expected");
                message.projectiles = {};
                for (let keys = Object.keys(object.projectiles), i = 0; i < keys.length; ++i) {
                    if (typeof object.projectiles[keys[i]] !== "object")
                        throw TypeError(".gamestate.GameState.projectiles: object expected");
                    message.projectiles[keys[i]] = $root.gamestate.Projectile.fromObject(object.projectiles[keys[i]]);
                }
            }
            if (object.droppedLoot) {
                if (typeof object.droppedLoot !== "object")
                    throw TypeError(".gamestate.GameState.droppedLoot: object expected");
                message.droppedLoot = {};
                for (let keys = Object.keys(object.droppedLoot), i = 0; i < keys.length; ++i) {
                    if (typeof object.droppedLoot[keys[i]] !== "object")
                        throw TypeError(".gamestate.GameState.droppedLoot: object expected");
                    message.droppedLoot[keys[i]] = $root.gamestate.DroppedLoot.fromObject(object.droppedLoot[keys[i]]);
                }
            }
            if (object.worldObjects) {
                if (typeof object.worldObjects !== "object")
                    throw TypeError(".gamestate.GameState.worldObjects: object expected");
                message.worldObjects = {};
                for (let keys = Object.keys(object.worldObjects), i = 0; i < keys.length; ++i) {
                    if (typeof object.worldObjects[keys[i]] !== "object")
                        throw TypeError(".gamestate.GameState.worldObjects: object expected");
                    message.worldObjects[keys[i]] = $root.gamestate.WorldObject.fromObject(object.worldObjects[keys[i]]);
                }
            }
            if (object.teamScores) {
                if (!Array.isArray(object.teamScores))
                    throw TypeError(".gamestate.GameState.teamScores: array expected");
                message.teamScores = [];
                for (let i = 0; i < object.teamScores.length; ++i) {
                    if (typeof object.teamScores[i] !== "object")
                        throw TypeError(".gamestate.GameState.teamScores: object expected");
                    message.teamScores[i] = $root.gamestate.TeamScore.fromObject(object.teamScores[i]);
                }
            }
            if (object.matchStats != null) {
                if (typeof object.matchStats !== "object")
                    throw TypeError(".gamestate.GameState.matchStats: object expected");
                message.matchStats = $root.gamestate.MatchStats.fromObject(object.matchStats);
            }
            if (object.settings != null) {
                if (typeof object.settings !== "object")
                    throw TypeError(".gamestate.GameState.settings: object expected");
                message.settings = $root.gamestate.GameSettings.fromObject(object.settings);
            }
            switch (object.winningTeam) {
            default:
                if (typeof object.winningTeam === "number") {
                    message.winningTeam = object.winningTeam;
                    break;
                }
                break;
            case "TEAM_UNSPECIFIED":
            case 0:
                message.winningTeam = 0;
                break;
            case "RED":
            case 1:
                message.winningTeam = 1;
                break;
            case "BLUE":
            case 2:
                message.winningTeam = 2;
                break;
            case "GREEN":
            case 3:
                message.winningTeam = 3;
                break;
            case "YELLOW":
            case 4:
                message.winningTeam = 4;
                break;
            }
            if (object.mapName != null)
                message.mapName = String(object.mapName);
            if (object.weatherIntensity != null)
                message.weatherIntensity = Number(object.weatherIntensity);
            return message;
        };

        /**
         * Creates a plain object from a GameState message. Also converts values to other types if specified.
         * @function toObject
         * @memberof gamestate.GameState
         * @static
         * @param {gamestate.GameState} message GameState
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameState.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.teamScores = [];
            if (options.objects || options.defaults) {
                object.players = {};
                object.enemies = {};
                object.projectiles = {};
                object.droppedLoot = {};
                object.worldObjects = {};
            }
            if (options.defaults) {
                object.gameId = "";
                object.serverTime = 0;
                object.tickNumber = 0;
                object.round = 0;
                object.phase = "";
                object.timeRemaining = 0;
                object.matchStats = null;
                object.settings = null;
                object.mapName = "";
                object.weatherIntensity = 0;
            }
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                object.gameId = message.gameId;
            if (message.serverTime != null && message.hasOwnProperty("serverTime"))
                object.serverTime = options.json && !isFinite(message.serverTime) ? String(message.serverTime) : message.serverTime;
            if (message.tickNumber != null && message.hasOwnProperty("tickNumber"))
                object.tickNumber = message.tickNumber;
            if (message.round != null && message.hasOwnProperty("round"))
                object.round = message.round;
            if (message.phase != null && message.hasOwnProperty("phase"))
                object.phase = message.phase;
            if (message.timeRemaining != null && message.hasOwnProperty("timeRemaining"))
                object.timeRemaining = options.json && !isFinite(message.timeRemaining) ? String(message.timeRemaining) : message.timeRemaining;
            let keys2;
            if (message.players && (keys2 = Object.keys(message.players)).length) {
                object.players = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.players[keys2[j]] = $root.gamestate.Player.toObject(message.players[keys2[j]], options);
            }
            if (message.enemies && (keys2 = Object.keys(message.enemies)).length) {
                object.enemies = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.enemies[keys2[j]] = $root.gamestate.Enemy.toObject(message.enemies[keys2[j]], options);
            }
            if (message.projectiles && (keys2 = Object.keys(message.projectiles)).length) {
                object.projectiles = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.projectiles[keys2[j]] = $root.gamestate.Projectile.toObject(message.projectiles[keys2[j]], options);
            }
            if (message.droppedLoot && (keys2 = Object.keys(message.droppedLoot)).length) {
                object.droppedLoot = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.droppedLoot[keys2[j]] = $root.gamestate.DroppedLoot.toObject(message.droppedLoot[keys2[j]], options);
            }
            if (message.worldObjects && (keys2 = Object.keys(message.worldObjects)).length) {
                object.worldObjects = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.worldObjects[keys2[j]] = $root.gamestate.WorldObject.toObject(message.worldObjects[keys2[j]], options);
            }
            if (message.teamScores && message.teamScores.length) {
                object.teamScores = [];
                for (let j = 0; j < message.teamScores.length; ++j)
                    object.teamScores[j] = $root.gamestate.TeamScore.toObject(message.teamScores[j], options);
            }
            if (message.matchStats != null && message.hasOwnProperty("matchStats"))
                object.matchStats = $root.gamestate.MatchStats.toObject(message.matchStats, options);
            if (message.settings != null && message.hasOwnProperty("settings"))
                object.settings = $root.gamestate.GameSettings.toObject(message.settings, options);
            if (message.winningTeam != null && message.hasOwnProperty("winningTeam")) {
                object.winningTeam = options.enums === String ? $root.gamestate.Team[message.winningTeam] === undefined ? message.winningTeam : $root.gamestate.Team[message.winningTeam] : message.winningTeam;
                if (options.oneofs)
                    object._winningTeam = "winningTeam";
            }
            if (message.mapName != null && message.hasOwnProperty("mapName"))
                object.mapName = message.mapName;
            if (message.weatherIntensity != null && message.hasOwnProperty("weatherIntensity"))
                object.weatherIntensity = options.json && !isFinite(message.weatherIntensity) ? String(message.weatherIntensity) : message.weatherIntensity;
            return object;
        };

        /**
         * Converts this GameState to JSON.
         * @function toJSON
         * @memberof gamestate.GameState
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameState.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GameState
         * @function getTypeUrl
         * @memberof gamestate.GameState
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GameState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/gamestate.GameState";
        };

        return GameState;
    })();

    return gamestate;
})();

export { $root as default };
