
/**
 * 常用指令：
 * /kubejs persistent_data entity @s remove z_reached
 * /kubejs persistent_data entity @s merge {spawn_highway:true}
 * /kubejs persistent_data entity @s merge {spawn_mobs:true}
 */

var ticker = 0
var spawnMobTracker = {
    "creeper":  Math.ceil(5  * (0.75+0.5*Math.random())),
    "piglin":   Math.ceil(20  * (0.75+0.5*Math.random())),
    "skeleton": Math.ceil(60  * (0.75+0.5*Math.random())),
    "ravager":  Math.ceil(120 * (0.75+0.5*Math.random())),
    "pillager": Math.ceil(300 * (0.75+0.5*Math.random())),
}

PlayerEvents.tick( event => {
    const player = event.player
    const server = event.server
    const level = event.getLevel()
    let zValueReached = player.persistentData.getInt("z_reached")
    let player_z = player.getBlockZ();
    let player_x_double = player.getX();
    let spawnHighway = player.persistentData.getBoolean("spawn_highway")
    let spawnMobs = player.persistentData.getBoolean("spawn_mobs")

    ticker++;

    function decideTemplate() {
        let temp_decider = Math.random()
        if (temp_decider > 3.0/4) {
            return "barrier"
        } else if (temp_decider > 2.0/4) {
            return "burn_car"
        } else if (temp_decider > 1.0/4) {
            return "crate"
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

        server.runCommandSilent(`/place template gunpve:highway 0 -61 ${spawn_z}`)
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

    function summon_mob(id, pos, customName, customNameColor, handItemId, extrNbt) {
        // server.runCommandSilent(`/summon minecraft:${id} ${pos[0]} -60 ${pos[1]} {, HandItems:[${HandItemNBT},{}]}`)
        let mob = level.createEntity(`minecraft:${id}`)
        mob.setCustomName(Component.of({"text": customName,"color": customNameColor, "bold": true}))
        mob.setCustomNameVisible(true)
        if (handItemId) { mob.mergeNbt({HandItems:[{id:handItemId,Count:1},{}]}) }
        if (extrNbt) { mob.mergeNbt(extrNbt) }
        mob.setPosition(pos[0], -60, pos[1])
        // let test = player.getRotationVector()
        // mob.setRotation(test.x, test.y)
        mob.spawn();
        server.runCommandSilent(`/tp ${mob.getStringUuid()} ${mob.getX()} ${mob.getY()} ${mob.getZ()} 180 0`)
    }
    
    if (spawnMobs && ticker == 20) {
        ticker = 0;
        // event.server.tell("计时器触发")

        if (spawnMobTracker["creeper"] == 0) {
            summon_mob("creeper", [mobX, player.getZ()+8.0], "评论占位符", "yellow", "", {})
            spawnMobTracker["creeper"] = Math.ceil(10  * (0.75+0.5*Math.random()))
        } else {
            // event.server.tell("creeper: "+spawnMobTracker["creeper"])
            spawnMobTracker["creeper"]--;
        }

        if (spawnMobTracker["piglin"] == 0) {
            Array(2).fill("c").forEach(() => {
                summon_mob("piglin", [mobX, player.getZ()+8.0], "用户名占位符", "red", "crossbow", {IsImmuneToZombification: true})
            })
            spawnMobTracker["piglin"] = Math.ceil(30  * (0.75+0.5*Math.random()))
        } else {
            // event.server.tell("piglin: "+spawnMobTracker["piglin"])
            spawnMobTracker["piglin"]--;
        }

        if (spawnMobTracker["skeleton"] == 0) {
            Array(3).fill("c").forEach(() => {
                summon_mob("skeleton", [mobX, player.getZ()+8.0], "用户名占位符", "red", "bow", {})
            })
            Array(3).fill("c").forEach(() => {
                summon_mob("wither_skeleton", [mobX, player.getZ()+8.0], "用户名占位符", "red", "stone_sword", {})
            })
            spawnMobTracker["skeleton"] = Math.ceil(60  * (0.75+0.5*Math.random()))
        } else {
            // event.server.tell("skeleton: "+spawnMobTracker["skeleton"])
            spawnMobTracker["skeleton"]--;
        }

        if (spawnMobTracker["ravager"] == 0) {
            Array(2).fill("c").forEach(() => {
                summon_mob("ravager", [mobX, player.getZ()+8.0], "用户名占位符", "red", "", {})
            })
            spawnMobTracker["ravager"] = Math.ceil(120  * (0.75+0.5*Math.random()))
        } else {
            // event.server.tell("ravager: "+spawnMobTracker["ravager"])
            spawnMobTracker["ravager"]--;
        }

        if (spawnMobTracker["pillager"] == 0) {
            Array(30).fill("c").forEach(() => {
                summon_mob("pillager", [mobX, player.getZ()+8.0], "用户名占位符", "red", "crossbow", {})
            })
            Array(30).fill("c").forEach(() => {
                summon_mob("vindicator", [mobX, player.getZ()+8.0], "用户名占位符", "red", "iron_axe", {})
            })
            spawnMobTracker["pillager"] = Math.ceil(300  * (0.75+0.5*Math.random()))
        } else {
            // event.server.tell("pillager: "+spawnMobTracker["pillager"])
            spawnMobTracker["pillager"]--;
        }
    }
})