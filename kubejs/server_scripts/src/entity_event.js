
EntityEvents.hurt( event => {
    const damage = event.damage
    const server = event.server

    /* 受伤实体是玩家 */
    if (event.entity.isPlayer()) {
        const player = event.entity
        const level = event.getLevel()
        let favors = player.persistentData.getInt("favors")
        let followers = player.persistentData.getInt("followers")

        return
    }

    /* 否则便是普通实体 */
    const entity = event.entity
    let sender = entity.persistentData.getString("username")
    // console.log("hurt event, sender: "+sender)
    if (sender !== "") {
        let bossBar = server.getCustomBossEvents().get(sender)
        if (bossBar == null) return // 如果 bossBar 是 null 则直接结束
        let value = bossBar.getValue()
        // console.log("boss条："+value+"  伤害："+damage)
        if (value > damage) {
            bossBar.setValue(Math.ceil(value - damage))
        } else {
            bossBar.setValue(0)
        }
        // console.log("boss条现在值为"+value)
        if (bossBar.getValue() == 0) server.runCommandSilent(`/bossbar remove minecraft:${sender}`)
    }
})

EntityEvents.death( event => {
    const entity = event.entity
    const server = event.server
    const level = event.level
    let sender = entity.persistentData.getString("username")
    let selfUUID = entity.getStringUuid()
    // console.log("death event, sender === \"\"? ")
    // console.log(sender === "")
    if (sender !== "") {
        let bossBar = server.getCustomBossEvents().get(sender)
        if (bossBar == null) return // 如果 bossBar 是 null 则直接结束
        let barActive = level.getEntities().toArray().some( entity => {
            let senderMatch = entity.persistentData.getString("username") == sender
            let uuidDiffer = selfUUID != entity.getStringUuid() // 避免把实体自己算作存在
            return senderMatch && uuidDiffer
        })
        // console.log("boss条应保留吗？："+barActive)
        if (!barActive) server.runCommandSilent(`/bossbar remove minecraft:${sender}`)
    }
    // server.getCustomBossEvents().getIds().toArray().forEach( id => {
    //     let command = `/bossbar remove ${id}`
    //     console.log(command)
    //     server.runCommandSilent(command)
    // })
})