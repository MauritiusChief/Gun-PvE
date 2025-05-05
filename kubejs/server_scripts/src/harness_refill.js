
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

    // console.log(playerNbt)

    player.mergeNbt(playerNbt)

    // const equipments = [
	// 	Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:light_extended_mag_2"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:muzzle_silencer_mirage"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:sight_sro_dot",ZoomNumber:1}},GunCurrentAmmoCount:25,GunFireMode:"SEMI",GunId:"tacz:glock_17",HasBulletInBarrel:1b}'), 
	// 	Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:light_extended_mag_2"}},AttachmentGRIP:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:grip_magpul_afg_2"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:muzzle_silencer_mirage"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:sight_coyote",ZoomNumber:7}},AttachmentSTOCK:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:stock_carbon_bone_c5"}},GunCurrentAmmoCount:49,GunFireMode:"AUTO",GunId:"tacz:hk_mp5a5",HasBulletInBarrel:1b}'), 
	// 	Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:bayonet_6h3"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"lradd:sight_romeo1"}},AttachmentSTOCK:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:stock_carbon_bone_c5"}},GunCurrentAmmoCount:40,GunFireMode:"AUTO",GunId:"tacz:ak47",HasBulletInBarrel:1b}'), 
	// 	Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentGRIP:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:grip_magpul_afg_2"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:bayonet_m9"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:sight_coyote",ZoomNumber:7}},AttachmentSTOCK:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:stock_carbon_bone_c5"}},GunCurrentAmmoCount:60,GunFireMode:"AUTO",GunId:"tacz:m4a1",HasBulletInBarrel:1b}'), 
	// 	Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentGRIP:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:grip_magpul_afg_2"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:sight_coyote"}},GunCurrentAmmoCount:32,GunFireMode:"SEMI",GunId:"tacz:aa12",HasBulletInBarrel:1b}'), 
	// 	Item.of('tacz:modern_kinetic_gun', '{AttachmentGRIP:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:grip_magpul_afg_2"}},AttachmentSTOCK:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:stock_carbon_bone_c5"}},GunCurrentAmmoCount:6,GunFireMode:"SEMI",GunId:"classicr:mgl_40mm",HasBulletInBarrel:1b}'), 
	// 	Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:muzzle_brake_trex"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:sight_coyote"}},GunCurrentAmmoCount:200,GunFireMode:"AUTO",GunId:"classicr:m60",HasBulletInBarrel:1b}'), 
	// 	Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentGRIP:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"emxarms:grip_emx_nested"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"emxarms:muzzle_emx_encapsulation"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"emxarms:sight_emx_demo2"}},AttachmentSTOCK:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"emxarms:bayonet_emx_lightupgrade"}},GunCurrentAmmoCount:80,GunFireMode:"AUTO",GunId:"emxarms:emx_mg90",HasBulletInBarrel:1b}'), '64x kubejs:mre', Item.of('military_armor_mod:bluemilitaryarmor_helmet', '{Damage:0,Unbreakable:1b}'), 
	// 	Item.of('military_armor_mod:bluemilitaryarmor_chestplate', '{Damage:0,Unbreakable:1b}'), Item.of('military_armor_mod:bluemilitaryarmor_leggings', '{Damage:0,Unbreakable:1b}'), 
	// 	Item.of('military_armor_mod:bluemilitaryarmor_boots', '{Damage:0,Unbreakable:1b}'), Item.of('tacz:ammo_box', '{AllTypeCreative:1b,AmmoCount:2147483587}')
	// ]
    // equipments.forEach( item => {
    //     player.give(item)
    // })
})