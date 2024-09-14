


ItemEvents.entityInteracted('minecraft:stick', event => {
    // event.target.persistentData.putBoolean("enemy", true);
    // let nbt = event.target.getNbt()
    // nbt.Tags = ["Enemy"];
    // event.target.mergeNbt(nbt);
    // event.target.mergeNbt({"Tags":["AnotherTag"]});
    // event.player.tell('测试persistentData');
    event.target.moveTo(new Vec3(0, 0, 0))
})

ItemEvents.rightClicked('minecraft:stick', event => {
    // let suck_strength = 0.5
    // let blast_strength = 1.0
    // event.level.getNearbyEntities(LivingEntity, TargetingConditions.forCombat(), event.player, AABB.ofSize(event.player.position(), 30, 10, 30)).forEach(entity => {
    //     entity.addMotion((event.player.x - entity.x) * suck_strength, (event.player.y - (entity.y + 1)) * suck_strength, (event.player.z - entity.z) * suck_strength)
    //     event.server.scheduleInTicks(10, later => {
    //         entity.addMotion((event.player.x - entity.x) * -blast_strength, (event.player.y - (entity.y + 1)) * -blast_strength, (event.player.z - entity.z) * -blast_strength)
    //     })
    // })
})

ItemEvents.entityInteracted('minecraft:diamond', event => {
    // event.target.navigation.moveTo(0, -60, 0, 1.5)
    event.target.absMoveTo(0, 0, 0)
    // console.log(event.target)
    // event.server.tell(event.player)
})

ItemEvents.foodEaten('minecraft:cooked_beef', event => {
    let player = event.player;
    let cookedBeefCount = player.inventory.count('minecraft:cooked_beef');
    let beefAmount = 32;
    if (cookedBeefCount < beefAmount) {
        player.give('minecraft:cooked_beef');
    }
})