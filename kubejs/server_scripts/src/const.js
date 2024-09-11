
// 仿冰封要塞
const MAP_POS = {
    yellow_side: {
        // 黄方代码均为 1XX
        base: [11, -58, 0], // code: 150

        north_start: [14, -58, -11],
        mid_start1: [10, -58, -7],
        mid_start2: [10, -58, 7],
        south_start: [14, -58, 11],
        
        // 上路 10X
        north_lane_5: [19, -58, -11], // code: 105
        north_lane_4: [23, -58, -13], // code: 104
        north_lane_3: [35, -59, -13], // code: 103
        north_lane_2: [46, -59, -24], // code: 102
        north_lane_1: [56, -59, -24], // code: 101
        north_lane_0: [61, -59, -29], // code: 100
        // 中路 11X
        mid_lane_3: [27, -58, 0], // code: 113, 114, 115
        mid_lane_2: [62, -58, 0], // code: 112
        mid_lane_1: [66, -57, 3], // code: 111
        mid_lane_0: [85, -57, 3], // code: 110
        // 下路 12X
        south_lane_5: [19, -58, 11], // code: 125
        south_lane_4: [23, -58, 13], // code: 124
        south_lane_3: [35, -59, 13], // code: 123
        south_lane_2: [46, -59, 24], // code: 122
        south_lane_1: [56, -59, 24], // code: 121
        south_lane_0: [61, -59, 29], // code: 120
    },
    white_side: {
        // 白方代码均为 2XX
        base: [168, -58, 0], // code: 250

        north_start: [165, -58, -11],
        mid_start1: [169, -58, -7],
        mid_start2: [169, -58, 7],
        south_start: [165, -58, 11],
        
        // 上路 20X
        north_lane_5: [160, -58, -11], // code: 205
        north_lane_4: [156, -58, -13], // code: 204
        north_lane_3: [144, -59, -13], // code: 203
        north_lane_2: [133, -59, -24], // code: 202
        north_lane_1: [123, -59, -24], // code: 201
        north_lane_0: [118, -59, -29], // code: 200
        // 中路 21X
        mid_lane_3: [152, -58, 0], // code: 213, 214, 215
        mid_lane_2: [117, -58, 0], // code: 212
        mid_lane_1: [113, -57, -3], // code: 211
        mid_lane_0: [94, -57, -3], // code: 210
        // 下路22X
        south_lane_5: [160, -58, 11], // code: 225
        south_lane_4: [156, -58, 13], // code: 224
        south_lane_3: [144, -59, 13], // code: 223
        south_lane_2: [133, -59, 24], // code: 222
        south_lane_1: [123, -59, 24], // code: 221
        south_lane_0: [118, -59, 29], // code: 220
    },
}

const ENEMY_PRESET = {
    norm: {
        id: "zombie",
        HandItems: [{},{}],
        ArmorItems: [{},{},{},{}],
    },
    shovel: {
        id: "zombie",
        HandItems: [{id:"minecraft:iron_shovel",Count:1},{}],
        ArmorItems: [{},{},{},{id:"minecraft:iron_helmet",Count:1}],
    }
}

const WAVE_DATA = {
    1: {
        norm: {amount: 1, start: [0, 1, 2, 3, 4, 5]},
    },
    2: {
        norm: {amount: 1, start: [0, 1, 2, 3, 4, 5]},
        shovel: {amount: 1, start: [0, 1, 2, 3, 4, 5]},
    }
}