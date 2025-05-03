
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
	player.persistentData.putInt("watching", 0)
	player.persistentData.putBoolean("spawn_highway", false)
	player.persistentData.putBoolean("spawn_mobs", false)
	player.persistentData.putBoolean("stream_envo", false)
	let coinCount = player.getInventory().countItem('thermal:gold_coin')
	player.setStatusMessage(`检测到金币 ${coinCount} 个`);
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