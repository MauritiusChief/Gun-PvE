
EntityEvents.hurt( event => {
    const damage = event.damage
    const server = event.server

    /* 受伤实体是玩家 */
    if (event.entity.isPlayer()) {
        const player = event.entity
        let watching = player.persistentData.getInt("watching")
        if (Math.random() < damage / (damage+5)) watching++
        player.persistentData.putInt("watching", watching)
        return
    }

    /* 否则便是普通实体 */

    // 观看数相关内容
    if (event.source.actual.isPlayer()) {
        const player = event.source.actual
        let watching = player.persistentData.getInt("watching")
        if (Math.random() < damage / (damage+5)) watching++
        player.persistentData.putInt("watching", watching)
        // 不 return，继续执行boss条相关内容
    }
    // boss条相关内容
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

    /* 死亡实体是玩家 */
    if (entity.isPlayer()) {
        const player = entity
        let watching = player.persistentData.getInt("watching")
        if (watching > 10) watching -= Math.floor(10 * Math.random()) // 死亡导致掉粉
        player.persistentData.putInt("watching", watching)
        return
    }

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