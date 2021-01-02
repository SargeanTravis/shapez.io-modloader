import { Loader } from "../../core/loader";
import { generateMatrixRotations } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { SOUNDS } from "../../platform/sound";
import { enumWireType, enumWireVariant, WireComponent } from "../components/wire";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaWireBuilding extends MetaBuilding {
    constructor() {
        super("wire");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaWireBuilding.silhouetteColors[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "string" ? condition : "#ffffff";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        let reward = MetaWireBuilding.avaibleVariants[defaultBuildingVariant];

        if (typeof reward === "function") {
            // @ts-ignore
            reward = reward(root);
        }

        if (typeof reward === "boolean") {
            // @ts-ignore
            return reward;
        }

        // @ts-ignore
        return typeof reward === "string" ? root.hubGoals.isRewardUnlocked(reward) : false;
    }

    /**
     * @param {string} variant
     */
    getIsRemovable(variant) {
        let condition = MetaWireBuilding.isRemovable[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "boolean" ? condition : true;
    }

    /**
     * @param {string} variant
     */
    getIsRotateable(variant) {
        let condition = MetaWireBuilding.isRotateable[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "boolean" ? condition : true;
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const variants = MetaWireBuilding.avaibleVariants;

        let available = [];
        for (const variant in variants) {
            let reward = variants[variant];
            if (typeof reward === "function") {
                // @ts-ignore
                reward = reward(root);
            }

            if (typeof reward === "boolean") {
                available.push(variant);
                continue;
            }

            if (!root.hubGoals.isRewardUnlocked(reward)) continue;
            available.push(variant);
        }

        return available;
    }

    /**
     * Returns the edit layer of the building
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Layer}
     */
    getLayer(root, variant) {
        let reward = MetaWireBuilding.layerByVariant[defaultBuildingVariant];

        if (typeof reward === "function") {
            // @ts-ignore
            reward = reward();
        }

        // @ts-ignore
        return typeof reward === "string" ? reward : "regular";
    }

    /**
     * @param {string} variant
     */
    getDimensions(variant) {
        let condition = MetaWireBuilding.dimensions[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "object" ? condition : new Vector(1, 1);
    }

    /**
     * @param {string} variant
     */
    getShowLayerPreview(variant) {
            let condition = MetaWireBuilding.layerPreview[variant];

            if (typeof condition === "function") {
                // @ts-ignore
                condition = condition();
            }

            // @ts-ignore
            return typeof condition === "string" ? condition : null;
        }
        /**
         * @param {number} rotation
         * @param {number} rotationVariant
         * @param {string} variant
         * @param {Entity} entity
         * @returns {Array<number>|null}
         */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        let condition;
        if (MetaWireBuilding.overlayMatrices[variant]) {
            condition = MetaWireBuilding.overlayMatrices[variant][rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaWireBuilding.renderPins[variant];

        if (typeof condition === "function") {
            condition = condition();
        }

        return typeof condition === "boolean" ? condition : true;
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaWireBuilding.componentVariations[variant](entity, rotationVariant);
    }

    getHasDirectionLockAvailable() {
        return true;
    }

    getStayInPlacementMode(variant) {
        // TODO: add variant check
        return true;
    }

    getPlacementSound(variant) {
        return MetaWireBuilding.placementSounds[variant];
    }

    getRotateAutomaticallyWhilePlacing(variant) {
        // TODO: add variant check
        return true;
    }

    getSprite(variamt) {
        // TODO: add variant check
        return null;
    }

    getIsReplaceable(variant) {
        return MetaWireBuilding.isReplaceable[variant];
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new WireComponent({}));
    }

    /**
     *
     * @param {number} rotationVariant
     * @param {string} variant
     * @returns {import("../../core/draw_utils").AtlasSprite}
     */
    getPreviewSprite(rotationVariant, variant) {
        const wireVariant = MetaWireBuilding.wireVariantToVariant[variant];
        switch (MetaWireBuilding.rotationVariantToType[rotationVariant]) {
            case enumWireType.forward:
                {
                    return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_forward.png");
                }
            case enumWireType.turn:
                {
                    return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_turn.png");
                }
            case enumWireType.split:
                {
                    return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_split.png");
                }
            case enumWireType.cross:
                {
                    return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_cross.png");
                }
            default:
                {
                    assertAlways(false, "Invalid wire rotation variant");
                }
        }
    }

    getBlueprintSprite(rotationVariant, variant) {
        return this.getPreviewSprite(rotationVariant, variant);
    }

    /**
     * Should compute the optimal rotation variant on the given tile
     * @param {object} param0
     * @param {GameRoot} param0.root
     * @param {Vector} param0.tile
     * @param {number} param0.rotation
     * @param {string} param0.variant
     * @param {string} param0.layer
     * @return {{ rotation: number, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer }) {
        const wireVariant = MetaWireBuilding.wireVariantToVariant[variant];
        const connections = {
            top: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.top }),
            right: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.right }),
            bottom: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.bottom }),
            left: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.left }),
        };

        let flag = 0;
        flag |= connections.top ? 0x1000 : 0;
        flag |= connections.right ? 0x100 : 0;
        flag |= connections.bottom ? 0x10 : 0;
        flag |= connections.left ? 0x1 : 0;

        let targetType = enumWireType.forward;

        // First, reset rotation
        rotation = 0;

        switch (flag) {
            case 0x0000:
                // Nothing
                break;

            case 0x0001:
                // Left
                rotation += 90;
                break;

            case 0x0010:
                // Bottom
                // END
                break;

            case 0x0011:
                // Bottom | Left
                targetType = enumWireType.turn;
                rotation += 90;
                break;

            case 0x0100:
                // Right
                rotation += 90;
                break;

            case 0x0101:
                // Right | Left
                rotation += 90;
                break;

            case 0x0110:
                // Right | Bottom
                targetType = enumWireType.turn;
                break;

            case 0x0111:
                // Right | Bottom | Left
                targetType = enumWireType.split;
                break;

            case 0x1000:
                // Top
                break;

            case 0x1001:
                // Top | Left
                targetType = enumWireType.turn;
                rotation += 180;
                break;

            case 0x1010:
                // Top | Bottom
                break;

            case 0x1011:
                // Top | Bottom | Left
                targetType = enumWireType.split;
                rotation += 90;
                break;

            case 0x1100:
                // Top | Right
                targetType = enumWireType.turn;
                rotation -= 90;
                break;

            case 0x1101:
                // Top | Right | Left
                targetType = enumWireType.split;
                rotation += 180;
                break;

            case 0x1110:
                // Top | Right | Bottom
                targetType = enumWireType.split;
                rotation -= 90;
                break;

            case 0x1111:
                // Top | Right | Bottom | Left
                targetType = enumWireType.cross;
                break;
        }

        return {
            // Clamp rotation
            rotation: (rotation + 360 * 10) % 360,
            rotationVariant: MetaWireBuilding.rotationVariantToType.indexOf(targetType),
        };
    }
}

MetaWireBuilding.variants = {
    second: "second",
};

MetaWireBuilding.rotationVariants = [0, 1, 2, 3];

MetaWireBuilding.placementSounds = {
    [defaultBuildingVariant]: SOUNDS.placeBelt,
    [MetaWireBuilding.variants.second]: SOUNDS.placeBelt,
};

MetaWireBuilding.wireVariantToVariant = {
    [defaultBuildingVariant]: "first",
    [MetaWireBuilding.variants.second]: "second",
};

MetaWireBuilding.rotationVariantToType = [
    enumWireType.forward,
    enumWireType.turn,
    enumWireType.split,
    enumWireType.cross,
];

MetaWireBuilding.overlayMatrices = {
    [enumWireType.forward]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
    [enumWireType.split]: generateMatrixRotations([0, 0, 0, 1, 1, 1, 0, 1, 0]),
    [enumWireType.turn]: generateMatrixRotations([0, 0, 0, 0, 1, 1, 0, 1, 0]),
    [enumWireType.cross]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
};

MetaWireBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_wires_painter_and_levers,
    [MetaWireBuilding.variants.second]: enumHubGoalRewards.reward_wires_painter_and_levers,
};

MetaWireBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
    [MetaWireBuilding.variants.second]: new Vector(1, 1),
};

MetaWireBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
    [MetaWireBuilding.variants.second]: true,
};

MetaWireBuilding.isReplaceable = {
    [defaultBuildingVariant]: true,
    [MetaWireBuilding.variants.second]: true,
};

MetaWireBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
    [MetaWireBuilding.variants.second]: true,
};

MetaWireBuilding.renderPins = {
    [defaultBuildingVariant]: null,
    [MetaWireBuilding.variants.second]: null,
};

MetaWireBuilding.layerPreview = {
    [defaultBuildingVariant]: "wires",
    [MetaWireBuilding.variants.second]: "wires",
};

MetaWireBuilding.layerByVariant = {
    [defaultBuildingVariant]: "wires",
    [MetaWireBuilding.variants.second]: "wires",
};

MetaWireBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#61ef6f",
    [MetaWireBuilding.variants.second]: "#61ef6f",
};

MetaWireBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.Wire.type = MetaWireBuilding.rotationVariantToType[rotationVariant];
        entity.components.Wire.variant = "first";
    },

    [MetaWireBuilding.variants.second]: (entity, rotationVariant) => {
        entity.components.Wire.type = MetaWireBuilding.rotationVariantToType[rotationVariant];
        entity.components.Wire.variant = "second";
    },
};