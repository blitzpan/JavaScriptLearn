var game = new Phaser.Game(600, 490, Phaser.AUTO, 'game_div');

var main_state = {
	boot:function(){//启动前的准备
		
	},
	menu:function(){
		
	},
	play:function(){
		
	},
	preload: function() { 
        this.game.stage.backgroundColor = '#71c5cf';
        this.game.load.image('bg', 'assets/bg_day.png');  
        this.game.load.image('bird', 'assets/bird0_0.png');  
        this.game.load.image('pipeup', 'assets/pipe_up.png');      
        this.game.load.image('pipedown', 'assets/pipe_down.png');      
        // Load jump sound
        this.game.load.audio('jump', 'assets/jump.wav');
    },

    create: function() {
    	var bg = game.add.tileSprite(0,0,game.width,game.height,'bg'); //当作背景的tileSprite 
    	//bg.autoScroll(-10,0); //让背景动起来
    	
        var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        space_key.onDown.add(this.jump, this); 

        this.pipeups = game.add.group();
        this.pipeups.createMultiple(20, 'pipeup');  
        this.pipedowns = game.add.group();
        this.pipedowns.createMultiple(20, 'pipedown');  
        this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);           

        this.bird = this.game.add.sprite(100, 245, 'bird');
        this.bird.body.gravity.y = 1000;
         // Change the anchor point of the bird
        this.bird.anchor.setTo(-0.2, 0.5);
               
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ffffff" };
        this.label_score = this.game.add.text(20, 20, "0", style); 

        // Add sounds to the game
        this.jump_sound = this.game.add.audio('jump');
    },

    update: function() {
        if (this.bird.inWorld == false)
            this.restart_game(); 

        // Make the bird slowly rotate downward
        if (this.bird.angle < 20)
            this.bird.angle += 1;

        this.game.physics.overlap(this.bird, this.pipeups, this.hit_pipe, null, this);      
        this.game.physics.overlap(this.bird, this.pipedowns, this.hit_pipe, null, this);      
    },

    jump: function() {
        // if the bird hit a pipe, no jump
        if (this.bird.alive == false)
            return; 

        this.bird.body.velocity.y = -350;

        // Animation to rotate the bird
        this.game.add.tween(this.bird).to({angle: -20}, 100).start();

        // Play a jump sound
        this.jump_sound.play();
    },

    // Dead animation when the bird hit a pipe
    hit_pipe: function() {
        // If the bird has already hit a pipe, we have nothing to do
        if (this.bird.alive == false)
            return;

        // Set the alive flag to false
        this.bird.alive = false;

        // Prevent new pipes from apearing
        this.game.time.events.remove(this.timer);

        // Go trough all the pipes, and stop their movement
        this.pipeups.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);
        this.pipedowns.forEachAlive(function(p){
        	p.body.velocity.x = 0;
        }, this);
    },
    restart_game: function() {
        this.game.time.events.remove(this.timer);
        this.game.state.start('main');
    },
    add_row_of_pipes: function() {
    	var x = 600;
        var y = Math.floor( Math.random()*320 ) - 320;
        var pipe = this.pipeups.getFirstDead();
        pipe.reset(x, y+320+200);
        pipe.body.velocity.x = -200; 
        pipe.outOfBoundsKill = true;
        pipe = this.pipedowns.getFirstDead();
        pipe.reset(x, y);
        pipe.body.velocity.x = -200;
        pipe.outOfBoundsKill = true;   
        this.score += 1;
        this.label_score.content = this.score;  
    },
};
game.state.add('main', main_state);  
game.state.start('main'); 