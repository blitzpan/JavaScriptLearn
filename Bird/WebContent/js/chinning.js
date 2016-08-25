var game = new Phaser.Game(320, 505, Phaser.AUTO, 'game_div');
var people;
var peopleDown;
var peopleUp;

var main_state = {
	boot:function(){//启动前的准备
		this.preload = function(){
			if(!game.device.desktop){//移动设备自适应
				this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
				this.scale.forcePortrait = true;
				this.scale.refresh();
			}
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
	        game.load.spritesheet('people','assets/chinning/people.png',100,157,10); 
	        game.load.image('btn','assets/start-button.png');  //按钮
		}
		this.create = function(){
	        game.state.start('menu'); //当以上所有资源都加载完成后就可以进入menu游戏菜单场景了
	    }
    },
	menu:function(){
		this.create = function(){
			people = game.add.sprite(50,150,'people');
			people.anchor.setTo(0.5, 0.5); //设置中心点
			peopleUp = people.animations.add('up',[0,1,2,3,4,5,6],10,false);//添加动画
			people.animations.play('up');
			peopleDown = people.animations.add('down',[10,9,8,7,6,5,4,3,2,1],10,false);//添加动画
			
	        // add begin button
	        var btn = game.add.button(game.width/2,game.height/2,'btn',function(){//添加一个按钮
	        	people.animations.play('up');
	        });
	        btn.anchor.setTo(0.5,0.5); //设置按钮的中心点
	        var dbtn = game.add.button(game.width/2,game.height/2 + 100,'btn',function(){//添加一个按钮
	        	people.animations.play('down');
	        });
	        game.input.touch.onTouchStart = function(event){
//	        	console.log('start');
	        }
	        game.input.touch.onTouchMove = function(event){
	        	//console.log('move');
	        	//console.log(game.input.touch);
	        }
	        game.input.touch.onTouchEnd = function(event){
	        	//console.log('end');
	        }
	        game.input.touch.touchMoveCallback = function(){
	        	console.log('touch move');
	        }
		}
		this.startGame = function(){
			console.log('123');
		}
	},
    create: function() {},
    /* 渲染方法*/
    render : function(){
    	//这里添加一个debug方法
//    	game.debug.text('Hold left/right to move the ufo.', 16, 32);
    }
};
//把定义好的场景添加到游戏中
game.state.add('boot',main_state.boot);
game.state.add('preload',main_state.preload);
game.state.add('menu',main_state.menu);
game.state.add('render',main_state.render);

game.state.start('boot'); 
