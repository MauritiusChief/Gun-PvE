
/**
 * 常用指令：
 * /kubejs persistent_data entity @s remove z_reached
 * /kubejs persistent_data entity @s merge {spawn_highway:true}
 * /kubejs persistent_data entity @s merge {spawn_mobs:true}
 * /kubejs persistent_data entity @s merge {spawn_mobs:false}
 */

var spawnMobTimer = {
    "creeper":  Math.ceil(20 * 5  * (0.75+0.5*Math.random())),
    "piglin":   Math.ceil(20 * 20  * (0.5+1.0*Math.random())),
    "skeleton": Math.ceil(20 * 60  * (0.5+1.0*Math.random())),
    "ravager":  Math.ceil(20 * 120 * (0.5+1.0*Math.random())),
    "pillager": Math.ceil(20 * 300 * (0.25+1.5*Math.random())),
    "wither_skeleton": Math.ceil(20 * 600 * (0.25+1.5*Math.random())),
    "zombie": Math.ceil(20 * 600 * (0.25+1.5*Math.random())),
    // "zombie": Math.ceil(20 * 10),
}
var spawnMobStack = []
var commentRash = false

PlayerEvents.tick( event => {
    const player = event.player
    const server = event.server
    const level = event.getLevel()
    let zValueReached = player.persistentData.getInt("z_reached")
    let player_z = player.getBlockZ();
    let player_x_double = player.getX();
    let spawnHighway = player.persistentData.getBoolean("spawn_highway")
    let spawnMobs = player.persistentData.getBoolean("spawn_mobs")

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

    /* 生成怪物部分 */
    var mobX = 1.5
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

    function summon_mob(id, pos, customName, customNameColor, handItemId, extrNbt, multi) {
        let mob = level.createEntity(`minecraft:${id}`)
        mob.setCustomName(Component.of({"text": customName,"color": customNameColor, "bold": true}))
        mob.setCustomNameVisible(true)
        if (handItemId) { mob.mergeNbt({HandItems:[{id:handItemId,Count:1},{}]}) }
        if (extrNbt) { mob.mergeNbt(extrNbt) }
        if (multi && multi > 1) {
            let max_health =  mob.getAttribute('generic.max_health').getBaseValue()
            mob.getAttribute('generic.max_health').setBaseValue(max_health * multi);
            mob.health = max_health * multi;
            let attack_damage =  mob.getAttribute('generic.attack_damage').getBaseValue()
            mob.getAttribute('generic.attack_damage').setBaseValue(attack_damage * multi/4);
            mob.mergeNbt({ScaleFactor: multi/5.0})
        }
        mob.setPosition(pos[0], -60, pos[1])
        // let test = player.getRotationVector()
        // mob.setRotation(test.x, test.y)
        mob.spawn();
        server.runCommandSilent(`/team join Mob ${mob.getStringUuid()}`)
    }

    function client_pack(name, sent) {
        Client.gui.setTitle("")
        Client.gui.setSubtitle(Component.of({"text": name,"color": "red", "bold": true}))
        player.setStatusMessage(Component.of([{"text":"Sent ","color":"white"},{"text":sent,"color":"yellow"}]))
        player.displayClientMessage(Component.of([{"text": name,"color": "red"},{"text":" Sent ","color":"white"},{"text":sent,"color":"yellow"}]), false)
    }
    
    if (spawnMobs) {
        // event.server.tell("计时器触发")

        if (spawnMobTimer["creeper"] == 0) { // 聊天消息
            let msg = genMsg()
            summon_mob("creeper", [mobX, player.getZ()+10.0], msg, "yellow")
            if (commentRash) {
                spawnMobTimer["creeper"] = Math.ceil(20 * 1 * (0.25+1.5*Math.random()))
            } else {
                spawnMobTimer["creeper"] = Math.ceil(20 * 10 * (0.75+0.5*Math.random()))
            }
            // 每次触发评论时，都有概率更新commentRash状态 
            if (!commentRash && Math.random() < 0.3) {
                commentRash = true
            }
            if (commentRash && Math.random() < 0.2) {
                commentRash = false
            }
        } else {
            // event.server.tell("creeper: "+spawnMobTimer["creeper"])
            spawnMobTimer["creeper"]--;
        }

        if (spawnMobTimer["piglin"] == 0) {
            let name = genName()
            client_pack(name, "2x Piglin")
            Array(2).fill("c").forEach(() => {
                summon_mob("piglin", [mobX, player.getZ()+12.0], name, "red", "crossbow", {IsImmuneToZombification: true})
            })
            spawnMobTimer["piglin"] = Math.ceil(20 * 30 * (0.5+1.0*Math.random()))
        } else {
            // event.server.tell("piglin: "+spawnMobTimer["piglin"])
            spawnMobTimer["piglin"]--;
        }

        if (spawnMobTimer["skeleton"] == 0) {
            let name = genName()
            client_pack(name, "5x Skelenton")
            Array(5).fill("c").forEach(() => {
                summon_mob("skeleton", [mobX, player.getZ()+12.0], name, "red", "bow")
            })
            spawnMobTimer["skeleton"] = Math.ceil(20 * 60 * (0.5+1.0*Math.random()))
        } else {
            // event.server.tell("skeleton: "+spawnMobTimer["skeleton"])
            spawnMobTimer["skeleton"]--;
        }

        if (spawnMobTimer["ravager"] == 0) {
            let name = genName()
            client_pack(name, "3x Ravager")
            Array(3).fill("c").forEach(() => {
                summon_mob("ravager", [mobX, player.getZ()+12.0], name, "red")
            })
            spawnMobTimer["ravager"] = Math.ceil(20 * 120 * (0.5+1.0*Math.random()))
        } else {
            // event.server.tell("ravager: "+spawnMobTimer["ravager"])
            spawnMobTimer["ravager"]--;
        }

        if (spawnMobTimer["pillager"] == 0) {
            let name = genName()
            client_pack(name, "50x Pillager")
            Array(50).fill("c").forEach(() => {
                summon_mob("pillager", [mobX, player.getZ()+16.0], name, "red", "crossbow")
            })
            spawnMobTimer["pillager"] = Math.ceil(20 * 300 * (0.25+1.5*Math.random()))
        } else {
            // event.server.tell("pillager: "+spawnMobTimer["pillager"])
            spawnMobTimer["pillager"]--;
        }

        if (spawnMobTimer["wither_skeleton"] == 0) {
            let name = genName()
            client_pack(name, "400x Wither Skelenton")
            Array(40).fill("c").forEach(() => {
                summon_mob("wither_skeleton", [mobX, player.getZ()+16.0], name, "red", "stone_sword", {}, 10)
            })
            spawnMobTimer["wither_skeleton"] = Math.ceil(20 * 600 * (0.25+1.5*Math.random()))
        } else {
            // event.server.tell("wither_skeleton: "+spawnMobTimer["wither_skeleton"])
            spawnMobTimer["wither_skeleton"]--;
        }

        if (spawnMobTimer["zombie"] == 0) {
            let name = genName()
            client_pack(name, "600x Zombie")
            Array(60).fill("c").forEach(() => {
                summon_mob("zombie", [mobX, player.getZ()+16.0], name, "red", "", {}, 10)
            })
            spawnMobTimer["zombie"] = Math.ceil(20 * 600 * (0.25+1.5*Math.random()))
        } else {
            // event.server.tell("zombie: "+spawnMobTimer["zombie"])
            spawnMobTimer["zombie"]--;
        }

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
    const messages = ['hello','how are you','can you see me?','omg','lol','uwu','abc','nice!','no way!','that’s good','good','huh','hahahahahaha','hahahahaha','hahahaha','pog','gg','cool!','so cool','that’s cool','what happened?','any one watching?','who else is watching this?','🔥🔥🔥🔥🔥','🔥🔥🔥','gooooo','let’s gooo','let’s go','bruh','same here','😂😂😂','😂😂','that was crazy','that’s crazy','this is wild','wild'];
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