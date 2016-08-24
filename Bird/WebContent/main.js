var game = new Phaser.Game(600, 490, Phaser.AUTO, 'game_div');

var main_state = {
	boot:function(){//启动前的准备
		this.preload = function(){
	        game.load.image('loading','assets/preloader.gif'); //加载进度条图片资源
	    };
	    this.create = function(){
	        game.state.start('preload'); //加载完成后，调用preload场景
	    };
	},
	preload: function() {
		this.preload = function(){
			var preloadSprite = game.add.sprite(50,game.height/2,'loading'); //创建显示loading进度的sprite
	        game.load.setPreloadSprite(preloadSprite);  //用setPreloadSprite方法来实现动态进度条的效果
	        
	        //以下为要加载的资源
	        game.load.image('bg','assets/background.png'); //游戏背景图
	        game.load.image('ground','assets/ground.png'); //地面
	        game.load.image('title','assets/title.png'); //游戏标题
	        game.load.spritesheet('bird','assets/bird.png',34,24,3); //鸟
	        game.load.image('btn','assets/start-button.png');  //按钮
	        game.load.spritesheet('pipe','assets/pipes.png',54,320,2); //管道
	        game.load.bitmapFont('flappy_font', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');//显示分数的字体
	        game.load.audio('fly_sound', 'assets/flap.wav');//飞翔的音效
	        game.load.audio('score_sound', 'assets/score.wav');//得分的音效
	        game.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav'); //撞击管道的音效
	        game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效

	        game.load.image('ready_text','assets/get-ready.png'); //get ready图片
	        game.load.image('play_tip','assets/instructions.png'); //玩法提示图片
	        game.load.image('game_over','assets/gameover.png'); //gameover图片
	        game.load.image('score_board','assets/scoreboard.png'); //得分板
		}
		this.create = function(){
	        game.state.start('menu'); //当以上所有资源都加载完成后就可以进入menu游戏菜单场景了
	    }
    },
	menu:function(){
		this.create = function(){
			var bg = game.add.tileSprite(0,0,game.width,game.height,'bg'); //自动移动的图片背景
			var ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground'); //当作地面的tileSprite
	        bg.autoScroll(-10,0); //让背景动起来
	        ground.autoScroll(-100,0); //让地面动起来
	        
	        var titleGroup = game.add.group(); //创建存放标题的组，这样对该组的操作将会作用到每个组元素上。
	        titleGroup.create(0,0,'title'); //通过组的create方法创建标题图片并添加到组里
	        var bird = titleGroup.create(190, 10, 'bird'); //创建bird对象并添加到组里
	        bird.animations.add('fly'); //给鸟添加动画
	        bird.animations.play('fly',12,true); //播放动画
//	        titleGroup.x = 35; //调整组的水平位置
	        titleGroup.x = game.width/2 - 112;
	        titleGroup.y = 100; //调整组的垂直位置
	        game.add.tween(titleGroup).to({ y:120 },1000,null,true,0,Number.MAX_VALUE,true); //对这个组添加一个tween动画，让它不停的上下移动
	        // add begin button
	        var btn = game.add.button(game.width/2,game.height/2,'btn',function(){//添加一个按钮
	            game.state.start('play'); //点击按钮时跳转到play场景
	        });
	        btn.anchor.setTo(0.5,0.5); //设置按钮的中心点
		}
	},
	play:function(){
		this.create = function(){
	        this.bg = game.add.tileSprite(0,0,game.width,game.height,'bg');//背景图,这里先不用移动，游戏开始后再动
	        this.pipeGroup = game.add.group();//用于存放管道的组，后面会讲到
	        this.pipeGroup.enableBody = true;
	        this.ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground'); //地板，这里先不用移动，游戏开始后再动
	        this.soundFly = this.game.add.audio('fly_sound');
	        this.bird = game.add.sprite(50,150,'bird'); //鸟
	        this.bird.animations.add('fly');//添加动画
	        this.bird.animations.play('fly',12,true);//播放动画
	        this.bird.anchor.setTo(0.5, 0.5); //设置中心点
	        //只有开启了对象的物理系统，该对象才具有物理特性，开启了物理系统后，对象的body属性指向该对象拥有的物理系统，所有与物理相关的属性或方法都必须在body上进行操作
	        game.physics.enable(this.bird,Phaser.Physics.ARCADE); //开启鸟的物理系统（默认的游戏中的每个对象的物理系统是关闭的）
	        this.bird.body.gravity.y = 0; //鸟的重力,未开始游戏，先让重力为0，不然鸟会掉下来
	        game.physics.enable(this.ground,Phaser.Physics.ARCADE);//开启地面的物理系统
	        this.ground.body.immovable = true; //让地面在物理环境中固定不动

	        this.readyText = game.add.image(game.width/2, 40, 'ready_text'); //get ready 文字
	        this.playTip = game.add.image(game.width/2,300,'play_tip'); //提示点击屏幕的图片
	        this.readyText.anchor.setTo(0.5, 0);
	        this.playTip.anchor.setTo(0.5, 0);

	        this.hasStarted = false; //游戏是否已开始
	        game.time.events.loop(900, this.generatePipes, this); //利用时钟事件来循环产生管道
	        game.time.events.stop(false); //先不要启动时钟
	        //鼠标点击事件：Phaser中的鼠标、键盘、触摸等交互事件都统一由Input对象来处理。我们需要鼠标点击屏幕后进行响应，可以使用Input对象的onDown属性，该属性指向一个Phaser.Signal对象，我们可以在这个对象上绑定事件，每当鼠标按键下，就会触发一个onDown的信号，如果这个onDown信号对象上绑定了事件，那么这些事件就会执行。
	        game.input.onDown.addOnce(this.statrGame, this); //点击屏幕后正式开始游戏
	    }
	    this.statrGame = function(){
	    	this.gameSpeed = 200; //游戏速度
	        this.gameIsOver = false; //游戏是否已结束的标志
	        this.hasHitGround = false; //是否已碰撞到地面的标志
	        this.hasStarted = true; //游戏是否已经开始的标志
	        this.score = 0; //初始得分
	        this.bg.autoScroll(-(this.gameSpeed/10),0); //让背景开始移动
	        this.ground.autoScroll(-this.gameSpeed,0); //让地面开始移动
	        this.bird.body.gravity.y = 1150; //给鸟设一个重力
	        this.readyText.destroy(); //去除 'get ready' 图片
	        this.playTip.destroy(); //去除 '玩法提示 图片
	        game.input.onDown.add(this.fly, this); //给鼠标按下事件绑定鸟的飞翔动作
	        game.time.events.start(); //启动时钟事件，开始制造管道
	    }
	    this.fly = function(){
	        this.bird.body.velocity.y = -350; //飞翔，实质上就是给鸟设一个向上的速度
	        game.add.tween(this.bird).to({angle:-30}, 100, null, true, 0, 0, false); //上升时头朝上的动画
	        this.soundFly.play(); //播放飞翔的音效
	    }
	    this.generatePipes = function(gap){ //制造一组上下的管道
	        gap = gap || 100; //上下管道之间的间隙宽度
	        var position = (505 - 320 - gap) + Math.floor((505 - 112 - 30 - gap - 505 + 320 + gap) * Math.random());//计算出一个上下管道之间的间隙的随机位置
	        var topPipeY = position-360; //上方管道的位置
	        var bottomPipeY = position+gap; //下方管道的位置

	        if(this.resetPipe(topPipeY,bottomPipeY)) return; //如果有出了边界的管道，则重置他们，不再制造新的管道了,达到循环利用的目的

	        var topPipe = game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup); //上方的管道
	        var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup); //下方的管道
	        this.pipeGroup.setAll('checkWorldBounds',true); //边界检测
	        this.pipeGroup.setAll('outOfBoundsKill',true); //出边界后自动kill
	        this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed); //设置管道运动的速度
	    }
	    this.resetPipe = function(topPipeY,bottomPipeY){//重置出了边界的管道，做到回收利用
	        var i = 0;
	        this.pipeGroup.forEachDead(function(pipe){ //对组调用forEachDead方法来获取那些已经出了边界，也就是“死亡”了的对象
	            if(pipe.y<=0){ //是上方的管道
	                pipe.reset(game.width, topPipeY); //重置到初始位置
	                pipe.hasScored = false; //重置为未得分
	            }else{//是下方的管道
	                pipe.reset(game.width, bottomPipeY); //重置到初始位置
	            }
	            pipe.body.velocity.x = -this.gameSpeed; //设置管道速度
	            i++;
	        }, this);
	        return i == 2; //如果 i==2 代表有一组管道已经出了边界，可以回收这组管道了
	    }
	},
    create: function() {},

    update: function() {},
    
    
 

    
};
//把定义好的场景添加到游戏中
game.state.add('boot',main_state.boot);
game.state.add('preload',main_state.preload);
game.state.add('menu',main_state.menu);
game.state.add('play',main_state.play);
game.state.start('boot'); 