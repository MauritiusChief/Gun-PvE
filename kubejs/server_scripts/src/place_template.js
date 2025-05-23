
// 仅用于快速标记区块用
PlayerEvents.tick(event => {
    const player = event.player
    const server = event.server
    const level = event.level
    const easyMark = player.persistentData.getBoolean("easyMark")
    const cleanDoor = player.persistentData.getBoolean("cleanDoor")
    const pos = {x: player.getBlockX(), y: player.getBlockY(), z: player.getBlockZ()}
    if (easyMark) {
        let targetChunk = [
            global.kubejs.UtilsJS.parseInt(Math.floor(pos.x/16), 0), 
            global.kubejs.UtilsJS.parseInt(Math.floor(pos.z/16), 0)
        ]
        server.persistentData.putIntArray(`marked_${targetChunk[0]}_${targetChunk[1]}`,targetChunk)
    }
    const block = level.getBlock(pos.x, pos.y, pos.z)
    // console.log(block.id)
    if (cleanDoor && block.id.includes("minecraft:oak_door")) {
        // console.log("触发清除门")
        block.set("air")
    }
    // 生成粒子效果
    let allKeys = server.persistentData.getAllKeys()
    allKeys.forEach( key => {
        if (key.startsWith("marked_")) {
            let array = server.persistentData.getIntArray(key)
            server.runCommandSilent(`/particle minecraft:dust 0.5 0.1 0.2 1 ${array[0]*16+7} ${player.getY()+1.5} ${array[1]*16+7} 0.1 0.1 0.1 1 1`)
        }
        if (
            key.startsWith("grouped_") && 
            key.endsWith(`${parseInt(Math.floor(pos.x/16), 0)}_${parseInt(Math.floor(pos.z/16), 0)}`)
        ) { // 高亮所处的组
            let array = server.persistentData.getIntArray(key)
            for (let i=0; i<array.length; i+=2) {
                server.runCommandSilent(`/particle minecraft:dust 0.1 0.8 0.2 1 ${array[i]*16+7} ${player.getY()+2.0} ${array[i+1]*16+7} 0.1 0.1 0.1 1 1`)
            }

        }
    })
})

const templatePlaceY = -60
const doorPlaceY = -60

BlockEvents.rightClicked("minecraft:oak_door", event => {
    // if (!event.block.id == "minecraft:oak_door") return
    // event.server.tell("橡木门改变被触发")
    // console.log(event.block.getPos())
    getTargetChunk(event)
})

BlockEvents.broken("minecraft:oak_door", event => {
    getTargetChunk(event)
})

function getTargetChunk(event) {
    const doorPos = event.block.getPos()
    const server = event.server
    let placeCheck = [doorPos.x, doorPos.z]
    while (placeCheck[0]<0) {
        placeCheck[0]+=16
    }
    while (placeCheck[1]<0) {
        placeCheck[1]+=16
    }

    // 1. 获取所有已标记的区块
    let occupiedChunks = new Set()
    let allKeys = server.persistentData.getAllKeys()
    allKeys.forEach( key => {
        if (key.startsWith("marked_")) {
            occupiedChunks.add(key)
        }
    })
    if (placeCheck[0]%16 == 7 && placeCheck[1]%16 == 15) {
        // server.tell(`南北方向（沿Z轴）橡木门坐标${doorPos.x}, ${doorPos.z}`)
        var candidate1 = `marked_${Math.floor(doorPos.x/16)}_${Math.floor(doorPos.z/16)}`
        var candidate2 = `marked_${Math.floor(doorPos.x/16)}_${Math.ceil(doorPos.z/16)}`
        if (occupiedChunks.has(candidate1) && occupiedChunks.has(candidate2)) {
            server.tell("两边都被占据")
        } else if (!occupiedChunks.has(candidate1)) {
            server.tell(`区块候选1（Z较小者）可用 [${candidate1}]`)
            placeTemplate(event, candidate1, occupiedChunks)
        } else {
            server.tell(`区块候选2（Z较大者）可用 [${candidate2}]`)
            placeTemplate(event, candidate2, occupiedChunks)
        }
        return
    }
    if (placeCheck[0]%16 == 15 && placeCheck[1]%16 == 7) {
        // server.tell(`东西方向（沿X轴）橡木门坐标${doorPos.x}, ${doorPos.z}`)
        var candidate1 = `marked_${Math.floor(doorPos.x/16)}_${Math.floor(doorPos.z/16)}`
        var candidate2 = `marked_${Math.ceil(doorPos.x/16)}_${Math.floor(doorPos.z/16)}`
        if (occupiedChunks.has(candidate1) && occupiedChunks.has(candidate2)) {
            server.tell("两边都被占据")
        } else if (!occupiedChunks.has(candidate1)) {
            server.tell(`区块候选1（X较小者）可用 [${candidate1}]`)
            placeTemplate(event, candidate1, occupiedChunks)
        } else {
            server.tell(`区块候选2（X较大者）可用 [${candidate2}]`)
            placeTemplate(event, candidate2, occupiedChunks)
        }
        return
    }
}

function placeTemplate(event, candidateKey, occupiedChunks) {
    const server = event.server
    const coordinate = candidateKey.split("_").slice(1)

    const sizes = [
        [1, 1],
        [1, 2], [2, 1],
        // [2, 2],
        // [2, 3], [3, 2]
    ]
    sizes.sort(() => Math.random() - 0.5) // 打乱尺寸顺序以增加多样性
    const corners = [[1,1],[1,-1],[-1,1],[-1,-1]] // 四个角方向
    corners.sort(() => Math.random() - 0.5)

    for (const [dx, dz] of sizes) {
        console.log(`选中的大小：${dx}, ${dz}`)
        let chunksToOccupy = []
        let canPlace = true

        for (const [facingX, facingZ] of corners) {
            console.log(`  选中的角方向：${facingX}, ${facingZ}`)
            canPlace = true
            for (let ox = 0; ox < dx; ox++) {
                for (let oz = 0; oz < dz; oz++) {
                    let cx = parseInt(facingX * ox) + parseInt(coordinate[0])
                    let cz = parseInt(facingZ * oz) + parseInt(coordinate[1])
                    if (occupiedChunks.has(`marked_${cx}_${cz}`)) {
                        canPlace = false
                        chunksToOccupy = []
                        break
                    }
                    console.log(`    将 [${parseInt(cx, 0)}, ${parseInt(cz, 0)}] 临时加入chunksToOccupy`)
                    chunksToOccupy.push([cx, cz])
                }
                if (!canPlace) break // 任一一个chunk不可放置就检测不通过
            }
            if (canPlace) break // 任一一个角可放置就检测通过
        }
        console.log(`可以放置吗？${canPlace.toString()}`)

        // 找到了合适的尺寸
        if (canPlace) {
            for (const [cx, cz] of chunksToOccupy) {
                server.tell(`  将占用 [${parseInt(cx, 0)}, ${parseInt(cz, 0)}]`)
                let placedChunk = [
                    global.kubejs.UtilsJS.parseInt(cx, 0), 
                    global.kubejs.UtilsJS.parseInt(cz, 0)
                ]
                server.persistentData.putIntArray(`marked_${cx}_${cz}`, placedChunk)

                let groupChunks = []
                for (const [bx, bz] of chunksToOccupy) {
                    console.log(`  [${parseInt(cx, 0)}, ${parseInt(cz, 0)}] 拥有同组区块：[${parseInt(bx, 0)}, ${parseInt(bz, 0)}]`)
                    groupChunks.push(global.kubejs.UtilsJS.parseInt(bx, 0))
                    groupChunks.push(global.kubejs.UtilsJS.parseInt(bz, 0)) // 读取时应保证也是两个一组地读取
                }
                server.persistentData.putIntArray(`grouped_${cx}_${cz}`, groupChunks)
            }

            // chunksToOccupy = [[3, 5], [2, 6], [2, 4], [5, 4], [2, 4]];
            let minX = Math.min.apply(null, chunksToOccupy.map(c => c[0]))
            let minZ = Math.min.apply(null, chunksToOccupy.map(c => c[1]))
            let chunkToPlace = chunksToOccupy.find(c => c[0]==minX && c[1]==minZ)
            console.log(`应当放置的区块 [${chunkToPlace[0]}, ${chunkToPlace[1]}]`)

            randDirePlace(server, dx, dz, chunkToPlace)
            // server.runCommandSilent(`/place template gunrog:testroom ${chunkToPlace[0]*16} ${templatePlaceY} ${chunkToPlace[1]*16}`)

            // 放置门
            for (let i = 0; i < dx; i++) {
                server.runCommandSilent(`/setblock ${7 + (chunkToPlace[0]+i)*16} ${doorPlaceY+1} ${chunkToPlace[1]*16 - 1} minecraft:oak_door[half=upper]`)
                server.runCommandSilent(`/setblock ${7 + (chunkToPlace[0]+i)*16} ${doorPlaceY} ${chunkToPlace[1]*16 - 1} minecraft:oak_door[half=lower]`)
                server.runCommandSilent(`/setblock ${7 + (chunkToPlace[0]+i)*16} ${doorPlaceY+1} ${(chunkToPlace[1]+dz)*16 - 1} minecraft:oak_door[half=upper]`)
                server.runCommandSilent(`/setblock ${7 + (chunkToPlace[0]+i)*16} ${doorPlaceY} ${(chunkToPlace[1]+dz)*16 - 1} minecraft:oak_door[half=lower]`)
            }
            for (let i = 0; i < dz; i++) {
                server.runCommandSilent(`/setblock ${chunkToPlace[0]*16 - 1} ${doorPlaceY+1} ${7 + (chunkToPlace[1]+i)*16} minecraft:oak_door[half=upper,facing=east]`)
                server.runCommandSilent(`/setblock ${chunkToPlace[0]*16 - 1} ${doorPlaceY} ${7 + (chunkToPlace[1]+i)*16} minecraft:oak_door[half=lower,facing=east]`)
                server.runCommandSilent(`/setblock ${(chunkToPlace[0]+dx)*16 - 1} ${doorPlaceY+1} ${7 + (chunkToPlace[1]+i)*16} minecraft:oak_door[half=upper,facing=east]`)
                server.runCommandSilent(`/setblock ${(chunkToPlace[0]+dx)*16 - 1} ${doorPlaceY} ${7 + (chunkToPlace[1]+i)*16} minecraft:oak_door[half=lower,facing=east]`)
            }

            break
        }
    }    
}

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

const template1x2 = [
    {value: "gunrog:test1x2", weight: 1},
]
const template1x1 = [
    {value: "gunrog:test1x1", weight: 1},
    {value: "gunrog:testroom", weight: 1},
]

function randDirePlace(server, dx, dz, chunkToPlace) {
    console.log(`基准点 [${chunkToPlace[0]*16}, ${chunkToPlace[1]*16}]`)
    const rotation = {
        r0: {r:"none none", x:chunkToPlace[0]*16, z:chunkToPlace[1]*16},
        r1: {r:"counterclockwise_90 none", x:chunkToPlace[0]*16, z:(chunkToPlace[1]+dz)*16-2},
        r2: {r:"180 none", x:(chunkToPlace[0]+dx)*16-2, z:(chunkToPlace[1]+dz)*16-2},
        r3: {r:"clockwise_90 none", x:(chunkToPlace[0]+dx)*16-2, z:chunkToPlace[1]*16}
    }
    const randomSquare = [
        {value: rotation.r0, weight: 1},
        {value: rotation.r1, weight: 1},
        {value: rotation.r2, weight: 1},
        {value: rotation.r3, weight: 1},
    ]
    const randomShortByLong = [
        {value: rotation.r0, weight: 1},
        {value: rotation.r2, weight: 1},
    ]
    const randomLongByShort = [ // 默认只存储“短x长”（比如1x2)类型的template，要横着放那就再旋转
        {value: rotation.r1, weight: 1},
        {value: rotation.r3, weight: 1},
    ]

    let template = ""
    if (dx == 1 && dz == 1) {
        template = wrad(template1x1)
    } else if ((dx == 2 && dz == 1) || (dx == 1 && dz == 2)) {
        template = wrad(template1x2)
    }

    let value = {}
    if (dx == dz) {
        console.log("触发方形放置")
        value = wrad(randomSquare)
    } else if (dx < dz) {
        console.log("触发短x长形放置")
        value = wrad(randomShortByLong)
    } else {
        console.log("触发长x短形放置")
        value = wrad(randomLongByShort)
    }
    console.log(`放置类型 "${value.r}", 位置 [${value.x}, ${value.z}]`)

    const command = `/place template ${template} ${value.x} ${templatePlaceY} ${value.z} ${value.r}`
    console.log(command)
    server.runCommandSilent(command)
}

