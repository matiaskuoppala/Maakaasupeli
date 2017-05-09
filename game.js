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
        //  Load sprites
        game.load.spritesheet("player", "assets/player.png", 32, 32);
        game.load.spritesheet("pipe", "assets/pipe.png", 32, 32);
        game.load.spritesheet("tiles", "assets/tileset.png", 32, 32);
        game.load.spritesheet("door", "assets/door.png", 32, 32);
        game.load.spritesheet("enemy", "assets/enemy.png", 32, 32);

        game.load.spritesheet("mutebuttonImage", "assets/mutebutton_sprite.png", 30, 30);

        //  Load level 0
        game.load.tilemap("map", "assets/level0.csv");

        //  Load tileset
        game.load.image("tileset", "assets/tileset.png");

        //  Load sounds
        game.load.audio("pipesound", "assets/pipeSound.mp3");
        game.load.audio("gamemusic", "assets/Laser Groove.mp3");
    }


    function gameOver() {
        player.kill();
        game.add.text(game.camera.x + 230, 143, "Game Over!", {
        font: "65px Arial",
        fill: "#000000",
        align: "center"
    });
    }

    var doorOpen;
    var door;
    var pipesCollected = 0;
    var pipes;
    var player;
    var dir = "right";
    var hMove = 400;
    var vMove = -300;
    var jumpTimer = 0;
    var pipesound;
    var gamemusic;
    var mutebutton;
    var enemies;
    var teksti;

    function create() {
        //  Game background
        game.stage.backgroundColor = "#D3D3D3";

        //  Physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  Add player sprite
        player = game.add.sprite(64, 300, "player");
        game.camera.follow(player);

        //  Set up enemies
        this.enemies = game.add.physicsGroup();
        this.enemies.create(576, 64, 'enemy');
        this.enemies.create(416, 352, 'enemy');
        this.enemies.create(1330, 64, 'enemy');
        this.enemies.create(2513, 352, 'enemy');
        this.enemies.create(2790, 64, 'enemy');
        this.enemies.create(3456, 352, 'enemy');
        this.enemies.create(3328, 96, 'enemy');
        this.enemies.create(3328, 352, 'enemy');


        //  Add pipe sprite and animation
        this.pipes = game.add.physicsGroup();
        this.pipes.create(32, 64, 'pipe');
        this.pipes.create(672, 64, 'pipe');
        this.pipes.create(960, 352, 'pipe');
        this.pipes.create(1216, 64, 'pipe');
        this.pipes.create(1841, 128, 'pipe');
        this.pipes.create(2273, 352, 'pipe');
        this.pipes.create(2528, 352, 'pipe');
        this.pipes.create(3104, 96, 'pipe');
        this.pipes.create(3232, 96, 'pipe');
        this.pipes.create(3552, 352, 'pipe');
        this.pipes.forEach(function(obj) {
            obj.animations.add('spin', [0, 1, 2, 3, 4, 5], 12, true);
            obj.animations.play("spin");
            //game.physics.enable(obj);
        });
        //this.pipe.animations.add('spin', [0, 1, 2, 3, 4, 5], 12, true);
        //this.pipe.animations.play("spin");

        //  Add door sprite and animation
        this.door = game.add.sprite(768, 352, "door");
        game.physics.enable(this.door);
        this.door.body.immovable = true;

        //  Enable physics for player
        game.physics.enable(player);



        //  Set player to collide with world bounds
        player.body.collideWorldBounds = true;

        //  Set gravity for player
        player.body.gravity.y = 600;

        //  Because we're loading CSV map data we have to specify the tile size here or we can't render it
        map = game.add.tilemap('map', 32, 32);

        //  Now add in the tileset
        map.addTilesetImage('tileset');

        //  Player and spike collision
        map.setTileIndexCallback(1, gameOver, this);

        //  Create our layer
        layer = map.createLayer(0);

        //  Resize the world
        layer.resizeWorld();

        //  Select tiles to collide with, from index 0 to index 3 in tileset
        map.setCollisionBetween(0, 7);
        map.setCollision(9);

        //  Door collision
        map.setTileIndexCallback(9, hitDoor, this);

        player.anchor.setTo(0.5, 0.5);

        //  Game sounds
        pipesound = game.add.audio("pipesound");
        gamemusic = game.add.audio("gamemusic");

        gamemusic.play();
        //sounds take time to decode, this notifies when they are ready to use
        //game.sound.setDecodedCallback([ pipesound ], start, this);

        // Score
        teksti = game.add.text(game.camera.x + 230, 5, "Pipes collected: " + pipesCollected, {
        font: "30px Arial",
        fill: "#000000",
        align: "center"
        });

        mutebutton = game.add.button(2,2, "mutebuttonImage", mute, this);
        //mutebutton.onInputOver.add(over, this);
        mutebutton.frame = 1;
    }

    function update() {
        //  Player collision with tiles
        game.physics.arcade.collide(player, layer);

        //  Player collision with pipes
        game.physics.arcade.collide(player, this.pipes, collectPipe, null, this);

        //  Player collision with enemies
        game.physics.arcade.collide(player, this.enemies, hitEnemy, null, this);

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

        // Mutebutton
        mutebutton.x = game.camera.x;

        //  Select frame to display
        if (dir == "left") {
            player.frame = 1;
        } else if (dir == "right") {
            player.frame = 0;
        }

        //  Check for open door
        if (this.doorOpen) {
            game.physics.arcade.collide(this.door, player);
        }

        //console.log(player.x);
        //console.log(player.y);
        showScore();
        }

    function showScore() {
      teksti.setText("Pipes collected: " + pipesCollected);
    }

    function collectPipe(item, item2) {
      console.log(pipesCollected)
        pipesCollected ++;
        console.log(pipesCollected)
        pipesound.play();
        item2.destroy();
        if (pipesCollected == 10) {
            doorOpen = true;
        }
    }

    function hitDoor(obj1, obj2) {
        if (doorOpen) {
        obj2.frame = 1;
        win();
        }
    }

    function hitEnemy(p, e) {
        if (p.y < e.y) {
            e.destroy();
            p.body.velocity.y = -200;
            jumpTimer = game.time.now + 650;
        } else {
            gameOver();
        }
    }

    function win() {
        player.kill();
        game.add.text(game.camera.x + 280 , 155, "You Win!", {
        font: "65px Arial",
        fill: "#000000",
        align: "center"
    });
    }

    function mute() {
      switch (game.sound.mute) {
        case true:
          game.sound.mute = false;
          mutebutton.frame = 1;
          break;
        case false:
          game.sound.mute = true;
          mutebutton.frame = 0;
          break;
      }
    }


}(Phaser));
