
const LivingEntity = Java.loadClass('net.minecraft.world.entity.LivingEntity')
const TargetingConditions = Java.loadClass('net.minecraft.world.entity.ai.targeting.TargetingConditions')

EntityEvents.spawned(event => {
    let entity = event.entity;
    // entity.getLevel().getNearbyEntities()
    // entity.getLevel().getNearestEntity()
    // entity.getLevel().getNearestPlayer()
    // entity.distanceToEntity()

})


LevelEvents.tick(event => {
    const track_dist_max = 32; // 16是因为设定的最大检测距离就是16

    event.level.getEntities().forEach( entity => {
        // 注意：由于未知原因，TargetingCondition必须是forCombat或forNotCombat，故阵营也必须按此划分
        if (entity.persistentData.getInt("side") == 1) {

            // console.info('检测到黄方实体：'+entity.type)
            var distance = Infinity; 
            var nearest_target; // 将找到的最近的白方实体
            entity.getLevel().getNearbyEntities(
                LivingEntity, 
                TargetingConditions.forNonCombat(), 
                entity, 
                AABB.ofSize(entity.position(), track_dist_max, 10, track_dist_max)
            ).forEach( nearby_entity => {
                var nearby_dist = entity.distanceToEntity(nearby_entity);
                if (nearby_dist < distance && nearby_entity.persistentData.getInt("side") == 2) {
                    // console.info('附近白方实体：'+nearby_entity.type)
                    // 寻找最近的白方实体
                    distance = nearby_dist;
                    nearest_target = nearby_entity;
                }
            })
            

            if (nearest_target != undefined) {
                // console.info('最近的白方实体：'+nearest_target.type)
                distance = entity.distanceToEntity(nearest_target);
            }
            if (distance < track_dist_max && nearest_target.persistentData.getInt("side") == 2) {
                entity.persistentData.putBoolean("target_spotted", true)
                entity.setTarget(nearest_target);
                // console.info('已触发设置目标')
            } else {
                entity.persistentData.putBoolean("target_spotted", false)
                entity.setTarget(null);
                // console.info('已触发清除目标')
            }

        }   
    })
})