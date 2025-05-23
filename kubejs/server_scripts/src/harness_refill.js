
PlayerEvents.inventoryOpened( event => {
    // /data get entity @s Inventory[-1]
    // if (event.item.id != 'tactical_aid:aggressivenessinjector') return
    // event.server.tell("事件触发")
    const player = event.player
    /* 自动填充战术背包 */
    const targetHarness = [
        {Count:1,Slot:0,id:"tactical_aid:quickactioninjector_ii"},
        {Count:1,Slot:1,id:"tactical_aid:quickactioninjector_ii"},
        {Count:1,Slot:2,id:"tactical_aid:quickactioninjector_ii"},
        {Count:1,Slot:3,id:"tactical_aid:metabolizeinjector"},
        {Count:1,Slot:4,id:"tactical_aid:metabolizeinjector"},
        {Count:1,Slot:5,id:"tactical_aid:metabolizeinjector"},
        {Count:1,Slot:6,id:"tactical_aid:glucoseinjector"},
        {Count:1,Slot:7,id:"tactical_aid:glucoseinjector"},
        {Count:1,Slot:8,id:"tactical_aid:glucoseinjector"},
        {Count:1,Slot:9,id:"tactical_aid:aggressivenessinjector"},
        {Count:1,Slot:10,id:"tactical_aid:aggressivenessinjector"},
        {Count:1,Slot:11,id:"tactical_aid:aggressivenessinjector"},
        {Count:1,Slot:12,id:"tactical_aid:painlessinjector"},
        {Count:1,Slot:13,id:"tactical_aid:painlessinjector"},
        {Count:1,Slot:14,id:"tactical_aid:painlessinjector"}
    ]
    let playerNbt = player.getNbt()
    let curios = playerNbt.ForgeCaps["curios:inventory"].Curios;

    // Find the "body" slot entry
    let bodySlot = curios.find(tag => tag.Identifier === "body");

    if (bodySlot) {
        let itemsList = bodySlot.StacksHandler.Stacks.Items;
        let harness = itemsList.find(item => item.id === "tactical_aid:harness");

        if (harness && harness.ForgeCaps?.Parent?.Items) {
            // let injectorItems = harness.ForgeCaps.Parent.Items;
            // console.log(injectorItems)
            harness.ForgeCaps.Parent.Items = targetHarness
        }
        // console.log(harness.ForgeCaps.Parent.Items)
        // console.log(itemsList)
    }

    // for (let i=0; i<9; i++) {
    //     player.inventory.insertItem(9+i, 'tactical_aid:aggressivenessinjector', false)
    // }
    // player.inventory.insertItem('tactical_aid:aggressivenessinjector', false)

    console.log(playerNbt)

    // player.mergeNbt(playerNbt)
})