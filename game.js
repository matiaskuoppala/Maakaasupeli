(function (Phaser) {

    var game = new Phaser.Game(
        800, 416,
        Phaser.CANVAS,
        "phaser",

        {
            preload: preload,
            create: create,
            update: update
        }
    );

    var map;
    var layer;

    function preload() {
        //Load player spritesheet
        game.load.spritesheet("player", "player.png", 32, 32);
        game.load.spritesheet("pipe", "pipe.png", 32, 32);
        game.load.spritesheet("tiles", "tileset.png", 32, 32);
        game.load.spritesheet("door", "door.png", 32, 32);

        game.load.spritesheet("mutebuttonImage", "mutebutton_sprite.png", 30, 30);

        //Load level 0
        game.load.tilemap("map", "level0.csv");
        //Load tileset
        game.load.image("tileset", "tileset.png");

        //Load sounds
        game.load.audio("pipesound", "pipeSound.mp3");
        game.load.audio("gamemusic", "Laser Groove.mp3");

    }

    var doorOpen;
    var door;
    var pipeCollected;
    var pipe;
    var player;
    var dir = "right";
    var hMove = 110;
    var vMove = -300;
    var jumpTimer = 0;
    var pipesound;
    var gamemusic;
    var mutebutton;

    function create() {
        //Game background
        game.stage.backgroundColor = "#D3D3D3";

        //Physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //Add player sprite
        player = game.add.sprite(64, 300, "player");

        game.camera.follow(player);


        //Add pipe sprite and animation
        this.pipe = game.add.sprite(120, 300, "pipe");
        this.pipe.animations.add('spin', [0, 1, 2, 3, 4, 5], 12, true);
        this.pipe.animations.play("spin");

        //  Add door sprite and animation
        this.door = game.add.sprite(768, 352, "door");
        game.physics.enable(this.door);
        this.door.body.immovable = true;

        //Enable physics
        game.physics.enable(player);
        game.physics.enable(this.pipe);


        //Set player to collide with world bounds
        player.body.collideWorldBounds = true;

        //Set gravity for player
        player.body.gravity.y = 600;

        //  Because we're loading CSV map data we have to specify the tile size here or we can't render it
        map = game.add.tilemap('map', 32, 32);

        //  Now add in the tileset
        map.addTilesetImage('tileset');

        //  Create our layer
        layer = map.createLayer(0);

        //  Resize the world
        layer.resizeWorld();

        //Select tiles to collide with, from index 0 to index 3 in tileset
        map.setCollisionBetween(0, 7);
        map.setCollision(9);

        // Door collision
        map.setTileIndexCallback(9, hitDoor, this);

        player.anchor.setTo(0.5, 1);

        // Game sounds
        pipesound = game.add.audio("pipesound");
        gamemusic = game.add.audio("gamemusic");

        gamemusic.play();
        //sounds take time to decode, this notifies when they are ready to use
        //game.sound.setDecodedCallback([ pipesound ], start, this);

        mutebutton = game.add.button(2,2, "mutebuttonImage", mute, this)
        mutebutton.onInputOver.add(over, this);

    }

    function update() {
        //  Set player to collide with tiles
        game.physics.arcade.collide(player, layer);

        //  Reset player velocity
        player.body.velocity.x = 0;

        //  Move player left or right
        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            player.body.velocity.x = -hMove;
            if (dir !== "left") {
                dir = "left";
            }
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            player.body.velocity.x = hMove;
            if (dir !== "right") {
                dir = "right";
            }
        }

        //  Jump
        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && player.body.onFloor() && game.time.now > jumpTimer) {
            player.body.velocity.y = vMove;
            jumpTimer = game.time.now + 650;
        }

        //  Select frame to display
        if (dir == "left") {
            player.frame = 1;
        } else if (dir == "right") {
            player.frame = 0;
        }

        //  Collisions
        game.physics.arcade.collide(this.pipe, player, collectPipe, null, this);

        //  Check for open door
        if (this.doorOpen) {
            game.physics.arcade.collide(this.door, player)
        }
        }

    function collectPipe(item, item2) {
        this.pipeCollected = true;
        this.doorOpen = true;
        pipesound.play();
        item.destroy();
    }

    function hitDoor(obj1, obj2) {
        if (doorOpen) {
        obj1.frame = 1;
        obj1.body.impassable = false;
        }
    }

    function mute() {
      switch (game.sound.mute) {
        case true:
          game.sound.mute = false;
          mutebutton.frame = 0;
          break;
        case false:
          game.sound.mute = true;
          mutebutton.frame = 1;
          break;
      }
    }


}(Phaser));
