

EntityEvents.spawned(event => {
    // event.entity.persistentData.getBoolean()
    // event.entity.getX()
    // event.entity.navigation.moveTo(0, -60, 0, 2.0);
    // event.entity.moveTo(parseFloat(1.1), parseFloat(1.1), parseFloat(1.1))
})

LevelEvents.tick(event => {
    event.level.getEntities().forEach( entity => {
        // console.log(entity)
        // console.log(entity === undefined)
        if (entity === undefined) return

        // 更新导航点代码
        if (entity.persistentData.getInt("navi_code") !== 0.0) {
            let navi_code = entity.persistentData.getInt("navi_code");
            let navi_pos = get_nevi_pos(MAP_POS, navi_code);
            let entity_pos = [entity.getX(), entity.getY(), entity.getZ()]

            // [0]代表地图阵营范围，[1]代表哪条路，[2]代表哪个导航点（0为最接近峡谷）
            let navi_code_arr =String(navi_code).split('').map(Number);

            if (entity.persistentData.getInt("side") == 1) { // 敌军，黄方->白方
                if ( is_in_range(3, navi_pos, entity_pos) ) { // 距离在3m内说明已到达设定的路径点
                    if (navi_code_arr[0] == 1 ) { // 导航点导向黄方
                        if (navi_code_arr[2] == 0) { // 已抵达峡谷附近，切换为导向白方
                            entity.persistentData.putInt("navi_code", navi_code+100)
                        } else { // 未抵达峡谷附近
                            entity.persistentData.putInt("navi_code", navi_code-1)
                        }
                    } else if(navi_code_arr[0] == 2 ) { // 导航点导向白方
                        if (navi_code_arr[2] == 5) { // 已抵达白方基地附近，切换为导向白方基地
                            entity.persistentData.putInt("navi_code", 250)
                        } else if(navi_code != 250) { // 未抵达白方基地附近
                            entity.persistentData.putInt("navi_code", navi_code+1)
                        }
                    }
                }
            } else if(!entity.persistentData.getInt("side") == 2) { // 友军，白方->黄方
                if ( is_in_range(3, navi_pos, entity_pos) ) { // 距离在3m内说明已到达设定的路径点
                    if (navi_code_arr[0] == 2 ) { // 导航点导向白方
                        if (navi_code_arr[2] == 0) { // 已抵达峡谷附近，切换为导向黄方
                            entity.persistentData.putInt("navi_code", navi_code-100)
                        } else { // 未抵达峡谷附近
                            entity.persistentData.putInt("navi_code", navi_code-1)
                        }
                    } else if(navi_code_arr[0] == 1 ) { // 导航点导向黄方
                        if (navi_code_arr[2] == 5) { // 已抵达黄方基地附近，切换为导向黄方基地
                            entity.persistentData.putInt("navi_code", 150)
                        } else if( navi_code != 150) { // 未抵达黄方基地附近
                            entity.persistentData.putInt("navi_code", navi_code+1)
                        }
                    }
                }
            }
            // console.log('persistentData存的navi_code：'+entity.persistentData.getInt("navi_code"))
            
        }

        if(entity.persistentData.getBoolean("target_spotted")) return
        
        // 设置导航点
        if (entity.persistentData.getInt("navi_count_down") > 1) { // 倒计时递减
            let count_down = entity.persistentData.getInt("navi_count_down");
            // console.log(count_down)
            entity.persistentData.putInt("navi_count_down", count_down-1);
        } else if (entity.persistentData.getInt("navi_count_down") === 1) { // 倒计时归零
            let navi_code = entity.persistentData.getInt("navi_code");
            let navi_pos = get_nevi_pos(MAP_POS, navi_code);
            // console.log(entity)
            entity.navigation.moveTo(navi_pos[0], navi_pos[1], navi_pos[2], 1.0);
            entity.persistentData.putInt("navi_count_down", 20+1); // 重置1秒倒计时
        }

        
    })
})