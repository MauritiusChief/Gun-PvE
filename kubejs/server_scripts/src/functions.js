
function generate_wave(level, map_var, wave_number) {
    const wave = WAVE_DATA[wave_number];
    for (let mob_id in wave) {
        // console.log(mob_id)
        wave[mob_id].start.forEach( start_code => {
            generate_enemy(level, map_var, mob_id, start_code, wave[mob_id].amount);
        })
    }
}

function generate_enemy(level, map_var, enemy_id, start_code, amount) {
    Array(parseInt(amount)).fill().forEach(() => {
        // console.log(enemy_data)
        let enemy_data = ENEMY_PRESET[enemy_id];
        let newEnemy = level.createEntity(`minecraft:${enemy_data.id}`)
        newEnemy.spawn()
        newEnemy.persistentData.putInt("side", 1); // 敌人阵营标记
        newEnemy.persistentData.putBoolean("target_spotted", false); // 在追踪目标标记
        const naviMap = {
            0: 103, 1: 103, 2: 113, 3: 113, 4: 123, 5: 123,
        }
        newEnemy.persistentData.putInt("navi_code", naviMap[start_code]) // 导航点记录
        newEnemy.persistentData.putInt("navi_count_down", 1) // 导航倒计时
        let nbt = newEnemy.getNbt()
        nbt.HandItems = enemy_data.HandItems;
        nbt.ArmorItems = enemy_data.ArmorItems;
        nbt.Tags = [];
        nbt.Tags.push("Enemy");
        nbt.PersistenceRequired = true;
        newEnemy.mergeNbt(nbt);
        const coordinatesMap = {
            0: 'north_start', 1: 'north_start',
            2: 'mid_start1', 3: 'mid_start2', 
            4: 'south_start', 5: 'south_start',
        };
        let start_pos = map_var['yellow_side'][coordinatesMap[start_code]]
        newEnemy.absMoveTo(start_pos[0]+0.5, start_pos[1]+0.5, start_pos[2]+0.5)
    })
}

function generate_entity(level, map_var, entity_id, start_code, amount) {
    
}

function get_nevi_pos(map_var, navi_code) {

    let navi_code_arr =String(navi_code).split('').map(Number);
    // console.log('get_nevi_pos读取到的code：'+navi_code_arr.toString())
    let side = '';
    if (navi_code_arr[0] == 1) {
        side = 'yellow_side';
    } else if (navi_code_arr[0] == 2) {
        side = 'white_side';
    }
    // console.log(side)

    const coordinatesMap = {
        50: 'base',

        5: 'north_lane_5',
        4: 'north_lane_4',
        3: 'north_lane_3',  
        2: 'north_lane_2',
        1: 'north_lane_1',
        0: 'north_lane_0',

        13: 'mid_lane_3', 14: 'mid_lane_3', 15: 'mid_lane_3',
        12: 'mid_lane_2',
        11: 'mid_lane_1',
        10: 'mid_lane_0',

        25: 'south_lane_5',
        24: 'south_lane_4', 
        23: 'south_lane_3', 
        22: 'south_lane_2',
        21: 'south_lane_1',
        20: 'south_lane_0',
    };

    // console.log(map_var[side][coordinatesMap[navi_code%100]])
    // console.log(map_var[side][coordinatesMap[navi_code%100]].toString())

    return map_var[side][coordinatesMap[navi_code%100]];
    // return [0,0,0]
}

function is_in_range(range, arr_1, arr_2) {
    // console.log(arr_1.toString())
    // console.log(arr_2.toString())
    let dist = Math.sqrt( Math.pow(arr_1[0]-arr_2[0],2) + Math.pow(arr_1[1]-arr_2[1], 2) + Math.pow(arr_1[2]-arr_2[2], 2) )
    // console.log(`range = ${range}, dist = ${dist}`)
    // console.log(range > dist)
    return range > dist
}