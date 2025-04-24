
/**
 * 常用指令：
 * /kubejs persistent_data entity @s remove z_reached
 * /kubejs persistent_data entity @s merge {spawn_highway:true}
 * /kubejs persistent_data entity @s merge {spawn_mobs:true}
 * /kubejs persistent_data entity @s merge {spawn_mobs:false}
 * /kubejs persistent_data entity @s merge {stream_envo:true}
 * 
 * /kubejs persistent_data entity @s merge {followers:0}
 * /kubejs persistent_data entity @s merge {watching:0}
 */

let spawnMobStack = [] // 包含所有已加入队列的生成任务
let watchingStack = [] // 生成怪物时伴随的增加观看奖励
let goldPile = 0 // 生成怪物时伴随的金币奖励
let commentTicker = 0 // 倒计时到达20时，将 commentStack 加入 spawnMobStack，模拟限制评论频率的功能
let commentStack = []
let commentRash = false

PlayerEvents.tick( event => {
    const player = event.player
    const server = event.server
    const level = event.getLevel()
    let zValueReached = player.persistentData.getInt("z_reached")
    let player_z = player.getBlockZ();
    let player_x_double = player.getX();
    let spawnHighway = player.persistentData.getBoolean("spawn_highway")
    let spawnMobs = player.persistentData.getBoolean("spawn_mobs")
    let streamEnvo = player.persistentData.getBoolean("stream_envo")

    /**
     * 根据权重返回随机结果的函数
     * @param {Object} items 
     * @returns {String} 其中一项
     */
    function wrad(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        const rand = Math.random() * totalWeight;
        let cumulative = 0;
        
        for (const item of items) {
            cumulative += item.weight;
            if (rand < cumulative) {
                return item.value;
            }
        }
    }

    /* 生成地图部分 */
    function decideTemplate() {
        let temp_decider = Math.random()
        if (temp_decider > 3.0/4) {
            return "barrier"
        } else if (temp_decider > 2.0/4) {
            return "burn_car"
        } else if (temp_decider > 1.0/4) {
            return "crates"
        } else {
            return "car"
        }
    }

    if (spawnHighway && player_z > zValueReached && player_z % 16 == 0) {
        zValueReached = player_z
        // event.server.tell("z值记录："+zValueReached)
        player.persistentData.putInt("z_reached", zValueReached)

        let spawn_z = zValueReached+16*3
        // let spawn_z = zValueReached+16

        server.runCommandSilent(`/place template gunpve:highway_cob 0 -61 ${spawn_z}`)
        server.runCommandSilent(`/place template gunpve:highway 0 -61 ${spawn_z} none none 0.9`)
        let spawnRight = [[2, 0], [6, 0], [2, 8], [6, 8]]
        let spawnLeft = [[21, 15], [17, 15], [21, 7], [17, 7]]
        spawnRight.forEach(coor => {
            if (Math.random() < 1.0/4) {
                server.runCommandSilent(`/place template gunpve:${decideTemplate()} ${coor[0]} -60 ${spawn_z+coor[1]}`)
            }
        })
        spawnLeft.forEach(coor => {
            if (Math.random() < 1.0/4) {
                server.runCommandSilent(`/place template gunpve:${decideTemplate()} ${coor[0]} -60 ${spawn_z+coor[1]} 180`)
            }
        })
        server.runCommandSilent(`/kill @e[type=item,nbt={Item:{id:"minecraft:cyan_terracotta"}}]`)
    }

    /**
     * 实际生成怪物的函数，包含命名、按倍数放大等功能
     * @param {Object} task 包含生成所需要的各种信息
     */
    function summon_mob(task) {
        // console.log(task)
        let mob = level.createEntity(`minecraft:${task.id}`)
        // console.log("name & color")
        // console.log(task.name !== undefined && task.color !== undefined)
        // console.log("username")
        // console.log(task.username !== undefined)
        if (task.name !== undefined && task.color !== undefined) mob.setCustomName(Component.of({"text": task.name, "color": task.color, "bold": true}))
        if (task.username !== undefined) mob.persistentData.putString("username", task.username)
        mob.setCustomNameVisible(true)
        if (task.handItem !== undefined) { mob.mergeNbt({HandItems:[{id: task.handItem, Count: 1},{}]}) }
        if (task.extraNbt !== undefined) { mob.mergeNbt(task.extraNbt) }
        // console.log(task.multi > 1)
        if (task.multi > 1) {
            let multi = task.multi;
            let max_health =  mob.getAttribute('generic.max_health').getBaseValue()
            // console.log(max_health * multi)
            mob.getAttribute('generic.max_health').setBaseValue(max_health * multi);
            mob.health = max_health * multi;
            let attack_damage =  mob.getAttribute('generic.attack_damage').getBaseValue()
            mob.getAttribute('generic.attack_damage').setBaseValue(attack_damage * (1 + (multi-1)*0.25));
            mob.mergeNbt({ScaleFactor: Math.sqrt(multi)})
        }
        mob.setPosition(task.pos[0] - 0.1 + 0.2*Math.random(), -59.8, task.pos[1] - 0.1 + 0.2*Math.random())
        // let test = player.getRotationVector()
        // mob.setRotation(test.x, test.y)
        mob.spawn();
        server.runCommandSilent(`/team join Mob ${mob.getStringUuid()}`)
        if (task.effect !== undefined) {server.runCommandSilent(`effect give ${mob.getStringUuid()} ${task.effect} infinite 0 true`)}
    }

    /**
     * 一站式完成客户端展示玩意
     * @param {String} name 用户名
     * @param {String} sent "2x Piglin"
     * @param {String} chat "200 likes"
     */
    function client_pack(name, sent, chat) {
        Client.gui.setTitle("")
        Client.gui.setSubtitle(Component.of([{"text": name,"color": "red", "bold": true},{"text":" Sent ","color":"white"},{"text":sent,"color":"yellow"}]))
        // player.setStatusMessage(Component.of([{"text":"Sent ","color":"white"},{"text":sent,"color":"yellow"}]))
        player.displayClientMessage(Component.of([{"text": name,"color": "red"},{"text":` Sent ${chat}!`,"color":"white"},{"text":` (${sent})`,"color":"yellow", "bold": true}]), false)
    }

    /**
     * 生成boss栏
     * @param {String} username 用户名
     * @param {integer} max boss栏的最大值
     */
    function bossbar(username, max) {
        let id = username.toLowerCase()
        server.customBossEvents.create(id, Component.of({"text":username,"color":"yellow", "bold": true}))
        let bar = server.customBossEvents.get(id)
        bar.setColor("red")
        bar.setOverlay("progress")
        bar.setMax(max)
        bar.setValue(max)
        bar.setPlayers(server.players)
    }

    /* 直播模拟 */
    let smashLikePrb = 1e-5 // 单个粉丝刷赞概率
    let giftPrb = 1e-6 // 单个粉丝送礼概率
    if (streamEnvo) {
        let watching = player.persistentData.getInt("watching")
        let followers = player.persistentData.getInt("followers")

        if (watchingStack.length > 0) {watching += watchingStack.shift()} // 加上刷赞的观看奖励

        let newFollowerPrb = 1e-4 // 10分钟内涨粉概率0.70        
        newFollowerPrb *= (1.00 + watching * 0.05) // 200观看=>1分钟内涨粉概率0.73  1000观看=>10秒内涨粉概率0.64
        if (Math.random() < newFollowerPrb) {followers++} // 触发涨粉

        if (followers > 0) smashLikePrb = 1 - (1-smashLikePrb)**followers // 100粉=>1分钟内刷赞概率0.70
        giftPrb = 1 - (1-giftPrb)**followers // 100粉=>10分钟内送礼概率0.70

        // 随机变化和粉丝数变化
        if (watching == 0 && Math.random() < 0.2) watching += Math.round(3 * Math.random())
        if (watching >= 1 && Math.random() < 0.2) watching += Math.round(-1 + 1.8 * Math.random())
        if (followers >= 1 && Math.random() < 5e-5) followers += Math.floor(-1 * Math.random())
        // 更新观看和粉丝数
        player.setStatusMessage(Component.of([
            {"text":"Watching: ","color":"aqua", "bold": true},{"text":watching.toFixed(0),"color":"white", "bold": true},
            {"text":"  Followers: ","color":"aqua", "bold": true},{"text":followers.toFixed(0),"color":"white", "bold": true}
        ]))
        player.persistentData.putInt("watching", watching)
        player.persistentData.putInt("followers", followers)
    }

    /* 生成怪物部分 */
    let mobX = 1.5
    if (spawnMobs) {
        if (player_x_double < 3.5) {
            mobX = 1.5
        } else if (player_x_double < 7.5) {
            mobX = 5.5
        } else if (player_x_double < 12) {
            mobX = 9.5
        } else if (player_x_double < 16.5) {
            mobX = 14.5
        } else if (player_x_double < 20.5) {
            mobX = 18.5
        } else {
            mobX = 22.5
        }
    }
    if (spawnMobs) { // 评论模拟部分
        commentTicker++
        let msg = genMsg()
        if (commentRash) { // 1秒内出现评论概率0.64
            if (Math.random() < 0.05) commentStack.push({count: 1,id: "creeper", name: msg, color: "yellow"})
        } else { // 5秒内出现评论概率0.63
            if (Math.random() < 0.01) commentStack.push({count: 1,id: "creeper", name: msg, color: "yellow"})
        }
        // 倒计时到了就把 comment 都转移到 spawnMobStack
        if (commentTicker >= 20) {
            let watchForComm = player.persistentData.getInt("watching") // 获取观看数据
            watchForComm == 0 ? 1 :  watchForComm // 防止为0时的问题
            commentStack.forEach(comment => {
                comment.pos = [mobX, player.getZ()+12.0]
                spawnMobStack.push(comment)
            })
            // 每次触发评论时，都有概率更新commentRash状态 
            if (!commentRash && Math.random() < watchForComm / (watchForComm+50) - 0.1) {
                commentRash = true // 进入 commentRash
            }
            if (commentRash && Math.random() < 5 / watchForComm + 0.1) {
                commentRash = false // 退出 commentRash
            }
            commentTicker = 0 // 重置倒计时
        }
    } 
    // smashLikePrb = 0.1
    if (spawnMobs && Math.random() < smashLikePrb) { // 刷赞的怪物生成事件
        // console.log("smashLikePrb: "+smashLikePrb)
        // event.server.tell("计时器触发")
        var name = genName()
        if (Math.random() > 0.2) { // 200赞事件-猪灵x2
            client_pack(name, "2x Piglin", "200 likes")
            bossbar(name, 2*16)
            spawnMobStack.push({count: 2,
                id: "piglin", pos: [mobX, player.getZ()+12.0], name: name, color: "red", username: name.toLowerCase(), 
                handItem: "crossbow", extraNbt: {IsImmuneToZombification: true},
            })
            watchingStack.push(Math.ceil(2.00 * Math.random()))
        } else { // 1000赞事件-闪电苦力怕x3
            client_pack(name, "3x Charged Creeper", "1000 likes")
            spawnMobStack.push({count: 3,
                id: "creeper", pos: [mobX, player.getZ()+8.0], name: name, color: "red"
            })
            spawnMobStack.push({count: 1, 
                id: "lightning_bolt", pos: [mobX, player.getZ()+8.0]
            })
            watchingStack.push(Math.ceil(10.00 * Math.random()))
        }
    }
    // giftPrb = 0.01
    const giftDict = [
        {value: "piglin",           weight: 60},
        {value: "creeper",          weight: 15},
        {value: "skeleton",         weight: 15},
        {value: "ravager",          weight: 10},
        {value: "pillager",         weight: 5},
        {value: "wither_skeleton",  weight: 2},
        {value: "zombie",           weight: 2},
        {value: "elder_guardian",   weight: 0.5},
        {value: "warden",           weight: 0.1},
    ]
    if (spawnMobs && Math.random() < giftPrb) { // 送礼的怪物生成事件
        var name = genName()
        switch (wrad(giftDict)) {
            case "piglin": // 猪灵x2 - 虞美人1g
                client_pack(name, "2x Piglin", "Poppy")
                bossbar(name, 2*16)
                spawnMobStack.push({count: 2,
                    id: "piglin", pos: [mobX, player.getZ()+12.0], name: name, color: "red", username: name.toLowerCase(), 
                    handItem: "crossbow", extraNbt: {IsImmuneToZombification: true},
                })
                goldPile += 1
                break
            case "creeper": // 闪电苦力怕x3 - 玫瑰5g
                client_pack(name, "3x Charged Creeper", "Rose")
                bossbar(name, 3*20)
                spawnMobStack.push({count: 3,
                    id: "creeper", pos: [mobX, player.getZ()+8.0], name: name, color: "red", username: name.toLowerCase(),
                })
                spawnMobStack.push({count: 1, 
                    id: "lightning_bolt", pos: [mobX, player.getZ()+8.0]
                })
                goldPile += 5
                break
            case "skeleton": // 骷髅x5 - 孢子花10g
                client_pack(name, "5x Skelenton", "Blossom")
                bossbar(name, 5*20)
                spawnMobStack.push({count: 5,
                    id: "skeleton", pos: [mobX, player.getZ()+12.0], name: name, color: "red", username: name.toLowerCase(), 
                    handItem: "bow",
                })
                goldPile += 10
                break
        }

        // if (spawnMobTimer["ravager"] == 0) {
        //     let name = genName()
        //     client_pack(name, "3x Ravager")
        //     spawnMobStack.push({count: 3,
        //         id: "ravager", pos: [mobX, player.getZ()+12.0], name: name, color: "red"
        //     })
        //     spawnMobTimer["ravager"] = Math.ceil(20 * 120 * (0.5+1.0*Math.random()))
        // } else {
        //     // event.server.tell("ravager: "+spawnMobTimer["ravager"])
        //     // spawnMobTimer["ravager"]--;
        // }

        // if (spawnMobTimer["pillager"] == 0) {
        //     let name = genName()
        //     client_pack(name, "20x Pillager")
        //     spawnMobStack.push({count: 20,
        //         id: "pillager", pos: [mobX, player.getZ()+16.0], name: name, color: "red", handItem: "crossbow"
        //     })
        //     spawnMobTimer["pillager"] = Math.ceil(20 * 300 * (0.25+1.5*Math.random()))
        // } else {
        //     // event.server.tell("pillager: "+spawnMobTimer["pillager"])
        //     // spawnMobTimer["pillager"]--;
        // }

        // if (spawnMobTimer["wither_skeleton"] == 0) {
        //     let name = genName()
        //     client_pack(name, "40x Wither Skelenton")
        //     spawnMobStack.push({count: 20,
        //         id: "wither_skeleton", pos: [mobX, player.getZ()+16.0], name: name, color: "red", handItem: "stone_sword", multi: 2
        //     })
        //     spawnMobTimer["wither_skeleton"] = Math.ceil(20 * 600 * (0.25+1.5*Math.random()))
        // } else {
        //     // event.server.tell("wither_skeleton: "+spawnMobTimer["wither_skeleton"])
        //     // spawnMobTimer["wither_skeleton"]--;
        // }

        // if (spawnMobTimer["zombie"] == 0) {
        //     let name = genName()
        //     client_pack(name, "60x Zombie")
        //     spawnMobStack.push({count: 30,
        //         id: "zombie", pos: [mobX, player.getZ()+16.0], name: name, color: "red", multi: 2
        //     })
        //     spawnMobTimer["zombie"] = Math.ceil(20 * 600 * (0.25+1.5*Math.random()))
        // } else {
        //     // event.server.tell("zombie: "+spawnMobTimer["zombie"])
        //     // spawnMobTimer["zombie"]--;
        // }

        // if (spawnMobTimer["elder_guardian"] == 0) {
        //     let name = genName()
        //     client_pack(name, "25x Elder Guardian")
        //     spawnMobStack.push({count: 25,
        //         id: "elder_guardian", pos: [mobX, player.getZ()+16.0], name: name, color: "red", effect: "water_breathing"
        //     })
        //     spawnMobTimer["elder_guardian"] = Math.ceil(20 * 600 * (0.25+1.5*Math.random()))
        // } else {
        //     // event.server.tell("elder_guardian: "+spawnMobTimer["elder_guardian"])
        //     // spawnMobTimer["elder_guardian"]--;
        // }

        // if (spawnMobTimer["warden"] == 0) {
        //     let name = genName()
        //     client_pack(name, "1x Warden")
        //     spawnMobStack.push({count: 1,
        //         id: "warden", pos: [mobX, player.getZ()+16.0], name: name, color: "red"
        //     })
        //     spawnMobTimer["warden"] = Math.ceil(20 * 600 * (0.25+1.5*Math.random()))
        // } else {
        //     // event.server.tell("warden: "+spawnMobTimer["warden"])
        //     // spawnMobTimer["warden"]--;
        // }
    }
    // console.log(spawnMobStack)
    if (spawnMobStack.length > 0) {
        // console.log(spawnMobStack)
        let spawnTask = spawnMobStack[0]
        if (spawnTask.count > 0) {
            summon_mob(spawnTask);
            spawnTask.count--;
        } else {
            spawnMobStack.shift()
        }
    }
    if (goldPile > 0) {
        level.playSound(null, player.x, player.y, player.z, 'entity.experience_orb.pickup', 'ambient', 0.5, 0.75+0.1*Math.random())
        player.give('thermal:gold_coin')
        goldPile--;
    }

    
})

function genName() {
    const adjectives = ['Cool', 'Fast', 'Happy', 'Chill', 'Lazy', 'Sneaky', 'Smart', 'Epic'];
    const animals = ['Cat', 'Dog', 'Panda', 'Fox', 'Koala', 'Tiger', 'Wolf', 'Bear'];
    const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adj}${animal}_${number}`;
}
  
function genMsg() {
    const messages = ['hi','hiii','hii','hello','how are you','can you see me?','omg','lol','uwu','abc','nice','no way','that’s good','good','boo','huh','hahahahahaha','hahahahaha','hahahaha','pog','gg','cool','so cool','thats cool','that’s cool','what happened?','any one watching?','who else is watching?','🔥🔥🔥🔥🔥','🔥🔥🔥','gooooo','let’s gooo','let’s go','bruh','dude','same here','what’s up','whats up','😂😂😂','😂😂','that was crazy','that is crazy','thats crazy','that’s crazy','this is wild','wild'];
    let roll = Math.random();
    // 20% chance: return a single random letter
    if (roll < 0.2) {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        return letters[Math.floor(Math.random() * letters.length)];
    }
    // Pick a random message
    let msg = messages[Math.floor(Math.random() * messages.length)];
    // 30% chance: convert to uppercase
    if (roll < 0.3) {
        msg = msg.toUpperCase();
    }
    return msg;
}