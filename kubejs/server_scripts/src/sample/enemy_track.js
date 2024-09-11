// priority: 0

// Visit the wiki for more info - https://kubejs.com/

console.info('Hello, World! (Loaded server scripts)')

const $Vec3 = Java.loadClass(`net.minecraft.world.phys.Vec3`)

const MONSTER_LIST = [
    'minecraft:skeleton', 'minecraft:stray', 'minecraft:wither_skeleton', 
    'minecraft:zombie', 'minecraft:husk', 'minecraft:drowned', 'minecraft:zombie_villager',
    'minecraft:spider', 'minecraft:cave_spider',
    'minecraft:creeper', 'minecraft:silverfish', 
    'minecraft:vindicator', 'minecraft:pillager', 'minecraft:ravager', 'minecraft:witch',
    'minecraft:evoker', 'minecraft:illusioner',
    'minecraft:slime', 'minecraft:magma_cube',
    'minecraft:warden'
];
const NO_TRACE_MODES = ["SPECTATOR", "CREATIVE"];

let trackDistMax = 50;
let playgroundRange = 50;
let centerX = 0;
let centerZ = 0;
let trackHight = -55; // 这个高度之后怪物就不追踪了

LevelEvents.tick(event => {
    // event.level.getEntities().forEach( entity => {
        // if (entity.persistentData.getBoolean("enemy") && MONSTER_LIST.includes(entity.type)) {
        // if (entity.persistentData.getBoolean("enemy")) {
        //     // console.info('检测到实体：'+entity.type)
        //     var distance = Infinity;
        //     var nearestPlayer;
        //     // console.info('LevelEvents实体数据：'+entity)
            
        //     nearestPlayer = entity.getLevel().getNearestPlayer(entity, trackDistMax);
        //     var distToCenterPlayer = Infinity;
        //     if (nearestPlayer != null) {
        //         distance = entity.distanceToEntity(nearestPlayer);
        //         // var currentTarget = entity.getTarget();
        //         // console.info('当前目标：'+currentTarget)
        //         // console.info('最近玩家：'+nearestPlayer)
        //         distToCenterPlayer = nearestPlayer.position().distanceTo(new $Vec3(centerX, nearestPlayer.y, centerZ)); // 获取与(0,0)中心线的距离
        //     }
        //     var distToCenterEntity = entity.position().distanceTo(new $Vec3(centerX, entity.y, centerZ));

        //     if (distance < trackDistMax && distToCenterEntity < playgroundRange && 
        //         nearestPlayer.y < trackHight && distToCenterPlayer < playgroundRange && nearestPlayer.persistentData.getBoolean("huntgame")) {
        //         entity.setTarget(nearestPlayer);
        //         // console.info('已触发设置目标')
        //     } else {
        //         entity.setTarget(null);
        //         // console.info('已触发清除目标')
        //     }

        // }   
    // })
})

// 随机冲刺
LevelEvents.tick(event => {
    // event.level.getEntities().forEach( entity => {
    //     // if (entity.persistentData.getBoolean("enemy") && MONSTER_LIST.includes(entity.type)) {
    //     if (entity.persistentData.getBoolean("enemy") && Math.random() < 0.05) {
    //         entity.potionEffects.add('minecraft:speed', 2, 7, false, false)
    //     }
    //     if (entity.persistentData.getBoolean("enemy") && Math.random() < 0.05) {
    //         entity.potionEffects.add('minecraft:slowness', 4, 4, false, false)
    //     }
    // })
})

// EntityEvents.spawned(event => {
//     event.entity.potionEffects.add('minecraft:regeneration', 20 * 24, 2)
// })
