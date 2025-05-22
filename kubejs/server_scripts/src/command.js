
ServerEvents.commandRegistry(event => {
	const { commands: Commands, arguments: Arguments } = event

	event.register(Commands.literal('reset')
		.executes(c => reset(c.source.player))
		.then(Commands.argument('target', Arguments.PLAYER.create(event))
			.executes(c => reset(Arguments.PLAYER.getResult(c, 'target')))
		)
	)

    event.register(Commands.literal('offline')
        .executes(c => offline(c.source.player))
		.then(Commands.argument('target', Arguments.PLAYER.create(event))
			.executes(c => offline(Arguments.PLAYER.getResult(c, 'target')))
		)
    )

	event.register(Commands.literal('online')
        .executes(c => online(c.source.player))
		.then(Commands.argument('target', Arguments.PLAYER.create(event))
			.executes(c => online(Arguments.PLAYER.getResult(c, 'target')))
		)
    )

	event.register(Commands.literal('equip')
        .executes(c => equip(c.source.player))
		.then(Commands.argument('target', Arguments.PLAYER.create(event))
			.executes(c => equip(Arguments.PLAYER.getResult(c, 'target')))
		)
    )
})

let reset = (player) => {
	let server = player.getLevel().getServer()
	server.runCommandSilent(`/clear ${player.getName().getString()} thermal:gold_coin`)
	player.persistentData.putInt("watching", 0)
	player.persistentData.putInt("followers", 0)
	player.persistentData.remove("z_reached")
	player.setStatusMessage("[DEBUG]已快速重置");
	return 1;
}

let offline = (player) => {
	let server = player.getLevel().getServer()
	player.persistentData.putInt("watching", 0)
	player.persistentData.putBoolean("spawn_highway", false)
	player.persistentData.putBoolean("spawn_mobs", false)
	player.persistentData.putBoolean("stream_envo", false)
	// let goldCoinCount = player.getInventory().countItem('thermal:gold_coin')
	// let netheriteCoinCount = player.getInventory().countItem('thermal:netherite_coin')
	// player.setStatusMessage(`检测到金币 ${goldCoinCount + netheriteCoinCount*(64*9)} 个`);
	// server.runCommandSilent(`/clear ${player.getName().getString()} thermal:gold_coin`)
	// server.runCommandSilent(`/clear ${player.getName().getString()} thermal:netherite_coin`)
	return 1;
}

let online = (player) => {
	let followers = player.persistentData.getInt("followers")
	player.persistentData.putInt("watching", Math.ceil(followers*0.05))
	player.persistentData.putBoolean("spawn_highway", true)
	player.persistentData.putBoolean("spawn_mobs", true)
	player.persistentData.putBoolean("stream_envo", true)
	return 1;
}

let equip = (player) => {
	const equipments = [
		Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:light_extended_mag_2"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:muzzle_silencer_mirage"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:sight_sro_dot",ZoomNumber:1}},GunCurrentAmmoCount:25,GunFireMode:"SEMI",GunId:"tacz:glock_17",HasBulletInBarrel:1b}'), 
		Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:light_extended_mag_2"}},AttachmentGRIP:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:grip_magpul_afg_2"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:muzzle_silencer_mirage"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:sight_coyote",ZoomNumber:7}},AttachmentSTOCK:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:stock_carbon_bone_c5"}},GunCurrentAmmoCount:49,GunFireMode:"AUTO",GunId:"tacz:hk_mp5a5",HasBulletInBarrel:1b}'), 
		Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:bayonet_6h3"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"lradd:sight_romeo1"}},AttachmentSTOCK:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:stock_carbon_bone_c5"}},GunCurrentAmmoCount:40,GunFireMode:"AUTO",GunId:"tacz:ak47",HasBulletInBarrel:1b}'), 
		Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentGRIP:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:grip_magpul_afg_2"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:bayonet_m9"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:sight_coyote",ZoomNumber:7}},AttachmentSTOCK:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:stock_carbon_bone_c5"}},GunCurrentAmmoCount:60,GunFireMode:"AUTO",GunId:"tacz:m4a1",HasBulletInBarrel:1b}'), 
		Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentGRIP:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:grip_magpul_afg_2"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:sight_coyote"}},GunCurrentAmmoCount:32,GunFireMode:"SEMI",GunId:"tacz:aa12",HasBulletInBarrel:1b}'), 
		Item.of('tacz:modern_kinetic_gun', '{AttachmentGRIP:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:grip_magpul_afg_2"}},AttachmentSTOCK:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:stock_carbon_bone_c5"}},GunCurrentAmmoCount:6,GunFireMode:"SEMI",GunId:"classicr:mgl_40mm",HasBulletInBarrel:1b}'), 
		Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:muzzle_brake_trex"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:sight_coyote"}},GunCurrentAmmoCount:200,GunFireMode:"AUTO",GunId:"classicr:m60",HasBulletInBarrel:1b}'), 
		Item.of('tacz:modern_kinetic_gun', '{AttachmentEXTENDED_MAG:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentGRIP:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"emxarms:grip_emx_nested"}},AttachmentMUZZLE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"emxarms:muzzle_emx_encapsulation"}},AttachmentSCOPE:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"emxarms:sight_emx_demo2"}},AttachmentSTOCK:{Count:1b,id:"tacz:attachment",tag:{AttachmentId:"emxarms:bayonet_emx_lightupgrade"}},GunCurrentAmmoCount:80,GunFireMode:"AUTO",GunId:"emxarms:emx_mg90",HasBulletInBarrel:1b}'), 
		'64x kubejs:mre', 
		Item.of('military_armor_mod:bluemilitaryarmor_helmet', '{Damage:0,Unbreakable:1b}'), 
		Item.of('military_armor_mod:bluemilitaryarmor_chestplate', '{Damage:0,Unbreakable:1b}'), 
		Item.of('military_armor_mod:bluemilitaryarmor_leggings', '{Damage:0,Unbreakable:1b}'), 
		Item.of('military_armor_mod:bluemilitaryarmor_boots', '{Damage:0,Unbreakable:1b}'), 
		Item.of('tacz:ammo_box', '{AllTypeCreative:1b,AmmoCount:2147483587}')
	]
    equipments.forEach( item => {
        player.give(item)
    })
	return 1;
}