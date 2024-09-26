
const Vec3 = Java.loadClass(`net.minecraft.world.phys.Vec3`)

function generate_wave(level, map_var, wave_number) {
    const enemy_wave = ENEMY_WAVE_DATA[wave_number];
    for (let enemy_id in enemy_wave) {
        // console.log(enemy_id)
        enemy_wave[enemy_id].start.forEach( start_code => {
            generate_enemy(level, map_var, enemy_id, start_code, enemy_wave[enemy_id].amount);
        })
    }
    const ally_wave = ALLY_WAVE_DATA[wave_number];
    for (let ally_id in ally_wave) {
        // console.log(ally_id)
        ally_wave[ally_id].start.forEach( start_code => {
            generate_ally(level, map_var, ally_id, start_code, ally_wave[ally_id].amount);
        })
    }
}

function generate_entity(level, map_var, entity_id, start_code, amount, preset, side, tag, naviMap, side_key) {
    Array(parseInt(amount)).fill().forEach(() => {
        let entity_data = preset[entity_id];
        let newEntity = level.createEntity(entity_data.id);
        newEntity.spawn();
        newEntity.persistentData.putInt("side", side); // 阵营标记
        newEntity.persistentData.putBoolean("target_spotted", false); // 在追踪目标标记
        newEntity.persistentData.putInt("navi_code", naviMap[start_code]); // 导航点记录
        newEntity.persistentData.putInt("navi_count_down", 1); // 导航倒计时
        
        let nbt = newEntity.getNbt();
        nbt.HandItems = entity_data.HandItems;
        nbt.ArmorItems = entity_data.ArmorItems;
        // nbt.Motion[0] = side == 2 ? -1.0 : 1.0;
        nbt.Tags = [];
        nbt.Tags.push(tag); // 标签（敌人或盟友）
        nbt.PersistenceRequired = true;
        nbt.ScaleFactor = 0.75 + Math.random() * 0.5;
        newEntity.mergeNbt(nbt);
        const coordinatesMap = {
            0: 'north_start', 1: 'north_start',
            2: 'mid_start1', 3: 'mid_start2', 
            4: 'south_start', 5: 'south_start',
        };
        let start_pos = map_var[side_key][coordinatesMap[start_code]];
        let rand_off_x = -0.05 + 0.1*Math.random();
        let rand_off_z = -0.05 + 0.1*Math.random();
        newEntity.moveTo(new Vec3(start_pos[0] + rand_off_x, start_pos[1], start_pos[2] + rand_off_z));
    });
}

function generate_enemy(level, map_var, enemy_id, start_code, amount) {
    const naviMap = {
        0: 105, 1: 105, 2: 113, 3: 113, 4: 125, 5: 125,
    }
    generate_entity(level, map_var, enemy_id, start_code, amount, ENEMY_PRESET, 1, "Enemy", naviMap, 'yellow_side');
}

function generate_ally(level, map_var, ally_id, start_code, amount) {
    const naviMap = {
        0: 205, 1: 205, 2: 213, 3: 213, 4: 225, 5: 225,
    }
    generate_entity(level, map_var, ally_id, start_code, amount, ALLY_PRESET, 2, "Ally", naviMap, 'white_side');
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