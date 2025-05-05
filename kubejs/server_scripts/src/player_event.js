
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

// 放弃以刻的形式随机，转而以这种形式
let newFollowerTicker = 0 
let newFollowerTrigger = 20 - 10 + 20*Math.random() // 平均1秒(20tick)检测一次
let smashLikeTicker = 0 
let smashLikeTrigger = 20 * (10 - 5 + 10*Math.random()) // 平均10秒检测一次
let giftTicker = 0 
let giftTrigger = 20 * (10 - 1 + 2*Math.random()) // 平均10秒检测一次

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
    const spawnY = 63

    // player.getName().getString()

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
    const templateDict = [
        {value: "barrier",  weight: 3},
        {value: "burn_car", weight: 3},
        {value: "crates",   weight: 1},
        {value: "car",      weight: 2},
    ]
    const randomSuffixs = [
        {value: " 180 none 0.9",        weight: 1},
        {value: " none none 0.9",       weight: 1},
        {value: " 180 front_back 0.9",  weight: 1},
        {value: " none front_back 0.9", weight: 1},
        {value: " 180 left_right 0.9",  weight: 1},
        {value: " none left_right 0.9", weight: 1},
    ]
    const carSuffixs = [
        {value: " 180 none 0.9",  weight: 1},
        {value: " none none 0.9", weight: 4},
    ]

    // console.log("生成高速路部分")
    if (spawnHighway && player_z > zValueReached && player_z % 16 == 0) {
        zValueReached = player_z
        // event.server.tell("z值记录："+zValueReached)
        player.persistentData.putInt("z_reached", zValueReached)

        // let spawn_z = zValueReached
        let spawn_z = zValueReached+16*4
        // let spawn_z = zValueReached+16

        server.runCommandSilent(`/place template gunpve:highway_cob 0 ${spawnY-1} ${spawn_z}`)
        server.runCommandSilent(`/place template gunpve:highway 0 ${spawnY-1} ${spawn_z} none none 0.9`)
        let spawnXlist = [2, 6, 15, 19]
        let spawnZlist = [0, 8]
        for (let x=0; x<spawnXlist.length; x++) {
            for (let z=0; z<spawnZlist.length; z++) {
                if (Math.random() > 1.0/4) {continue}
                let template = wrad(templateDict)
                let suffix = ""
                let xShift = 0
                let zShift = 0
                switch (template) {
                    case "car":
                    case "burn_car":
                        suffix = wrad(carSuffixs)
                        switch (suffix) {
                            case " 180 none 0.9":
                                xShift = 2; zShift = 7;
                                break
                            default:
                                break
                        }
                        break
                    case "barrier":
                    case "crates":
                        suffix = wrad(randomSuffixs)
                        switch (suffix) {
                            case " none left_right 0.9":
                            case " 180 front_back 0.9":
                                zShift = 7;
                                break
                            case " none front_back 0.9":
                            case " 180 left_right 0.9":
                                xShift = 2;
                                break
                            case " 180 none 0.9":
                                xShift = 2; zShift = 7;
                                break
                            default:
                                break
                        }
                        break
                }
                server.runCommandSilent(`/place template gunpve:${template} ${spawnXlist[x]+xShift} ${spawnY} ${spawn_z+spawnZlist[z]+zShift}${suffix}`)
            }
        }
        // server.runCommandSilent(`/kill @e[type=item,nbt={Item:{id:"minecraft:cyan_terracotta"}}]`)
        server.runCommandSilent(`/kill @e[type=item]`)
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
        // console.log("userid")
        // console.log(task.userid !== undefined)
        if (task.name !== undefined && task.color !== undefined) mob.setCustomName(Component.of({"text": task.name, "color": task.color, "bold": true}))
        if (task.userid !== undefined) mob.persistentData.putString("userid", task.userid)
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
        mob.setPosition(task.pos[0] - 0.1 + 0.2*Math.random(), spawnY+0.2, task.pos[1] - 0.1 + 0.2*Math.random())
        // let test = player.getRotationVector()
        // mob.setRotation(test.x, test.y)
        mob.spawn();
        // 此处生成坐骑并让 mob 骑上去
        if (task.riding !== undefined) {
            const riding = task.riding
            let carrier = level.createEntity(`minecraft:${riding.id}`)
            if (task.userid !== undefined) mob.persistentData.putString("userid", task.userid)
            carrier.spawn()
            mob.startRiding(carrier)
        }
        server.runCommandSilent(`/team join Mob ${mob.getStringUuid()}`)
        if (task.effects !== undefined) {
            let effects = task.effects
            effects.forEach( effect => {
                let command = `/effect give ${mob.getStringUuid()} ${effect.id} ${effect.t} ${effect.lv} true`
                // console.log(command)
                server.runCommandSilent(command)
            })
        }
    }

    /**
     * 一站式完成客户端展示玩意
     * @param {String} name 用户名
     * @param {String} mob "2x猪灵"
     * @param {String} act "点了200个赞!"
     */
    function client_pack(name, mob, act) {
        Client.gui.setTitle("")
        Client.gui.setSubtitle(Component.of([{"text": name, "color": "red", "bold": true},{"text":" 赠送了 ","color":"white"},{"text":mob,"color":"yellow"}]))
        // player.setStatusMessage(Component.of([{"text":"Sent ","color":"white"},{"text":sent,"color":"yellow"}]))
        player.displayClientMessage(Component.of([{"text": name,"color": "red"},{"text":` ${act}`,"color":"white"},{"text":` (${mob})`,"color":"yellow", "bold": true}]), false)
    }

    /**
     * 生成boss栏
     * @param {String} username 用户名
     * @param {integer} max boss栏的最大值
     */
    function bossbar(username, max) {
        let userid = nameToId(username)
        server.customBossEvents.create(userid, Component.of({"text":username,"color":"white", "bold": true}))
        let bar = server.customBossEvents.get(userid)
        bar.setColor("red")
        bar.setOverlay("progress")
        bar.setMax(max)
        bar.setValue(max)
        bar.setPlayers(server.players)
    }

    /**
     * 生成数个飞溅的不可拾取的过一会消失的物品来展示送出的礼物
     * @param {String} item "create:sweet_roll"
     * @param {Array} pos 生成的位置
     */
    function burstItem(item) {
        let eyePos = player.eyePosition; // 获取玩家眼睛的位置
        let lookAngle = player.lookAngle; // 获取玩家的视线角度（单位：弧度）
        let offset = lookAngle.multiply(1, 1, 1); // 1米的偏移量
        let targetPos = eyePos.add(offset); // 计算目标坐标
        // level.spawnParticles('minecraft:flame', false, targetPos.x(), targetPos.y(), targetPos.z(), 0.0, 0.0, 0.0, 1, 0)
        for (let i=0; i<5; i++) {
            var itemEntity = level.createEntity("item")
            itemEntity.mergeNbt({Item:{id:item,Count:1},PickupDelay:-1,Age:5900})
            itemEntity.setMotion(0.5*Math.random()-0.25, 0.25, 0.5*Math.random()-0.25)
            itemEntity.setPosition(targetPos.x(), targetPos.y()-0.5, targetPos.z())
            itemEntity.spawn()
        }
    }

    /* 直播模拟 */
    // console.log("直播模拟部分")
    let smashLikePrb = 2e-3 // 每个观看10秒内刷赞概率
    let giftPrb = 2e-3 // 每个粉丝10秒内送礼概率
    let newFollowerPrb = 0.002 // 每秒涨粉概率，10分钟涨粉概率0.7
    if (streamEnvo) {
        let watching = player.persistentData.getInt("watching")
        let followers = player.persistentData.getInt("followers")

        if (watchingStack.length > 0) {watching += watchingStack.shift()} // 加上刷赞的观看奖励

        // newFollowerPrb *= (1.00 + watching * 0.05) // 200观看=>1分钟内涨粉概率0.73  1000观看=>10秒内涨粉概率0.64
        newFollowerPrb *= watching <= 400 ? (1.00 + watching * 0.05) : 21.0

        // 由于精度问题，采用近似公式：泊松分布逼近
        if (watching > 0) smashLikePrb = 1 - Math.exp(-smashLikePrb * watching/2)
        if (followers > 0) giftPrb = 1 - Math.exp(-giftPrb * followers)
        giftPrb *= watching > 400 ? (watching * 0.01 - 3) : 1.0 // 400观看之后，加成提现到送礼概率上

        // 随机变化和粉丝数变化
        if (Math.random() < 0.2) {
            if (watching >= 400) {
                watching += Math.round(-1 + 1.5 * Math.random())
            } else if (watching >= 100) {
                watching += Math.round(-1 + 1.8 * Math.random())
            } else if (watching >= 50) {
                watching += Math.round(-1 + 1.9 * Math.random())
            } else if (watching > 0) {
                watching += Math.round(-1 + 2 * Math.random())
            } else {
                watching += Math.round(3 * Math.random())
            }
        }
        // 更新观看和粉丝数
        player.setStatusMessage(Component.of([
            {"text":"观看人数: ","color":"aqua", "bold": true},{"text":watching.toFixed(0),"color":"white", "bold": true},
            {"text":"  粉丝数: ","color":"aqua", "bold": true},{"text":followers.toFixed(0),"color":"white", "bold": true}
        ]))
        player.persistentData.putInt("watching", watching)
        player.persistentData.putInt("followers", followers)
    }

    /**
     * 从输入的可选X坐标中找到离玩家最近的
     * @param {*} x 玩家的X坐标
     * @param {*} arr 备选的X坐标，同时也是几条车道的标记线
     * @returns 怪物应该生成的X坐标
     */
    function findClosest(x, arr) {
        // 初始化变量，记录最小差值和对应的数字
        let closest = arr[0];
        let minDiff = Math.abs(x - closest);
        // 遍历数组，查找最接近 a 的数字
        for (let i = 1; i < arr.length; i++) {
            let diff = Math.abs(x - arr[i]);
            if (diff < minDiff) {
                closest = arr[i];
                minDiff = diff;
            }
        }
        return closest;
    }
    /* 生成怪物部分 */
    let mobX = 1.5
    // console.log("更新怪物生成X坐标和计时器")
    if (spawnMobs) {
        mobX = findClosest(player_x_double, [1.5, 5.5, 9.5, 14.5, 18.5, 22.5])
        // 计时器更新也用此处
        newFollowerTicker++
        smashLikeTicker++
        giftTicker++
        // console.log(`${newFollowerTicker}, ${smashLikeTicker}, ${giftTicker}`)
    }
    // console.log("生成怪物-评论模拟部分")
    if (spawnMobs) { // 评论模拟部分
        commentTicker++
        let msg = genMsg()
        if (commentRash) {
            if (Math.random() < 0.05) commentStack.push({count: 1, id: "creeper", name: msg, color: "yellow"})
        } else {
            if (Math.random() < 0.005) commentStack.push({count: 1, id: "creeper", name: msg, color: "yellow"})
        }
        // 倒计时到了就把 comment 都转移到 spawnMobStack
        if (commentTicker >= 20) {
            // burstItem("minecraft:gunpowder", [mobX, player.getZ()+12.0])
            // console.log("[🟢]生成队列中目前还有 "+spawnMobStack.length+" 项：")
            // console.log(spawnMobStack)
            commentStack.forEach(comment => {
                comment.pos = [mobX, player.getZ()+12.0]
                spawnMobStack.push(comment)
            })
            commentStack = [] // 重置 commentStack
            // 每次触发评论时，都有概率更新commentRash状态 
            if (!commentRash && Math.random() < 0.1 ) {
                commentRash = true // 进入 commentRash
                // server.tell("[DEBUG] 进入 commentRash")
            }
            if (commentRash && Math.random() < 0.2) {
                commentRash = false // 退出 commentRash
                // server.tell("[DEBUG] 退出 commentRash")
            }
            commentTicker = 0 // 重置倒计时
        }
    } 
    // newFollowerPrb = 0.01
    // console.log("生成怪物-模拟涨粉部分")
    if (spawnMobs && newFollowerTicker >= newFollowerTrigger) { // 模拟涨粉
        if (Math.random() < newFollowerPrb) {
            let followIncre = player.persistentData.getInt("followers")
            var name = genName()
            client_pack(name, "2x猪灵", "关注了!")
            // 生成欢迎烟花
            // Item.of('minecraft:firework_rocket', 3, '{Fireworks:{Explosions:[{Colors:[I;11743532],Flicker:1b,Trail:1b,Type:1b,"forge:shape_type":"LARGE_BALL"}],Flight:1b}}')
            let fireWork = level.createEntity("firework_rocket")
            fireWork.mergeNbt(`{FireworksItem:{Count:1b,id:"minecraft:firework_rocket",tag:{Fireworks:{Explosions:[{Colors:[I;11743532],Flicker:1b,Trail:1b,Type:1b,"forge:shape_type":"LARGE_BALL"}],Flight:1b}}}, LifeTime:20}`)
            fireWork.setPosition(mobX, spawnY+1, player.getZ()+12.0)
            fireWork.spawn()

            spawnMobStack.push({count: 2,
                id: "piglin", pos: [mobX, player.getZ()+12.0], name: name, color: "red", userid: nameToId(name), 
                handItem: "crossbow", extraNbt: {IsImmuneToZombification: true},
            })
            // console.log("[🔺]触发涨粉")
            // console.log(spawnMobStack)
            followIncre++
            player.persistentData.putInt("followers", followIncre)
        }
        newFollowerTicker = 0
        newFollowerTrigger = 20 - 10 + 20*Math.random() // 平均1秒(20tick)检测一次
        // console.log("newFollowerPrb: "+newFollowerPrb)
        // console.log(`${newFollowerTicker}, ${smashLikeTicker}, ${giftTicker}`)
    }
    // smashLikePrb = 0.01
    // console.log("生成怪物-模拟刷赞部分")
    if (spawnMobs && smashLikeTicker >= smashLikeTrigger) { // 刷赞的怪物生成事件
        if (Math.random() < smashLikePrb) {
            var name = genName()
            if (Math.random() > 0.2) { // 200赞事件-猪灵x2
                client_pack(name, "2x猪灵", "点了200个赞!")
                level.spawnParticles('minecraft:lava', true, mobX, spawnY+1, player.getZ()+12.0, 0.2, 0.1, 0.2, 20, 50)
                spawnMobStack.push({count: 2,
                    id: "piglin", pos: [mobX, player.getZ()+12.0], name: name, color: "red", userid: nameToId(name), 
                    handItem: "crossbow", extraNbt: {IsImmuneToZombification: true},
                })
                watchingStack.push(Math.ceil(2.00 * Math.random()))
            } else { // 1000赞事件-闪电苦力怕x3
                client_pack(name, "3x闪电苦力怕", "点了1000个赞!")
                level.spawnParticles('minecraft:lava', true, mobX, spawnY+1, player.getZ()+12.0, 0.2, 0.1, 0.2, 20, 50)
                spawnMobStack.push({count: 3,
                    id: "creeper", pos: [mobX, player.getZ()+8.0], name: name, color: "red", 
                    effects: [{id: "resistance", lv: "5", t: "5"}]
                })
                spawnMobStack.push({count: 1, 
                    id: "lightning_bolt", pos: [mobX, player.getZ()+8.0]
                })
                watchingStack.push(Math.ceil(10.00 * Math.random()))
            }
        }
        smashLikeTicker = 0
        smashLikeTrigger = 20 * (10 - 5 + 10*Math.random()) // 平均10秒检测一次
        // console.log("smashLikePrb: "+smashLikePrb)
    }
    // giftPrb = 1.0
    // console.log("生成怪物-模拟送礼部分")
    const giftDict = [
        {value: "piglin",           weight: 60},
        {value: "creeper",          weight: 20},
        {value: "skeleton",         weight: 15},
        {value: "ravager",          weight: 10},
        {value: "pillager",         weight: 3},
        {value: "wither_skeleton",  weight: 2},
        {value: "zombie",           weight: 2},
        {value: "elder_guardian",   weight: 0.5},
        {value: "warden",           weight: 0.1},
    ]
    // console.log(wrad(giftDict))
    if (spawnMobs && giftTicker >= giftTrigger) { // 送礼的怪物生成事件
        if (Math.random() < giftPrb) {
            var name = genName()
            var giftItem = wrad(giftDict)
            console.log("[🟨]触发送礼: "+giftItem)
            switch (giftItem) {
                case "piglin": // 猪灵x2 - 虞美人1g
                    client_pack(name, "2x猪灵", "赠送了虞美人!")
                    burstItem("minecraft:poppy")
                    player.displayClientMessage(Component.of({"text":"到账1G","color": "yellow"}), false)
                    spawnMobStack.push({count: 2,
                        id: "piglin", pos: [mobX, player.getZ()+12.0], name: name, color: "red", userid: nameToId(name), 
                        handItem: "crossbow", extraNbt: {IsImmuneToZombification: true},
                    })
                    goldPile += 1
                    break
                case "creeper": // 闪电苦力怕x3 - 玫瑰5g
                    client_pack(name, "3x闪电苦力怕", "赠送了玫瑰!")
                    burstItem("minecraft:rose_bush")
                    player.displayClientMessage(Component.of({"text":"到账5G","color": "yellow"}), false)
                    spawnMobStack.push({count: 3,
                        id: "creeper", pos: [mobX, player.getZ()+8.0], name: name, color: "red", 
                        effects: [{id: "resistance", lv: "5", t: "5"}]
                    })
                    spawnMobStack.push({count: 1, 
                        id: "lightning_bolt", pos: [mobX, player.getZ()+8.0]
                    })
                    goldPile += 5
                    break
                case "skeleton": // 骷髅x5 - 孢子花10g
                    client_pack(name, "5x骷髅", "赠送了孢子花!")
                    burstItem("minecraft:spore_blossom")
                    player.displayClientMessage(Component.of({"text":"到账10G","color": "yellow"}), false)
                    bossbar(name, 5*20)
                    spawnMobStack.push({count: 5,
                        id: "skeleton", pos: [mobX, player.getZ()+12.0], name: name, color: "red", userid: nameToId(name), 
                        handItem: "bow",
                    })
                    goldPile += 10
                    break
                case "ravager": // 劫掠兽x5 - 甜甜圈30g
                    client_pack(name, "3x劫掠兽", "赠送了甜甜圈!")
                    burstItem("create:sweet_roll")
                    player.displayClientMessage(Component.of({"text":"到账30G","color": "yellow"}), false)
                    bossbar(name, 3*100)
                    spawnMobStack.push({count: 3,
                        id: "ravager", pos: [mobX, player.getZ()+12.0], name: name, color: "red", userid: nameToId(name), 
                    })
                    goldPile += 30
                    break
                case "pillager": // 掠夺者x20 - 蛋糕100g
                    client_pack(name, "20x掠夺者", "赠送了蛋糕!")
                    burstItem("minecraft:cake")
                    player.displayClientMessage(Component.of({"text":"到账100G","color": "yellow"}), false)
                    bossbar(name, 20*24)
                    spawnMobStack.push({count: 20,
                        id: "pillager", pos: [mobX, player.getZ()+12.0], name: name, color: "red", userid: nameToId(name), 
                        handItem: "crossbow",
                    })
                    goldPile += 100
                    break
                case "wither_skeleton": // 凋零骷髅x40 - 护目镜199g
                    client_pack(name, "40x凋零骷髅", "赠送了护目镜!")
                    burstItem("create:goggles")
                    player.displayClientMessage(Component.of({"text":"到账199G","color": "yellow"}), false)
                    bossbar(name, 40*20)
                    spawnMobStack.push({count: 20,
                        id: "wither_skeleton", pos: [mobX, player.getZ()+12.0], name: name, color: "red", userid: nameToId(name), 
                        handItem: "stone_sword", multi: 2
                    })
                    goldPile += 199
                    break
                case "zombie": // 僵尸x60 - 美西螈299g
                    client_pack(name, "60x僵尸", "赠送了美西螈!")
                    burstItem("minecraft:axolotl_bucket")
                    player.displayClientMessage(Component.of({"text":"到账299G","color": "yellow"}), false)
                    bossbar(name, 60*20)
                    spawnMobStack.push({count: 30,
                        id: "zombie", pos: [mobX, player.getZ()+12.0], name: name, color: "red", userid: nameToId(name), 
                        multi: 2,
                    })
                    goldPile += 299
                    break
                case "elder_guardian": // 远古守卫者x25 - 绿宝石块500g
                    client_pack(name, "25x远古守卫者", "赠送了绿宝石块!")
                    burstItem("minecraft:emerald_block")
                    player.displayClientMessage(Component.of({"text":"到账500G","color": "yellow"}), false)
                    bossbar(name, 25*80)
                    spawnMobStack.push({count: 5,
                        id: "elder_guardian", pos: [mobX, player.getZ()+12.0], name: name, color: "red", userid: nameToId(name), 
                        effects: [{id: "water_breathing", lv: "0", t: "infinite"}]
                    })
                    goldPile += 500
                    break
                case "warden": // 监守者 - 金苹果699g
                    client_pack(name, "监守者", "赠送了金苹果!")
                    burstItem("minecraft:enchanted_golden_apple")
                    player.displayClientMessage(Component.of({"text":"到账699G","color": "yellow"}), false)
                    bossbar(name, 500)
                    spawnMobStack.push({count: 1,
                        id: "warden", pos: [mobX, player.getZ()+12.0], name: name, color: "red", userid: nameToId(name), 
                    })
                    goldPile += 699
                    break
            }

        }
        giftTicker = 0
        giftTrigger = 20 * (10 - 5 + 10*Math.random()) // 平均10秒检测一次
        // console.log("giftPrb: "+giftPrb)
    }

    // console.log(spawnMobStack)
    // console.log("实际生成怪物（之前的都只是加入生成队列）")
    if (spawnMobStack.length > 0) {
        // while (spawnMobStack.length > 0 && spawnMobStack[0].count <= 0) {
        //     console.log("[⬜]移除 count 为 0 的项");
        //     spawnMobStack.shift();
        // }
        // console.log(spawnMobStack)
        let spawnTask = spawnMobStack[0]
        // if (spawnTask.id == "piglin") {console.log("[🔴]检测到生成猪灵"); console.log(spawnMobStack)}
        if (spawnTask.count > 0) {
            summon_mob(spawnTask);
            spawnTask.count--;
        }
        if (spawnTask.count <= 0) {
            // console.log("[⬜]队列长度"+spawnMobStack.length)
            let removed = spawnMobStack.shift()
            // console.log("已移除")
            // console.log(removed)
            // console.log("[⬜]移除后队列长度"+spawnMobStack.length)
        }
    }
    // console.log("给金币")
    if (goldPile > 0) {
        level.playSound(null, player.x, player.y, player.z, 'entity.experience_orb.pickup', 'ambient', 0.5, 0.75+0.1*Math.random())
        player.give('thermal:gold_coin')
        goldPile--;
    }

    
})

function genName() {
    const adjectives = ['冷酷', '迅捷', '快乐', '悠闲', '懒惰', '狡猾', '聪明', '史诗'];
    const animals = ['猫猫', '狗狗', '熊猫', '狐狸', '考拉', '老虎', '灰狼', '棕熊'];
    const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adj}${animal}${number}`;
}
const pinyinMap = {'冷酷': 'lengku','迅捷': 'xunjie','快乐': 'kuaile','悠闲': 'youxian','懒惰': 'landuo','狡猾': 'jiaohua','聪明': 'congming','史诗': 'shishi','猫猫': 'maomao','狗狗': 'gougou','熊猫': 'xiongmao','狐狸': 'huli','考拉': 'kaola','老虎': 'laohu','灰狼': 'huilang','棕熊': 'zongxiong'};

function nameToId(name) {
    // 拆分，例如 冷酷猫猫1234
    const full = name.slice(0, 4);
    const number = name.slice(5);
    // 从pinyinMap中找匹配
    let pinyinName = '';
    for (const key in pinyinMap) {
        if (full.includes(key)) {
            pinyinName += pinyinMap[key];
        }
    }
    // 加上数字
    return (pinyinName + number).toLowerCase();
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