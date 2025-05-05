
ServerEvents.loaded( event => {
    event.server.gameRules.set("keepInventory", true);
    event.server.gameRules.set("doImmediateRespawn", true);
    event.server.gameRules.set("doMobLoot", false);
    event.server.gameRules.set("doInsomnia", false);
    event.server.gameRules.set("doMobSpawning", false);
    event.server.gameRules.set("doPatrolSpawning", false);
    event.server.gameRules.set("doTraderSpawning", false);
    event.server.gameRules.set("mobGriefing", false);
})
