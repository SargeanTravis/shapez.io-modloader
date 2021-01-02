import { Loader } from "../../core/loader";
import { formatItemsPerSecond, generateMatrixRotations } from "../../core/utils";
import { enumAngleToDirection, enumDirection, Vector } from "../../core/vector";
import { SOUNDS } from "../../platform/sound";
import { T } from "../../translations";
import { BeltComponent } from "../components/belt";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { THEME } from "../theme";

export class MetaBeltBuilding extends MetaBuilding {
    constructor() {
        super("belt");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaBeltBuilding.silhouetteColors[variant];

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
        let reward = MetaBeltBuilding.avaibleVariants[defaultBuildingVariant];

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
        let condition = MetaBeltBuilding.isRemovable[variant];

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
        let condition = MetaBeltBuilding.isRotateable[variant];

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
        const variants = MetaBeltBuilding.avaibleVariants;

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
        let reward = MetaBeltBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaBeltBuilding.dimensions[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "object" ? condition : new Vector(1, 1);
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        return MetaBeltBuilding.additionalStatistics[variant](root);
    }

    getIsReplaceable(variant) {
        return MetaBeltBuilding.isReplaceable[variant];
    }

    /**
     * @param {string} variant
     */
    getShowLayerPreview(variant) {
        let condition = MetaBeltBuilding.layerPreview[variant];

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
        let condition = MetaBeltBuilding.beltOverlayMatrices[entity.components.Belt.direction];
        if (condition) {
            condition = condition[rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaBeltBuilding.renderPins[variant];

        if (typeof condition === "function") {
            condition = condition();
        }

        return typeof condition === "boolean" ? condition : true;
    }

    getPlacementSound(variant) {
        return MetaBeltBuilding.placementSounds[variant];
    }

    getHasDirectionLockAvailable() {
        return true;
    }
    getStayInPlacementMode() {
        return true;
    }

    getRotateAutomaticallyWhilePlacing() {
        return true;
    }

    getSprite() {
        return null;
    }

    getPreviewSprite(rotationVariant) {
        switch (MetaBeltBuilding.variantToRotation[rotationVariant]) {
            case enumDirection.top:
                {
                    return Loader.getSprite("sprites/buildings/belt_top.png");
                }
            case enumDirection.left:
                {
                    return Loader.getSprite("sprites/buildings/belt_left.png");
                }
            case enumDirection.right:
                {
                    return Loader.getSprite("sprites/buildings/belt_right.png");
                }
            default:
                {
                    assertAlways(false, "Invalid belt rotation variant");
                }
        }
    }

    getBlueprintSprite(rotationVariant) {
        switch (MetaBeltBuilding.variantToRotation[rotationVariant]) {
            case enumDirection.top:
                {
                    return Loader.getSprite("sprites/blueprints/belt_top.png");
                }
            case enumDirection.left:
                {
                    return Loader.getSprite("sprites/blueprints/belt_left.png");
                }
            case enumDirection.right:
                {
                    return Loader.getSprite("sprites/blueprints/belt_right.png");
                }
            default:
                {
                    assertAlways(false, "Invalid belt rotation variant");
                }
        }
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new BeltComponent({
                direction: enumDirection.top, // updated later
            })
        );
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaBeltBuilding.componentVariations[variant](entity, rotationVariant);
    }

    /**
     * Should compute the optimal rotation variant on the given tile
     * @param {object} param0
     * @param {GameRoot} param0.root
     * @param {Vector} param0.tile
     * @param {number} param0.rotation
     * @param {string} param0.variant
     * @param {Layer} param0.layer
     * @return {{ rotation: number, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer }) {
        const topDirection = enumAngleToDirection[rotation];
        const rightDirection = enumAngleToDirection[(rotation + 90) % 360];
        const bottomDirection = enumAngleToDirection[(rotation + 180) % 360];
        const leftDirection = enumAngleToDirection[(rotation + 270) % 360];

        const { ejectors, acceptors } = root.logic.getEjectorsAndAcceptorsAtTile(tile);

        let hasBottomEjector = false;
        let hasRightEjector = false;
        let hasLeftEjector = false;

        let hasTopAcceptor = false;
        let hasLeftAcceptor = false;
        let hasRightAcceptor = false;

        // Check all ejectors
        for (let i = 0; i < ejectors.length; ++i) {
            const ejector = ejectors[i];

            if (ejector.toDirection === topDirection) {
                hasBottomEjector = true;
            } else if (ejector.toDirection === leftDirection) {
                hasRightEjector = true;
            } else if (ejector.toDirection === rightDirection) {
                hasLeftEjector = true;
            }
        }

        // Check all acceptors
        for (let i = 0; i < acceptors.length; ++i) {
            const acceptor = acceptors[i];
            if (acceptor.fromDirection === bottomDirection) {
                hasTopAcceptor = true;
            } else if (acceptor.fromDirection === rightDirection) {
                hasLeftAcceptor = true;
            } else if (acceptor.fromDirection === leftDirection) {
                hasRightAcceptor = true;
            }
        }

        // Soo .. if there is any ejector below us we always prioritize
        // this ejector
        if (!hasBottomEjector) {
            // When something ejects to us from the left and nothing from the right,
            // do a curve from the left to the top

            if (hasRightEjector && !hasLeftEjector) {
                return {
                    rotation: (rotation + 270) % 360,
                    rotationVariant: 2,
                };
            }

            // When something ejects to us from the right and nothing from the left,
            // do a curve from the right to the top
            if (hasLeftEjector && !hasRightEjector) {
                return {
                    rotation: (rotation + 90) % 360,
                    rotationVariant: 1,
                };
            }
        }

        // When there is a top acceptor, ignore sides
        // NOTICE: This makes the belt prefer side turns *way* too much!
        if (!hasTopAcceptor) {
            // When there is an acceptor to the right but no acceptor to the left,
            // do a turn to the right
            if (hasRightAcceptor && !hasLeftAcceptor) {
                return {
                    rotation,
                    rotationVariant: 2,
                };
            }

            // When there is an acceptor to the left but no acceptor to the right,
            // do a turn to the left
            if (hasLeftAcceptor && !hasRightAcceptor) {
                return {
                    rotation,
                    rotationVariant: 1,
                };
            }
        }

        return {
            rotation,
            rotationVariant: 0,
        };
    }
}

MetaBeltBuilding.silhouetteColors = {
    [defaultBuildingVariant]: THEME.map.chunkOverview.beltColor,
};

MetaBeltBuilding.variantToRotation = [enumDirection.top, enumDirection.left, enumDirection.right];

MetaBeltBuilding.beltOverlayMatrices = {
    [enumDirection.top]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
    [enumDirection.left]: generateMatrixRotations([0, 0, 0, 1, 1, 0, 0, 1, 0]),
    [enumDirection.right]: generateMatrixRotations([0, 0, 0, 0, 1, 1, 0, 1, 0]),
};

MetaBeltBuilding.placementSounds = {
    [defaultBuildingVariant]: SOUNDS.placeBelt,
};

MetaBeltBuilding.rotationVariants = [0, 1, 2];

MetaBeltBuilding.avaibleVariants = {
    [defaultBuildingVariant]: true,
};

MetaBeltBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
};

MetaBeltBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
};

MetaBeltBuilding.isReplaceable = {
    [defaultBuildingVariant]: true,
};

MetaBeltBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
};

MetaBeltBuilding.renderPins = {
    [defaultBuildingVariant]: null,
};

MetaBeltBuilding.layerPreview = {
    [defaultBuildingVariant]: null,
};

MetaBeltBuilding.layerByVariant = {
    [defaultBuildingVariant]: "regular",
};

MetaBeltBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.Belt.direction = MetaBeltBuilding.variantToRotation[rotationVariant];
    },
};

MetaBeltBuilding.additionalStatistics = {
    [defaultBuildingVariant]: root => [
        [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(root.hubGoals.getBeltBaseSpeed())],
    ],
};