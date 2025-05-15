export const WORLD_SIZE = 2000;
export const FOOD_SIZE = 5;
export const STARTING_SCORE = 100;
export const AI_STARTING_SCORE = 50;  // Starting score for AI players
export const FOOD_SCORE = 10;
export const FOOD_COUNT = 100;
export const AI_COUNT = 10;
export const COLLISION_THRESHOLD = 1.1; // 10% size difference needed for consumption

// Boost mechanics
export const BOOST_SPEED_MULTIPLIER = 2.5;  // How much faster when boosting
export const BOOST_MASS_LOSS_RATE = 0.2;    // Mass lost per second while boosting
export const BOOST_MIN_SCORE = 20;         // Minimum score needed to boost

// Split mechanics
export const MIN_SPLIT_SCORE = 40;  // Minimum score needed to split
export const SPLIT_VELOCITY = 12;   // Initial velocity of split cells
export const MAX_PLAYER_CELLS = 16; // Maximum number of cells a player can have
export const SPLIT_COOLDOWN = 5000; // Milliseconds before cells can merge back
export const MERGE_DISTANCE = 2;    // Distance threshold for merging cells

// Merge mechanics
export const MERGE_COOLDOWN = 10000;  // Time in ms before cells can merge
export const MERGE_FORCE = 0.3;       // Strength of the merging force
export const MERGE_START_FORCE = 0.1; // Initial attraction force (before merge cooldown)

export const COLORS = {
    PLAYER: '#008080',  // Teal color
    MINIMAP: {
        PLAYER: '#4CAF50',
        TOP_PLAYER: '#FFC107',
        OTHER: 'rgba(255, 255, 255, 0.3)'
    }
};