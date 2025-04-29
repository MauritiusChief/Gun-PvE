// priority: 0

// Visit the wiki for more info - https://kubejs.com/

// console.info('Hello, World! (Loaded startup scripts)')

StartupEvents.registry("item", event => {
    event.create("mre").displayName("军用口粮").food(food => {
        food.hunger(8).saturation(1.5)
        .eaten(ctx => {
            const player = ctx.player
            const mreCount = player.inventory.count('kubejs:mre');
            if (mreCount < 64) {player.give('kubejs:mre')}
        })
    })
})