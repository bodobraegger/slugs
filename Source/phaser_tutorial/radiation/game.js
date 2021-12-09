var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

Main.Game = function (game) {
	this.game = game;
};

Main.Game.prototype = {
	create: function () {
		//Background color
		this.stage.backgroundColor = "#001C00";
		
		//Music
		bgm = this.add.audio('bgm',1.5*volume,true);
		bgm.play();
		
		//Bitmap for lines
		hr = this.add.bitmapData(640,1);
		hr.ctx.beginPath();
		hr.ctx.rect(0, 0, 640, 1);
		hr.ctx.fillStyle = "#007200";
		hr.ctx.fill();
		
		//Bitmap for box
		box = this.add.bitmapData(8,13);
		box.ctx.beginPath();
		box.ctx.rect(0, 0, 8, 13);
		box.ctx.fillStyle = "#007200";
		box.ctx.fill();
		
		//Bitmap for tv effect
		tv = this.add.bitmapData(640,1);
		tv.ctx.beginPath();
		tv.ctx.rect(0, 0, 640, 2);
		tv.ctx.fillSTyle = "#606060";
		tv.ctx.fill();
		
		//Horizontal lines
		this.add.sprite(0,34,hr);
		this.add.sprite(0,446,hr);
		
		//Step counter
		steps = 0;
		stepCount = this.add.text(10,7,"STEPS: "+steps,{font: "16px Typewriter"});
		stepCount.fill = "#007200";
		
		//Text output/buffer (66 character limit)
		buffer = [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "];
		outputText = ""
		output = this.add.text(10,47,outputText,{font: "16px Typewriter"});
		output.fill = "#007200";
		
		//Text input
		inputText = ""
		input = this.add.text(10,454,"INPUT > "+inputText,{font: "16px Typewriter"});
		input.fill = "#007200";
		
		//Flashing box
		flash = 500;
		flashbox = this.add.sprite(86,457,box);
		
		//Key capture
		scope = this;
		this.input.keyboard.onDownCallback = function(key) {scope.addLetter(key.keyCode)};
		
		//Room number (to keep track of the player position)
		room = 1;

		//Triggers
		end = false;
		computer = false;
		elevator = false;
		nest = false;
		mail = false;
		lock = false;
		locker = false;
		passwrd = false;
		box = false;
		trapdoor = false;	
		vent = false;
		keypad = false;
		chest = false;
		battaken = false;
		powered = false;
		lighton = false;
		glassshatter = false;
		hazequipped = false;
		ropehook = false;

		//Inventory
		inventory = [];
		key = false;
		note = false;
		screwdriver = false;
		hammer = false;
		flashlight = false;
		clock = false;
		battery = false;
		hazmat = false;
		rope = false;
		c4 = false;
		
		//Initial text
		this.textFeed("During  a hike  through  a forest far  away from  civilization you");
		this.textFeed("stumble  upon an old  facility.  It appears  to be an  old nuclear");
		this.textFeed("power plant,  fallen into decay. Curious  as you are you enter the");
		this.textFeed("building. Once inside the door slam shut behind you. Unable to get");
		this.textFeed("the doors  open by hand your  only option is to find  some tool to");
		this.textFeed("break these doors open.")
		this.textFeed(" ");
		room = 1;
		this.roomLore(room);
		
		//Old tv effect
		for (i = 0; i < 480; i+=3) {
			tvbar = this.add.sprite(0,i,tv);
			tvbar.alpha = 0.15;
		}
		
		//Mute button
		mute = this.add.sprite(608,0,'mute');
		if (this.sound.mute == true) {
			mute.frame = 1;
		}
		mute.inputEnabled = true;
		mute.input.useHandCursor = true;
		//Mute trigger
		mute.events.onInputDown.add(this.toggleSound,this);
	},

	update: function() {	
		//Key capture for browser settings
		this.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);
		this.input.keyboard.addKeyCapture(Phaser.Keyboard.BACKSPACE);
	
		//Update input text
		input.setText("INPUT > "+inputText);
		stepCount.setText("STEPS: "+steps);
		
		//Update terminal text
		buffertext = ""
		for (lines = 0; lines < buffer.length; lines++) {
			buffertext += buffer[lines];
			if (lines < buffer.length-1) {
				buffertext += "\n";
			}
		}
		outputText = buffertext;
		output.setText(outputText);
		
		//Flash input icon
		if (flash < this.time.now) {
			flashbox.visible = !flashbox.visible;
			flash = this.time.now + 500;
		}
		//Flashing icon moves with text
		flashbox.x = 86 + (9.3 * inputText.length);
	},
	
	addLetter: function (key) {
		//Keycodes
		found = false;
		keyCodes = [81,87,69,82,84,89,85,73,79,80,65,83,68,70,71,72,74,75,76,90,88,67,86,66,78,77,32,13,8,49,50,51,52,53,54,55,56,57,48];
		keys = ["Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","Z","X","C","V","B","N","M"," ","enter","backspace","1","2","3","4","5","6","7","8","9","0"];
		//Decode letters
		for (i = 0; i < keyCodes.length; i++) {
			if (keyCodes[i] == key) {
				letter = keys[i];
				found = true;
				break;	
			}
		}
		//Process keys
		if (found) {
			//Backspace
			if (letter == "backspace") {
				if (inputText.length >= 1) {
					this.sound.play('click',0.3*volume);
					inputText = inputText.substring(0, inputText.length - 1);
				}
			}
			//Enter (feed text to terminal)
			else if (letter == "enter") {
				if (inputText != "") {
					if (room > 0 && room <= 17) {
						steps++;
					}
					this.textFeed(" ");
					this.textFeed("> "+inputText);
					this.process(inputText);
					inputText = "";
				}
			}
			//Add letters and spaces, maximum of 30 characters
			else {
				if (inputText.length < 30) {
					this.sound.play('click',0.3*volume);
					inputText += letter;
				}
			}
		}
	},

	addZero: function (time) {
		//Add zero to low value clock times
		if (time < 10) {
			time = "0" + time;
		}
		return time;
	},
	
	process: function (command) {
		//Split command so it is easier to discover patterns for if statements
		first = command.split(" ")[0];
		second = command.split(" ")[1];
		third = command.split(" ")[2];
		fourth = command.split(" ")[3];
		
		//If the end is reached, only menu can be used to return to menu.
		if (room == 18) {
			if (first == "MENU") {
				if (command == "MENU") {
					bgm.stop();
					this.state.start('menu');
				}
				else {
					this.textFeed("I only understood as far as 'MENU'.");
				}
			}
			else {
				this.textFeed("Type 'MENU' to exit the game.");
			}
		}
		
		else {
			//In case you are reading this and see all these messy if statements below:
			//"If it looks stupid, but it works, it is not stupid!"
			
			//If the player did menu/quit/exit it has to be confirmed first
			if (command == "YES" && buffer[buffer.length-3].indexOf("go to menu") != -1) {
				bgm.stop();
				this.state.start("menu");
			}
			else if (command != "YES" && buffer[buffer.length-3].indexOf("go to menu") != -1) {
				this.textFeed("You decided to stay. Keep playing!");
			}
			//There are two passwords (pc/keypad), each will be asked based on if the keyphrase was in the last message
			else if (command != "U235" && buffer[buffer.length-3].indexOf("PASSWORD") != -1 && passwrd == false) {
				this.textFeed("Incorrect.");
			}
			else if (command != "65345" && buffer[buffer.length-3].indexOf("KEYCODE") != -1 && keypad == false) {
				this.textFeed("Incorrect.");
			}
			
			//MENU:QUIT:EXIT: leave the game (will prompt confirm)
			else if (first == "MENU" || first == "QUIT" || first == "EXIT") {
				if (command == "MENU" || command == "QUIT" || command == "EXIT") {
					this.textFeed("Want to go to menu? Type 'YES' to confirm.");
				}
				else {
					this.textFeed("I only understood as far as '"+first+"'.");
				}
			}

			//PUT: these are exclusive commands for transfering the battery from the clock to flashlight
			else if (first == "PUT") {
				if (command == "PUT") {
					this.textFeed("Put what?");
				}
				else if (command == "PUT IN") {
					this.textFeed("Put in what?");
				}
				else {
					if (command == "PUT IN BATTERY" && battery == true) {
						this.textFeed("Put battery in what?");
					}
					else if (command == "PUT BATTERY" && battery == true) {
						this.textFeed("Put battery in what?");
					}
					else if (command == "PUT BATTERY IN FLASHLIGHT" && battery == true && flashlight == true && powered == false) {
						this.sound.play('item',1.5*volume);
						powered = true;
						inventory.splice(inventory.indexOf('Battery'),1);
						this.textFeed("You put the battery in the flashlight.");
					}
					else if (command == "PUT BATTERY IN FLASH LIGHT" && battery == true && flashlight == true && powered == false) {
						this.sound.play('item',1.5*volume);
						powered = true;
						inventory.splice(inventory.indexOf('Battery'),1);
						this.textFeed("You put the battery in the flashlight.");
					}
					else if (command == "PUT BATTERY IN FLASHLIGHT" && battery == true && flashlight == true && powered == true) {
						this.textFeed("You did put the battery in already.");
					}
					else if (command == "PUT BATTERY IN FLASH LIGHT" && battery == true && flashlight == true && powered == true) {
						this.textFeed("You did put the battery in already.");
					}
					else if (command == "INSERT BATTERY" && battery == true) {
						this.textFeed("INSERT battery in what?");
					}
					else if (command == "INSERT BATTERY IN FLASHLIGHT" && battery == true && flashlight == true && powered == false) {
						this.sound.play('item',1.5*volume);
						powered = true;
						this.textFeed("You insert the battery in the flashlight.");
					}
					else if (command == "INSERT BATTERY IN FLASH LIGHT" && battery == true && flashlight == true && powered == false) {
						this.sound.play('item',1.5*volume);
						powered = true;
						this.textFeed("You insert the battery in the flashlight.");
					}
					else if (command == "INSERT BATTERY IN FLASHLIGHT" && battery == true && flashlight == true && powered == true) {
						this.textFeed("You did put the battery in already.");
					}
					else if (command == "INSERT BATTERY IN FLASH LIGHT" && battery == true && flashlight == true && powered == true) {
						this.textFeed("You did put the battery in already.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}
			
			//LOOK: repeats the room message in case this has been removed due to other commands.
			else if (first == "LOOK") {
				if (command == "LOOK" || command == "LOOK AROUND"){
					this.roomLore(room);
				}
				else {
					this.textFeed("I only understood as far as 'LOOK'.");
				}
			}
			
			//HELP: repeats a summary of the help page shown in the menu
			else if (first == "HELP") {
				if (first == "HELP" || first+second == "HELP ME") {
					this.textFeed("Radiation  is a  text  adventure  game.  You control  the game  by");
					this.textFeed("typing commands  in the  terminal  below. All  commands are simple");
					this.textFeed("and only  use like 1-4 words.  For example  say  'GO EAST' to move");
					this.textFeed("to that  room  if possible.  Think logical:  what would  you do in");
					this.textFeed("if  you would be  in  this situation  for  real?  Write down  your");
					this.textFeed("thoughts!  Some  useful  commands are 'GO','LOOK','INSPECT','GET',");
					this.textFeed("'USE','OPEN','INVENTORY' and many more.");
				}
				else {
					this.textFeed("I only understood as far as 'HELP'.");
				}
			}
			
			//GO:WALK: moves player to next room if possible (pathways,restraints,...)
			else if (first == "GO" || first == "WALK") {
				if (command == "GO") {
					this.textFeed("Go where?");
				}
				else if (command == "WALK") {
					this.textFeed("Walk where?");
				}
				else if (second == "NORTH" || second == "UP"){
					if (room == 1){
						room = 2;
						this.roomLore(room);
					}
					else if (room == 2){
						room = 3;
						this.roomLore(room);
					}
					else if (room == 5) {
						this.textFeed("You have to climb down the tree first, dummy.");
					}
					else if (room == 6) {
						room = 1;
						this.roomLore(room);
					}
					else if (room == 9 && vent == false) {
						this.textFeed("You first need to remove the vent before you can go through.");
					}
					else if (room == 9 && vent == true) {
						room = 11;
						this.roomLore(room);
					}
					else if (room == 10) {
						room = 9;
						this.roomLore(room);
					}
					else if (room == 14) {
						room = 15;
						this.roomLore(room);
					}
					else {
						this.textFeed("I can not go to the north from here.");
					}
				}
				else if (second == "EAST" || second == "RIGHT") {
					if (room == 1) {
						if (elevator == true) {
							room = 7;
							this.roomLore(room);
						}
						else {
							this.textFeed("The elevator seems to be out of order.");
						}
					}
					else if (room == 2) {
						room = 4;
						this.roomLore(room);
					}
					else if (room == 5) {
						this.textFeed("You have to climb down the tree first, dummy.");
					}
					else if (room == 8) {
						room = 9;
						this.roomLore(room);
					}
					else if (room == 9) {
						if (keypad == true) {
							room = 12;
							this.roomLore(room);
						}
						else {
							this.textFeed("The door is locked by a keypad.");
						}
					}
					else if (room == 13) {
						room = 14;
						this.roomLore(room);
					}
					else if (room == 14 && hazequipped == false) {
						this.textFeed("I probably shouldn't go there without protection.");
					}
					else if (room == 14 && hazequipped == true) {
						room = 17;
						this.roomLore(room);
					}
					else if (room == 15 && lighton == false) {
						this.textFeed("It is too dark to go downstairs.");
					}
					else if (room == 15 && lighton == true) {
						room = 16;
						this.roomLore(room);
					}
					else {
						this.textFeed("I can not go to the east from here.");
					}	
				}
				else if (second == "SOUTH" || second == "DOWN") {
					if (room == 1) {
						room = 6;
						this.roomLore(room);
					}
					else if (room == 2) {
						room = 1;
						this.roomLore(room);
					}
					else if (room == 3) {
						room = 2;
						this.roomLore(room);
					}
					else if (room == 5) {
						this.textFeed("You have to climb down the tree first, dummy.");
					}
					else if (room == 9) {
						room = 10;
						this.roomLore(room);
					}
					else if (room == 11) {
						room = 9;
						this.roomLore(room);
					}
					else if (room == 15) {
						room = 14;
						this.roomLore(room);
					}
					else {
						this.textFeed("I can not go to the south from here.");
					}
				}
				else if (second == "WEST" || second == "LEFT") {
					if (room == 1) {
						if (end == true) {
							room = 18
							bgm.stop();
							this.textFeed(" ");
							this.textFeed(" ");
							this.textFeed("With a huge blast you managed to escape the facility. To avoid any");
							this.textFeed("similar situations  you decide to run far away from here.  Back to");
							this.textFeed("your old, safe home. Forever.");
							this.textFeed(" ");
							this.textFeed("              ##### #   # #####    ##### #   # ####               ");
							this.textFeed("                #   #   # #        #     ##  # #   #              ");
							this.textFeed("                #   ##### #####    ##### # # # #   #              ");
							this.textFeed("                #   #   # #        #     #  ## #   #              ");
							this.textFeed("                #   #   # #####    ##### #   # ####               ");
							this.textFeed(" ");
							this.textFeed("You managed to escape in "+steps+" steps. Good job!");
							this.textFeed(" ");
							this.textFeed("Type 'MENU' to exit the game.")
						}
						else {
							this.textFeed("You will never be able to open this with your hands.");
						}
					}
					else if (room == 4) {
						room = 2;
						this.roomLore(room);
					}
					else if (room == 5) {
						this.textFeed("You have to climb down the tree first, dummy.");
					}
					else if (room == 7) {
						room = 1;
						this.roomLore(room);
					}
					else if (room == 9) {
						room = 8;
						this.roomLore(room);
					}
					else if (room == 12) {
						room = 9;
						this.roomLore(room);
					}
					else if (room == 14) {
						room = 13;
						this.roomLore(room);
					}
					else if (room == 16) {
						room = 15;
						this.roomLore(room);
					}
					else if (room == 17) {
						room = 14;
						this.roomLore(room);
					}
					else {
						this.textFeed("I can not go to the west from here.");
					}
				}
				else {
					this.textFeed("I only understood as far as '"+first+"'.");
				}
			}
			
			//INSPECT:INVESTIGATE:EXAMINE: gives extra lore on items, most of the times not required to progress
			else if (first == "INSPECT" || first == "INVESTIGATE" || first == "EXAMINE") {
				if (command == "INSPECT") {
					this.textFeed("Inspect what?");
				}
				else if (command == "INVESTIGATE") {
					this.textFeed("Investigate what?");
				}
				else if (command == "EXAMINE") {
					this.textFeed("Examine what?");
				}
				else {
					if (second == "NOTE" && note == true) {
						this.textFeed("TO JANITOR: Please order a new copy of the locker key.  That pesky");
						this.textFeed("bird in the courtyard stole it again.");
					}
					else if (second == "LETTER" && note == true) {
						this.textFeed("TO JANITOR: Please order a new copy of the locker key.  That pesky");
						this.textFeed("bird in the courtyard stole it again.");
					}
					else if (room == 1 && second == "DOOR") {
						this.textFeed("You will never be able to open this with your hands.");
					}
					else if (room == 1 && second == "DOORS") {
						this.textFeed("You will never be able to open this with your hands.");
					}
					else if (room == 1 && second == "ELEVATOR") {
						this.textFeed("The elevator seems to be out of order.");
					}
					else if (room == 2 && second == "DOCUMENTS") {
						this.textFeed("I already told you the documents do not contain useful info.");
					}
					else if (room == 2 && second == "DOCUMENT") {
						this.textFeed("I already told you the documents do not contain useful info.");
					}
					else if (room == 2 && second == "PAPERWORK") {
						this.textFeed("I already told you the documents do not contain useful info.");
					}
					else if (room == 2 && second == "COMPUTER") {
						this.textFeed("The computer looks very old.  Probably runs MS-DOS. Maybe it still");
						this.textFeed("works after all these years.");
					}
					else if (room == 3 && second == "TREE") {
						this.textFeed("This big old tree is sturdy all the way to the top.");
					}
					else if (room == 3 && second == "WALNUT" && third == "TREE") {
						this.textFeed("This big old tree is sturdy all the way to the top.");
					}
					else if (room == 4 && second == "TABLE") {
						this.textFeed("This table with coffee stains was used during lunchtime.");
					}
					else if (room == 4 && second == "BULLETINBOARD") {
						this.textFeed("The bulletin board contains holiday cards and party invitations.");
					}
					else if (room == 4 && second == "BOARD") {
						this.textFeed("The bulletin board contains holiday cards and party invitations.");
					}
					else if (room == 4 && second == "BULLETIN" && third == "BOARD") {
						this.textFeed("The bulletin board contains holiday cards and party invitations.");
					}
					else if (room == 4 && second == "HOLIDAY" && third == "CARD") {
						this.textFeed("The card shows a picture of Berlin. Beautiful city!");
					}
					else if (room == 4 && second == "HOLIDAY" && third == "CARDS") {
						this.textFeed("The card shows a picture of Berlin. Beautiful city!");
					}
					else if (room == 4 && second == "CARD") {
						this.textFeed("The card shows a picture of Berlin. Beautiful city!");
					}
					else if (room == 4 && second == "CARDS") {
						this.textFeed("The card shows a picture of Berlin. Beautiful city!");
					}
					else if (room == 4 && second == "PARTY" && third == "INVITATION") {
						this.textFeed("The note invites employees to come to a party. Year: 1993");
					}
					else if (room == 4 && second == "PARTY" && third == "INVITATIONS") {
						this.textFeed("The note invites employees to come to a party. Year: 1993");
					}
					else if (room == 4 && second == "INVITATION") {
						this.textFeed("The note invites employees to come to a party. Year: 1993");
					}
					else if (room == 4 && second == "INVITATIONS") {
						this.textFeed("The note invites employees to come to a party. Year: 1993");
					}
					else if (room == 4 && second == "INVITE") {
						this.textFeed("The note invites employees to come to a party. Year: 1993");
					}
					else if (room == 4 && second == "MAILBOX" && mail == false) {
						this.textFeed("It seems like the mailbox has no lock.");
					}
					else if (room == 4 && second == "MAIL" && third == "BOX" && mail == false) {
						this.textFeed("It seems like the mailbox has no lock.");
					}
					else if (room == 4 && second == "MAIL" && mail == false) {
						this.textFeed("It seems like the mailbox has no lock.");
					}
					else if (room == 4 && second == "MAILBOX" && note == true) {
						this.textFeed("The mailbox is empty.");
					}
					else if (room == 4 && second == "MAIL" && third == "BOX" && note == true) {
						this.textFeed("The mailbox is empty.");
					}
					else if (room == 4 && second == "MAIL" && note == true) {
						this.textFeed("The mailbox is empty.");
					}
					else if (room == 4 && second == "MAILBOX" && mail == true && note == false) {
						this.textFeed("There is a note inside the mailbox.");
					}
					else if (room == 4 && second == "MAIL" && third == "BOX" && mail == true && note == false) {
						this.textFeed("There is a note inside the mailbox.");
					}
					else if (room == 4 && second == "MAIL" && mail == true && note == false) {
						this.textFeed("There is a note inside the mailbox.");
					}
					else if (room == 5 && second == "BIRD" && third == "NEST" && key == false) {
						this.textFeed("Inside the nest you spot a key. The bird probably stole it.");
						nest = true;
					}
					else if (room == 5 && second == "BIRDNEST" && key == false) {
						this.textFeed("Inside the nest you spot a key. The bird probably stole it.");
						nest = true;
					}
					else if (room == 5 && second == "NEST" && key == false) {
						this.textFeed("Inside the nest you spot a key. The bird probably stole it.");
						nest = true;
					}
					else if (room == 5 && second == "BIRD" && third == "NEST" && key == true) {
						this.textFeed("The bird nest is empty.");
					}
					else if (room == 5 && second == "BIRDNEST" && key == true) {
						this.textFeed("The bird nest is empty.");
					}
					else if (room == 5 && second == "NEST" && key == true) {
						this.textFeed("The bird nest is empty.");
					}
					else if (room == 6 && second == "LOCKER" && locker == true) {
						this.textFeed("The locker contains a switch labeled 'ELEVATOR'.");
					}
					else if (room == 6 && second == "LOCKER" && lock == false) {
						this.textFeed("The locker requires a key to be opened.");
					}
					else if (room == 6 && second == "LOCKER" && lock == true) {
						this.textFeed("The locker might contain something useful.");
					}
					else if (room == 9 && second == "KEYPAD" && keypad == false) {
						this.textFeed("It seems you need to enter a code to open the door.");
					}
					else if (room == 9 && second == "KEYPAD" && keypad == true) {
						this.textFeed("Using this keypad you opened the door.");
					}
					else if (room == 10 && second == "BOX") {
						this.textFeed("The box looks sturdy, but not too heavy.");
					}
					else if (room == 10 && second == "TRAPDOOR" && box == true) {
						this.textFeed("You found this trap door underneath the box.");
					}
					else if (room == 10 && second == "TRAP" && third == "DOOR" && box == true) {
						this.textFeed("You found this trap door underneath the box.");
					}
					else if (room == 11 && second == "WALL") {
						this.textFeed("The message says 'U235'.");
					}
					else if (room == 11 && second == "TEXT") {
						this.textFeed("The message says 'U235'.");
					}
					else if (room == 11 && second == "MESSAGE") {
						this.textFeed("The message says 'U235'.");
					}
					else if (room == 12 && second == "HOLE") {
						this.textFeed("This sure is a deep hole, hehe.");
					}
					else if (room == 14 && second == "DOOR") {
						this.textFeed("There probably is a lot of radiation beyond this door.");
					}
					else if (room == 14 && second == "SIGN") {
						this.textFeed("There probably is a lot of radiation beyond this door.");
					}
					else if (room == 15 && second == "CHEST" && chest == false) {
						this.textFeed("A wooden chest. What could be inside?");
					}
					else if (room == 15 && second == "CHEST" && chest == true && flashlight == false) {
						this.textFeed("Inside the chest is a flashlight.");
					}
					else if (room == 15 && second == "CHEST" && chest == true && flashlight == true) {
						this.textFeed("An empty chest.");
					}
					else if (second == "FLASHLIGHT" && flashlight == true && powered == false && powered == false) {
						this.textFeed("The flashlight has no power.  An inscription says 'Tick-tock where");
						this.textFeed("did my power go?'.");
					}
					else if (second == "FLASHLIGHT" && flashlight == true && powered == false && powered == true) {
						this.textFeed("The flashlight seems to be ready to turn on.");
					}
					else if (second == "FLASHLIGHT" && flashlight == true && powered == true && powered == true) {
						this.textFeed("The flashlight is on.");
					}
					else if (second == "FLASH" && third == "LIGHT" && flashlight == true && powered == false && powered == false) {
						this.textFeed("The flashlight has no power.  An inscription says 'Tick-tock where");
						this.textFeed("did my power go?'.");
					}
					else if (second == "FLASH" && third == "LIGHT" && flashlight == true && powered == false && powered == true) {
						this.textFeed("The flashlight seems to be ready to turn on.");
					}
					else if (second == "FLASH" && third == "LIGHT" && flashlight == true && powered == true && powered == true) {
						this.textFeed("The flashlight is on.");
					}
					else if (room == 15 && second == "STAIRS") {
						this.textFeed("It looks really dark down here.");
					}
					else if (room == 15 && second == "CLOCK" && clock == false) {
						d = new Date();
						h = this.addZero(d.getHours());
						m = this.addZero(d.getMinutes());
						nowTime = h+":"+m;
						this.textFeed("Surprisingly this clock is still ticking. Time: "+nowTime);
					}
					else if (second == "CLOCK" && clock == true && battaken == false) {
						d = new Date();
						h = this.addZero(d.getHours());
						m = this.addZero(d.getMinutes());
						nowTime = h+":"+m;
						this.textFeed("Surprisingly this clock is still ticking. Time: "+nowTime);
					}
					else if (second == "CLOCK" && clock == true && battaken == true) {
						if (typeof nowTime == 'undefined'){
							d = new Date();
							h = this.addZero(d.getHours());
							m = this.addZero(d.getMinutes());
							nowTime = h+":"+m;
						}
						this.textFeed("The clock got stuck on "+nowTime+" once you removed the battery.");
					}
					else if (room == 16 && second == "GLASS" && glassshatter == true && hazmat == false) {
						this.textFeed("You broke the glass. The suit is now in your reach.");
					}
					else if (room == 16 && second == "GLASS CASE" && glassshatter == true && hazmat == false) {
						this.textFeed("You broke the glass. The suit is now in your reach.");
					}
					else if (room == 16 && second == "GLASS CASING" && glassshatter == true && hazmat == false) {
						this.textFeed("You broke the glass. The suit is now in your reach.");
					}
					else if (room == 16 && second == "GLASS" && glassshatter == true && hazmat == true) {
						this.textFeed("An empty broken glass casing.");
					}
					else if (room == 16 && second == "GLASS CASE" && glassshatter == true && hazmat == true) {
						this.textFeed("An empty broken glass casing.");
					}
					else if (room == 16 && second == "GLASS CASING" && glassshatter == true && hazmat == true) {
						this.textFeed("An empty broken glass casing.");
					}
					else if (room == 16 && second == "GLASS") {
						this.textFeed("The glass casing contains a hazmat suit. Useful!");
					}
					else if (room == 16 && second == "GLASS CASE") {
						this.textFeed("The glass casing contains a hazmat suit. Useful!");
					}
					else if (room == 16 && second == "GLASS CASING") {
						this.textFeed("The glass casing contains a hazmat suit. Useful!");
					}
					else if (room == 17 && second == "C4" && c4 == false) {
						this.textFeed("You might be able to blow something up with this charge.");
					}
					else if (room == 17 && second == "ROPE" && rope == false) {
						this.textFeed("This rope is strong enough to use for climbing.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//READ: similar to inspect, but applies to documents/signs only
			else if (first == "READ") {
				if (command == "READ") {
					this.textFeed("Read what?");
				}
				else {
					if (second == "NOTE" && note == true) {
						this.textFeed("TO JANITOR: Please order a new copy of the locker key.  That pesky");
						this.textFeed("bird in the courtyard stole it again.");
					}
					else if (second == "LETTER" && note == true) {
						this.textFeed("TO JANITOR: Please order a new copy of the locker key.  That pesky");
						this.textFeed("bird in the courtyard stole it again.");
					}
					else if (room == 2 && second == "DOCUMENTS") {
						this.textFeed("I already told you the documents do not contain useful info.");
					}
					else if (room == 2 && second == "DOCUMENT") {
						this.textFeed("I already told you the documents do not contain useful info.");
					}
					else if (room == 2 && second == "PAPERWORK") {
						this.textFeed("I already told you the documents do not contain useful info.");
					}
					else if (room == 4 && second == "BULLETINBOARD") {
						this.textFeed("The bulletin board contains holiday cards and party invitations.");
					}
					else if (room == 4 && second == "BOARD") {
						this.textFeed("The bulletin board contains holiday cards and party invitations.");
					}
					else if (room == 4 && second == "BULLETIN" && third == "BOARD") {
						this.textFeed("The bulletin board contains holiday cards and party invitations.");
					}
					else if (room == 4 && second == "HOLIDAY" && third == "CARD") {
						this.textFeed("The card shows a picture of Berlin. Beautiful city!");
					}
					else if (room == 4 && second == "HOLIDAY" && third == "CARDS") {
						this.textFeed("The card shows a picture of Berlin. Beautiful city!");
					}
					else if (room == 4 && second == "CARD") {
						this.textFeed("The card shows a picture of Berlin. Beautiful city!");
					}
					else if (room == 4 && second == "CARDS") {
						this.textFeed("The card shows a picture of Berlin. Beautiful city!");
					}
					else if (room == 4 && second == "PARTY" && third == "INVITATION") {
						this.textFeed("The note invites employees to come to a party. Year: 1993");
					}
					else if (room == 4 && second == "PARTY" && third == "INVITATIONS") {
						this.textFeed("The note invites employees to come to a party. Year: 1993");
					}
					else if (room == 4 && second == "INVITATION") {
						this.textFeed("The note invites employees to come to a party. Year: 1993");
					}
					else if (room == 4 && second == "INVITATIONS") {
						this.textFeed("The note invites employees to come to a party. Year: 1993");
					}
					else if (room == 4 && second == "INVITE") {
						this.textFeed("The note invites employees to come to a party. Year: 1993");
					}
					else if (room == 11 && second == "WALL") {
						this.textFeed("The message says 'U235'.");
					}
					else if (room == 11 && second == "TEXT") {
						this.textFeed("The message says 'U235'.");
					}
					else if (room == 11 && second == "MESSAGE") {
						this.textFeed("The message says 'U235'.");
					}
					else if (room == 14 && second == "SIGN") {
						this.textFeed("There probably is a lot of radiation beyond this door.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//ENABLE:TOGGLE:TURN ON: switches devices to an active state
			else if (first == "ENABLE" || first == "TOGGLE" || first+" "+second == "TURN ON") {
				if (command == "ENABLE") {
					this.textFeed("Enable what?");
				}
				else if (command == "GRAB") {
					this.textFeed("Grab what?");
				}
				else if (command == "TURN ON") {
					this.textFeed("Turn on what?");
				}
				else {
					if (first == "TURN") {
						first = first+" "+second;
						second = third;
						third = fourth;
					}
					if (room == 1 && second == "ELEVATOR") {
						this.textFeed("I can not just magically turn this on out of nowhere.");
					}
					else if (room == 2 && second == "COMPUTER" && computer == false) {
						this.sound.play('computer',0.8*volume);
						this.textFeed("The computer started without any problem.");
						computer = true;
					}
					else if (room == 2 && second == "COMPUTER" && computer == true) {
						this.textFeed("The computer is already on.");
					}
					else if (room == 6 && second == "LEVER" && locker == true && elevator == false) {
						elevator = true;
						this.sound.play('lever',1.2*volume);
						this.textFeed("When you hit the lever you hear an elevator door open.");
					}
					else if (room == 6 && second == "SWITCH" && locker == true && elevator == false) {
						elevator = true;
						this.sound.play('lever',1.2*volume);
						this.textFeed("When you hit the lever you hear an elevator door open.");
					}
					else if (room == 6 && second == "LEVER" && locker == true && elevator == true) {
						this.textFeed("The lever is already enabled.");
					}
					else if (room == 6 && second == "SWITCH" && locker == true && elevator == true) {
						this.textFeed("The lever is already enabled.");
					}
					else if (second == "FLASHLIGHT" && flashlight == true && powered == false && powered == false) {
						this.textFeed("The flashlight has no power.");
					}
					else if (second == "FLASHLIGHT" && flashlight == true && lighton == false && powered == true) {
						this.sound.play('item',2.2*volume);
						lighton = true;
						this.textFeed("The flashlight turns on!");
					}
					else if (second == "FLASHLIGHT" && flashlight == true && lighton == true) {
						this.textFeed("The flashlight is already on.");
					}
					else if (second == "FLASH" && third == "LIGHT" && flashlight == true && powered == false && powered == false) {
						this.textFeed("The flashlight has no power.");
					}
					else if (second == "FLASH" && third == "LIGHT" && flashlight == true && lighton == false && powered == true) {
						this.sound.play('item',2.2*volume);
						lighton = true;
						this.textFeed("The flashlight turns on!");
					}
					else if (second == "FLASH" && third == "LIGHT" && flashlight == true && lighton == true) {
						this.textFeed("The flashlight is already on.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//BOOT:START: exclusive turn on commands for the computer, boot for us geeks of course
			else if (first == "BOOT" || first == "START") {
				if (command == "BOOT") {
					this.textFeed("Boot what?");
				}
				else if (command == "START") {
					this.textFeed("Start what?");
				}
				else {
					if (room == 2 && second == "COMPUTER" && computer == false) {
						this.sound.play('computer',0.8*volume);
						this.textFeed("The computer started without any problem.");
						computer = true;
					}
					else if (room == 2 && second == "COMPUTER" && computer == true) {
						this.textFeed("The computer is already on.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//EQUIP: exclusive use commands for the hazmat suit
			else if (first == "EQUIP") {
				if (command == "EQUIP") {
					this.textFeed("Equip what?");
				}
				else {
					if (second == "HAZMAT" && third == "SUIT" && hazequipped == false && hazmat == true) {
						this.sound.play('suit',0.6*volume);
						hazequipped = true;
						this.textFeed("You put on the suit.");
						inventory.splice(inventory.indexOf('Hazmat Suit'),1);
					}
					else if (second == "SUIT" && hazequipped == false && hazmat == true) {
						this.sound.play('suit',0.6*volume);
						hazequipped = true;
						this.textFeed("You put on the suit.");
						inventory.splice(inventory.indexOf('Hazmat Suit'),1);
					}
					else if (second == "HAZMATSUIT" && hazequipped == false && hazmat == true) {
						this.sound.play('suit',0.6*volume);
						hazequipped = true;
						this.textFeed("You put on the suit.");
						inventory.splice(inventory.indexOf('Hazmat Suit'),1);
					}
					else if (second == "HAZMAT" && third == "SUIT" && hazequipped == true) {
						this.textFeed("You have the suit equipped already.");
					}
					else if (second == "SUIT" && hazequipped == true) {
						this.textFeed("You have the suit equipped already.");
					}
					else if (second == "HAZMATSUIT" && hazequipped == true) {
						this.textFeed("You have the suit equipped already.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//OPEN: open containers
			else if(first == "OPEN") {
				if (command == "OPEN") {
					this.textFeed("Open what?");
				}
				else {
					if (room == 1 && second == "DOOR") {
						this.textFeed("The door won't open.");
					}
					else if (room == 1 && second == "DOORS") {
						this.textFeed("The door won't open.");
					}
					else if (room == 1 && second == "ELEVATOR") {
						this.textFeed("Pressing the elevator button does not open it.");
					}
					else if (room == 4 && second == "MAILBOX" && mail == false) {
						this.sound.play('open',0.8*volume);
						this.textFeed("You open the mailbox. Inside you see a small note.");
						mail = true;
					}
					else if (room == 4 && second == "MAILBOX" && mail == true) {
						this.textFeed("The mailbox is already open.");
					}
					else if (room == 4 && second == "MAIL" && third == "BOX" && mail == false) {
						this.sound.play('open',0.8*volume);
						this.textFeed("You open the mailbox. Inside you see a small note.");
						mail = true;
					}
					else if (room == 4 && second == "MAIL" && third == "BOX" && mail == true) {
						this.textFeed("The mailbox is already open.");
					}
					else if (room == 4 && second == "MAIL" && mail == false) {
						this.sound.play('open',0.8*volume);
						this.textFeed("You open the mailbox. Inside you see a small note.");
						mail = true;
					}
					else if (room == 4 && second == "MAIL" && mail == true) {
						this.textFeed("The mailbox is already open.");
					}
					else if (room == 6 && second == "LOCKER" && third == "WITH" && fourth == "KEY" && lock == false && key == true) {
						lock = true;
						this.textFeed("Using the key you unlock the locker.");
					}
					else if (room == 6 && second == "LOCKER" && third == "WITH" && fourth == "KEY" && lock == true) {
						this.textFeed("You already unlocked the locker.");
					}
					else if (room == 6 && second == "LOCKER" && lock == false) {
						this.textFeed("The locker requires a key to be opened.");
					}
					else if (room == 6 && second == "LOCKER" && lock == true && locker == false) {
						this.sound.play('open',0.8*volume);
						locker = true;
						this.textFeed("The locker contains a switch labeled 'ELEVATOR'.");
					}
					else if (room == 6 && second == "LOCKER" && locker == true) {
						this.textFeed("The locker is already open.");
					}
					else if (room == 9 && second == "VENT" && vent == true) {
						this.textFeed("The vent is already open.");
					}
					else if (room == 9 && command == "OPEN VENT" && vent == false) {
						this.textFeed("You can not open the vents with your hands. Try using a tool.");
					}
					else if (room == 9 && second == "VENT" && third == "WITH" && fourth == "SCREWDRIVER" && vent == false && screwdriver == true) {
						this.sound.play('lever',1.2*volume);
						vent = true;
						this.textFeed("Using the screwdriver you remove the vent cover.");
					}
					else if (room == 9 && second == "VENT" && third == "WITH" && fourth == "SCREWDRIVER" && vent == true) {
						this.textFeed("You already removed the vent cover.");
					}
					else if (room == 10 && second == "BOX") {
						this.textFeed("The box is too sturdy.");
					}
					else if (room == 10 && second == "TRAPDOOR" && box == true && trapdoor == false) {
						this.sound.play('open',0.8*volume);
						trapdoor = true;
						this.textFeed("You open the trapdoor. The small space contains a screwdriver.");
					}
					else if (room == 10 && second == "TRAP" && third == "DOOR" && box == true && trapdoor == false) {
						this.sound.play('open',0.8*volume);
						trapdoor = true;
						this.textFeed("You open the trapdoor. The small space contains a screwdriver.");
					}
					else if (room == 10 && second == "TRAPDOOR" && box == true && trapdoor == true) {
						this.textFeed("The trapdoor is already open.");
					}
					else if (room == 10 && second == "TRAP" && third == "DOOR" && box == true && trapdoor == true) {
						this.textFeed("The trapdoor is already open.");
					}
					else if (room == 15 && second == "CHEST" && chest == false) {
						this.sound.play('open',0.8*volume);
						chest = true;
						this.textFeed("You open the chest. Inside there is a flashlight.");
					}
					else if (room == 15 && second == "CHEST" && chest == true) {
						this.textFeed("The chest is already open.");
					}
					else if (second == "CLOCK" && clock == true) {
						this.textFeed("The clock has no battery cover.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}
			
			//GET:TAKE:GRAB:PICK UP: take items laying on the floor or in containers and put in inventory
			else if(first == "GET" || first == "TAKE" || first == "GRAB" || first+" "+second == "PICK UP") {
				if (command == "GET") {
					this.textFeed("Get what?");
				}
				else if (command == "TAKE") {
					this.textFeed("Take what?");
				}
				else if (command == "GRAB") {
					this.textFeed("Grab what?");
				}
				else if (command == "PICK UP") {
					this.textFeed("Pick up what?");
				}
				else {
					if (first == "PICK") {
						first = first+" "+second;
						second = third;
						third = fourth;
					}
					if (room == 2 && second == "DOCUMENT") {
						this.textFeed("I am not going to take useless documents with me.");
					}
					else if (room == 2 && second == "DOCUMENTS") {
						this.textFeed("I am not going to take useless documents with me.");
					}
					else if (room == 2 && second == "COMPUTER") {
						this.textFeed("The device is too heavy to comfortably take with you.");
					}
					else if (room == 3 && second == "BENCH") {
						this.textFeed("It is too heavy to take with me.")
					}
					else if (room == 3 && second == "WALNUT" && third == "TREE") {
						this.textFeed("As if I could put a very heavy tree in my pocket. Think man!");
					}
					else if (room == 3 && second == "TREE") {
						this.textFeed("As if I could put a very heavy tree in my pocket. Think man!");
					}
					else if (room == 4 && second == "TABLE") {
						this.textFeed("It is too heavy.")
					}
					else if (room == 4 && second == "NOTE" && mail == true && note == false) {
						this.sound.play('item',1.5*volume);
						note = true;
						this.textFeed("Taken.");
						inventory.push("Note");
					}
					else if (room == 4 && second == "LETTER" && mail == true && note == false) {
						this.sound.play('item',1.5*volume);
						note = true;
						this.textFeed("Taken.");
						inventory.push("Note");
					}
					else if (room == 4 && second == "NOTE" && mail == true && note == true) {
						this.textFeed("You already took the note from the mailbox.");
					}
					else if (room == 4 && second == "LETTER" && mail == true && note == true) {
						this.textFeed("You already took the note from the mailbox.");
					}
					else if (room == 5 && second == "BIRD"  && third == "NEST") {
						this.textFeed("Ehh. No. Disgusting.");
					}
					else if (room == 5 && second == "BIRDNEST") {
						this.textFeed("Ehh. No. Disgusting.");
					}
					else if (room == 5 && second == "NEST") {
						this.textFeed("Ehh. No. Disgusting.");
					}
					else if (room == 5 && second == "KEY" && nest == true && key == false) {
						this.sound.play('item',1.5*volume);
						key = true;
						this.textFeed("Taken.")
						inventory.push("Key");
					}
					else if (room == 5 && second == "KEY" && nest == true && key == true) {
						this.textFeed("You already took the key from the nest.");
					}
					else if (room == 10 && second == "BOX") {
						this.textFeed("The box is too big.");
					}
					else if (room == 10 && second == "SCREWDRIVER" && trapdoor == true && screwdriver == false) {
						this.sound.play('item',1.5*volume);
						screwdriver = true;
						this.textFeed("Taken.");
						inventory.push("Screwdriver");
					}
					else if (room == 10 && second == "SCREWDRIVER" && trapdoor == true && screwdriver == true) {
						this.textFeed("You already took the screwdriver.");
					}
					else if (room == 13 && second == "HAMMER" && hammer == false) {
						this.sound.play('item',1.5*volume);
						hammer = true;
						this.textFeed("Taken.");
						inventory.push("Hammer");
					}
					else if (room == 13 && second == "HAMMER" && hammer == true) {
						this.textFeed("You already took the hammer.");
					}
					else if (room == 15 && second == "FLASHLIGHT" && flashlight == false && chest == true) {
						this.sound.play('item',1.5*volume);
						flashlight = true;
						this.textFeed("Taken.");
						inventory.push("Flashlight");
					}
					else if (room == 15 && second == "FLASH" && third == "LIGHT" && flashlight == false && chest == true) {
						this.sound.play('item',1.5*volume);
						flashlight = true;
						this.textFeed("Taken.");
						inventory.push("Flashlight");
					}
					else if (room == 15 && second == "FLASHLIGHT" && flashlight == true) {
						this.textFeed("You already took the flashlight.");
					}
					else if (room == 15 && second == "FLASH" && third == "LIGHT" && flashlight == true) {
						this.textFeed("You already took the flashlight.");
					}
					else if (room == 15 && second == "CLOCK" && clock == false) {
						this.sound.play('item',1.5*volume);
						clock = true;
						this.textFeed("Taken.");
						inventory.push("Clock");
					}
					else if (room == 13 && second == "CLOCK" && clock == true) {
						this.textFeed("You already took the clock.");
					}
					else if (command == "GET BATTERY" && battaken == false && clock == true) {
						this.textFeed("Get battery from what?");
					}
					else if (command == first+" BATTERY FROM CLOCK" && battaken == false && clock == true) {
						this.sound.play('item',1.5*volume);
						battaken = true;
						battery = true;
						inventory.push("Battery");
						this.textFeed("You took the battery from the clock. It stops ticking.");
					}
					else if (command == "GET BATTERY FROM CLOCK" && battaken == true && clock == true) {
						this.textFeed("You already took the battery from the clock.");
					}
					else if (room == 16 && second == "HAZMAT" && glassshatter == false) {
						this.textFeed("I can not get the item through the glass.");
					}
					else if (room == 16 && second == "SUIT" && glassshatter == false) {
						this.textFeed("I can not get the item through the glass.");
					}
					else if (room == 16 && second == "HAZMAT" && third == "SUIT" && glassshatter == false) {
						this.textFeed("I can not get the item through the glass.");
					}
					else if (room == 16 && second == "HAZMAT" && glassshatter == true && hazmat == false) {
						this.sound.play('item',1.5*volume);
						hazmat = true;
						this.textFeed("Taken.");
						inventory.push("Hazmat Suit");
					}
					else if (room == 16 && second == "SUIT" && glassshatter == true && hazmat == false) {
						this.sound.play('item',1.5*volume);
						hazmat = true;
						this.textFeed("Taken.");
						inventory.push("Hazmat Suit");
					}
					else if (room == 16 && second == "HAZMAT" && third == "SUIT" && glassshatter == true && hazmat == false) {
						this.sound.play('item',1.5*volume);
						hazmat = true;
						this.textFeed("Taken.");
						inventory.push("Hazmat Suit");
					}
					else if (room == 16 && second == "HAZMAT" && hazmat == true) {
						this.textFeed("You already took the suit.");
					}
					else if (room == 16 && second == "SUIT" && hazmat == true) {
						this.textFeed("You already took the suit.");
					}
					else if (room == 16 && second == "HAZMAT" && third == "SUIT" && hazmat == true) {
						this.textFeed("You already took the suit.");
					}
					else if (room == 17 && second == "ROPE" && rope == false) {
						this.sound.play('item',1.5*volume);
						rope = true;
						this.textFeed("Taken.");
						inventory.push("Rope");
					}
					else if (room == 17 && second == "C4" && c4 == false) {
						this.sound.play('item',1.5*volume);
						c4 = true;
						this.textFeed("Taken.");
						inventory.push("C4");
					}
					else if (room == 17 && second == "C4" && third == "CHARGE" && c4 == false) {
						this.sound.play('item',1.5*volume);
						c4 = true;
						this.textFeed("Taken.");
						inventory.push("C4");
					}
					else if (room == 17 && second == "ROPE" && rope == true) {
						this.textFeed("You already took the rope.");
					}
					else if (room == 17 && second == "C4" && c4 == true) {
						this.textFeed("You already took the C4 charge.");
					}
					else if (room == 17 && second == "C4" && third == "CHARGE" && c4 == true) {
						this.textFeed("You already took the C4 charge.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//PUSH:MOVE: replace objects (only used once, but there are dialogs)
			else if (first == "PUSH" || first == "MOVE") {
				if (command == "PUSH") {
					this.textFeed("Push what?");
				}
				else if (command == "MOVE") {
					this.textFeed("Move what?");
				}
				else {
					if (room == 1 && second == "DOOR") {
						this.textFeed("Nice try, but that doesn't work.");
					}
					else if (room == 1 && second == "DOORS") {
						this.textFeed("Nice try, but that doesn't work.");
					}
					else if (room == 2 && second == "COMPUTER") {
						this.textFeed("Do you want it to fall and break?");
					}
					else if (room == 3 && second == "BENCH") {
						this.textFeed("You moved the bench and ... nothing happened.");
					}
					else if (room == 3 && second == "TREE") {
						this.textFeed("Unless you are superman this is not going to work.");
					}
					else if (room == 3 && second == "WALNUT" && third == "TREE") {
						this.textFeed("Unless you are superman this is not going to work.");
					}
					else if (room == 4 && second == "TABLE") {
						this.textFeed("The table is too heavy to push.");
					}
					else if (room == 6 && second == "LEVER" && locker == true && elevator == false) {
						elevator = true;
						this.sound.play('lever',1.2*volume);
						this.textFeed("When you hit the lever you hear an elevator door open.");
					}
					else if (room == 6 && second == "SWITCH" && locker == true && elevator == false) {
						elevator = true;
						this.sound.play('lever',1.2*volume);
						this.textFeed("When you hit the lever you hear an elevator door open.");
					}
					else if (room == 6 && second == "LEVER" && locker == true && elevator == true) {
						this.textFeed("The lever is already enabled.");
					}
					else if (room == 6 && second == "SWITCH" && locker == true && elevator == true) {
						this.textFeed("The lever is already enabled.");
					}
					else if (room == 10 && second == "BOX" && box == false) {
						this.sound.play('move',0.9*volume);
						box = true;
						this.textFeed("You push the box aside. It reveals a trap door.");
					}
					else if (room == 10 && second == "BOX" && box == true) {
						this.textFeed("You already pushed the box aside. It revealed a trap door.");
					}
					else if (room == 13 && second == "RUBBLE") {
						this.textFeed("It is too heavy.");
					}
					else if (room == 13 && second == "STONE") {
						this.textFeed("It is too heavy.");
					}
					else if (room == 13 && second == "STONES") {
						this.textFeed("It is too heavy.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//CLIMB: climb to a higher area
			else if(first == "CLIMB") {
				if (command == "CLIMB") {
					this.textFeed("Climb what?");
				}
				else {
					if (room == 3 && second == "TREE") {
						room = 5;
						this.roomLore(room);
					}
					else if (room == 3 && second == "WALNUT" && third == "TREE") {
						room = 5;
						this.roomLore(room);
					}
					else if (room == 3 && second == "FENCE") {
						this.textFeed("The fences are too high to climb.");
					}
					else if (room == 3 && second == "FENCES") {
						this.textFeed("The fences are too high to climb.");
					}
					else if (room == 5 && command == "CLIMB DOWN") {
						room = 3;
						this.roomLore(room);
					}
					else if (room == 12 && command == "CLIMB DOWN") {
						room = 13;
						this.roomLore(room);
					}
					else if (room == 13 && command == "CLIMB UP") {
						this.textFeed("Without any tools I will not manage to do that.");
					}
					else if (room == 13 && command == "CLIMB ROPE" && ropehook == true) {
						room = 12;
						this.roomLore(room);
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//USE: use items or use items on an other game element
			else if (first == "USE") {
				if (command == "USE") {
					this.textFeed("Use what?");
				}
				else {
					if (command == "USE C4" && c4 == true) {
						this.textFeed("Use C4 on what?");
					}
					else if (command == "USE C4" && third == "CHARGE" && c4 == true) {
						this.textFeed("Use C4 on what?");
					}
					else if (second == "HAZMAT" && third == "SUIT" && hazequipped == false && hazmat == true) {
						this.sound.play('suit',0.6*volume);
						hazequipped = true;
						this.textFeed("You put on the suit.");
						inventory.splice(inventory.indexOf('Hazmat Suit'),1);
					}
					else if (second == "SUIT" && hazequipped == false && hazmat == true) {
						this.sound.play('suit',0.6*volume);
						hazequipped = true;
						this.textFeed("You put on the suit.");
						inventory.splice(inventory.indexOf('Hazmat Suit'),1);
					}
					else if (second == "HAZMATSUIT" && hazequipped == false && hazmat == true) {
						this.sound.play('suit',0.6*volume);
						hazequipped = true;
						this.textFeed("You put on the suit.");
						inventory.splice(inventory.indexOf('Hazmat Suit'),1);
					}
					else if (second == "HAZMAT" && third == "SUIT" && hazequipped == true) {
						this.textFeed("You have the suit equipped already.");
					}
					else if (second == "SUIT" && hazequipped == true) {
						this.textFeed("You have the suit equipped already.");
					}
					else if (second == "HAZMATSUIT" && hazequipped == true) {
						this.textFeed("You have the suit equipped already.");
					}
					else if (room == 1 && command == "USE C4 ON DOOR" && c4 == true && end == false) {
						this.sound.play('explosion',0.8*volume);
						end = true;
						this.textFeed("You blast open the door!");
						inventory.splice(inventory.indexOf('C4'),1);
					}
					else if (room == 1 && command == "USE C4 CHARGE ON DOOR" && c4 == true && end == false) {
						this.sound.play('explosion',0.8*volume);
						end = true;
						this.textFeed("You blast open the door!");
						inventory.splice(inventory.indexOf('C4'),1);
					}
					else if (room == 1 && second == "DOOR") {
						if (end == true) {
							this.textFeed("You managed to escape!");
						}
						else {
							this.textFeed("You will never be able to open this with your hands.");
						}
					}
					else if (room == 1 && second == "DOORS") {
						if (end == true) {
							this.textFeed("You managed to escape!");
						}
						else {
							this.textFeed("You will never be able to open this with your hands.");
						}
					}
					else if (room == 2 && second == "COMPUTER" && computer == true && passwrd == false) {
						this.textFeed("The computer requires a password to be unlocked. ENTER PASSWORD:");
					}
					else if (room == 2 && second == "COMPUTER" && computer == true && passwrd == true) {
						this.textFeed("You scan  the computer  for any useful  files. There  is one  file");
						this.textFeed("containing the following information: 'Do not forget: 65345'.");
					}
					else if (room == 2 && second == "COMPUTER" && computer == false) {
						this.textFeed("The computer is not running.");
					}
					else if (command == "USE KEY" && key == true) {
						this.textFeed("Use key on what?");
					}
					else if (room == 6 && command == "USE KEY ON LOCKER" && lock == false && key == true) {
						lock = true;
						this.textFeed("Using the key you unlock the locker.");
					}
					else if (room == 6 && command == "USE KEY ON LOCKER" && lock == true) {
						this.textFeed("You already unlocked the locker.");
					}
					else if (room == 6 && second == "LEVER" && locker == true && elevator == false) {
						elevator = true;
						this.sound.play('lever',1.2*volume);
						this.textFeed("When you hit the lever you hear an elevator door open.");
					}
					else if (room == 6 && second == "SWITCH" && locker == true && elevator == false) {
						elevator = true;
						this.sound.play('lever',1.2*volume);
						this.textFeed("When you hit the lever you hear an elevator door open.");
					}
					else if (room == 6 && second == "LEVER" && locker == true && elevator == true) {
						this.textFeed("The lever is already enabled.");
					}
					else if (room == 6 && second == "SWITCH" && locker == true && elevator == true) {
						this.textFeed("The lever is already enabled.");
					}
					else if (command == "SCREWDRIVER" && screwdriver == true) {
						this.textFeed("Use screwdriver on what?");
					}
					else if (room == 9 && command == "USE SCREWDRIVER ON VENT" && vent == false && screwdriver == true) {
						this.sound.play('lever',1.2*volume);
						vent = true;
						this.textFeed("Using the screwdriver you remove the vent cover.");
					}
					else if (room == 9 && command == "USE SCREWDRIVER ON VENT" && vent == true) {
						this.textFeed("You already removed the vent cover.");
					}
					else if (room == 9 && second == "KEYPAD" && keypad == false) {
						this.textFeed("You try to unlock the door. ENTER KEYCODE: ");
					}
					else if (room == 9 && second == "KEYPAD" && keypad == true) {
						this.textFeed("You already unlocked the door.");
					}
					else if (room == 15 && second == "BUTTON") {
						this.textFeed("Do not press that button!");
					}
					else if (command == "USE HAMMER" && hammer == true) {
						this.textFeed("Use HAMMER on what?");
					}
					else if (room == 16 && second == "HAMMER" && third == "ON" && fourth == "GLASS" && glassshatter == true) {
						this.textFeed("The glass already broke.");
					}
					else if (room == 16 && second == "HAMMER" && third == "ON" && fourth == "GLASS" && glassshatter == false) {
						this.sound.play('shatter',0.8*volume);
						glassshatter = true;
						this.textFeed("With a good hit you break the glass.");
					}
					else if (second == "FLASHLIGHT" && flashlight == true && powered == true) {
						this.textFeed("I am already using it!");
					}
					else if (second == "FLASHLIGHT" && flashlight == true && powered == false) {
						this.textFeed("How? It is not on.");
					}
					else if (second == "FLASH" && third == "LIGHT" && flashlight == true && powered == true) {
						this.textFeed("I am already using it!");
					}
					else if (second == "FLASH" && third == "LIGHT" && flashlight == true && powered == false) {
						this.textFeed("How? It is not on.");
					}
					else if (room == 13 && second == "ROPE" && rope == true && ropehook == false) {
						ropehook = true;
						this.textFeed("You attach the rope so you can climb it.");
						inventory.splice(inventory.indexOf('Rope'),1);
					}
					else if (room == 13 && second == "ROPE" && rope == true && ropehook == true) {
						this.textFeed("You already attached the rope.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//ATTACH: exclusive command to use the rope
			else if (first == "ATTACH") {
				if (command == "ATTACH") {
					this.textFeed("Attach what?");
				}
				else {
					if (room == 13 && second == "ROPE" && rope == true && ropehook == false) {
						ropehook = true;
						this.textFeed("You attach the rope so you can climb it.");
						inventory.splice(inventory.indexOf('Rope'),1);
					}
					else if (room == 13 && second == "ROPE" && rope == true && ropehook == true) {
						this.textFeed("You already attached the rope.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//PRESS:HIT: special use commands for the keypad and lever
			else if (first == "PRESS" || first == "HIT") {
				if (command == "PRESS") {
					this.textFeed("Press what?");
				}
				else if (command == "HIT") {
					this.textFeed("Hit what?");
				}
				else {
					if (room == 6 && second == "LEVER" && locker == true && elevator == false) {
						elevator = true;
						this.sound.play('lever',1.2*volume);
						this.textFeed("When you hit the lever you hear an elevator door open.");
					}
					else if (room == 6 && second == "SWITCH" && locker == true && elevator == false) {
						elevator = true;
						this.sound.play('lever',1.2*volume);
						this.textFeed("When you hit the lever you hear an elevator door open.");
					}
					else if (room == 6 && second == "LEVER" && locker == true && elevator == true) {
						this.textFeed("The lever is already enabled.");
					}
					else if (room == 6 && second == "SWITCH" && locker == true && elevator == true) {
						this.textFeed("The lever is already enabled.");
					}
					else if (room == 9 && second == "KEYPAD" && keypad == false) {
						this.textFeed("You try to unlock the door. ENTER KEYCODE: ");
					}
					else if (room == 9 && second == "KEYPAD" && keypad == true) {
						this.textFeed("You already unlocked the door.");
					}
					else if (room == 15 && second == "BUTTON") {
						this.textFeed("Do not press that button!");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}

			//ELEVATOR: regulates the floors in the elevator
			else if (command == "FLOOR" && room >= 7 && room <= 8) {
				this.textFeed("You did not specify a floor.");
			}
			else if (first == "FLOOR" && room == 7) {
				if (second == "1") {
					this.textFeed("You are already on floor 1.");
				}
				else if (second == "2") {
					this.sound.play('elevator',0.8*volume);
					room = 8;
					this.roomLore(room);
				}
				else {
					this.textFeed("This floor does not exist.");
				}
			}
			else if (first == "FLOOR" && room == 8) {
				if (second == "2") {
					this.textFeed("You are already on floor 2.");
				}
				else if (second == "1") {
					this.sound.play('elevator',0.8*volume);
					room = 7;
					this.roomLore(room);
				}
				else {
					this.textFeed("This floor does not exist.");
				}
			}

			//COMPUTER PASSWORD - passed
			else if (command == "U235" && buffer[buffer.length-3].indexOf("PASSWORD") != -1 && passwrd == false) {
				passwrd = true;
				this.textFeed("You scan  the computer  for any useful  files. There  is one  file");
				this.textFeed("containing the following information: 'Do not forget - 65345'.");
			}
			//KEYPAD - passed
			else if (command == "65345" && buffer[buffer.length-3].indexOf("KEYCODE") != -1 && keypad == false) {
				keypad = true;
				this.textFeed("It worked! The door opens.");
			}

			//INVENTORY:SHOW INVENTORY: lists all taken items, one time use items are not shown after use
			else if (command == "SHOW INVENTORY" || command == "INVENTORY" || command == "WHAT DO I HAVE" || command == "WHAT DID I TAKE") {
				if (inventory.length > 0) {
					this.textFeed("You carry: "+inventory);
				}
				else {
					this.textFeed("You carry: None");
				}
			}

			//JUMP: dialog over climb down, no effects
			else if (room == 5 && command == "JUMP DOWN") {
				this.textFeed("You might want to use a more subtle way to get down.");
			}
			else if (room == 5 && command == "JUMP") {
				this.textFeed("You might want to use a more subtle way to get down.");
			}
			else if (room == 12 && command == "JUMP DOWN") {
				this.textFeed("You might want to use a more subtle way to get down.");
			}
			else if (room == 12 && command == "JUMP") {
				this.textFeed("You might want to use a more subtle way to get down.");
			}

			//BREAK:SHATTER:DESTROY: for the glass event for the suit
			else if (first == "BREAK" || first == "SHATTER" || first == "DESTROY") {
				if (command == "BREAK") {
					this.textFeed("Break what?");
				}
				else if (command == "SHATTER") {
					this.textFeed("Shatter what?");
				}
				else if (command == "DESTROY") {
					this.textFeed("Destroy what?");
				}
				else if (command == first+"WITH HAMMER") {
					this.textFeed("Break what with hammer?");
				}
				else {
					if (room == 16 && command == first+" GLASS" && glassshatter == false) {
						this.textFeed("No way I am going to do that with my bare hands.");
					}
					else if (room == 16 && command == first+" GLASS" && glassshatter == true) {
						this.textFeed("The glass already broke.");
					}
					else if (room == 16 && command == first+ " GLASS CASING WITH HAMMER" && hammer == true && glassshatter == false) {
						this.sound.play('shatter',0.8*volume);
						glassshatter = true;
						this.textFeed("With a good hit you break the glass.");
					}
					else if (room == 16 && command == first+ " GLASS CASE WITH HAMMER" && hammer == true && glassshatter == false) {
						this.sound.play('shatter',0.8*volume);
						glassshatter = true;
						this.textFeed("With a good hit you break the glass.");
					}
					else if (room == 16 && command == first+ " GLASS WITH HAMMER" && hammer == true && glassshatter == false) {
						this.sound.play('shatter',0.8*volume);
						glassshatter = true;
						this.textFeed("With a good hit you break the glass.");
					}
					else if (room == 16 && command == first+ " GLASS CASING WITH HAMMER" && hammer == true && glassshatter == true) {
						this.textFeed("You already broke the glass.");
					}
					else if (room == 16 && command == first+ " GLASS CASE WITH HAMMER" && hammer == true && glassshatter == true) {
						this.textFeed("You already broke the glass.");
					}
					else if (room == 16 && command == first+ " GLASS WITH HAMMER" && hammer == true && glassshatter == true) {
						this.textFeed("You already broke the glass.");
					}
					else {
						this.textFeed("I only understood as far as '"+first+"'.");
					}
				}
			}
			
			//BLOW UP: special command for the C4 charge
			else if (room == 1 && command == "BLOW UP DOOR WITH C4" && c4 == true && end == false) {
				this.sound.play('explosion',0.8*volume);
				end = true;
				this.textFeed("You blast open the door!");
				inventory.splice(inventory.indexOf('C4'),1);
			}
			else if (room == 1 && command == "BLOW UP DOOR WITH C4 CHARGE" && c4 == true && end == false) {
				this.sound.play('explosion',0.8*volume);
				end = true;
				this.textFeed("You blast open the door!");
				inventory.splice(inventory.indexOf('C4'),1);
			}	

			//TURN OFF: is disabled as it does not add anything to the game rather than useless code
			else if (first == "TURN" && second == "OFF") {
				this.textFeed("There is no need to turn off anything.");
			}

			//Troll commands (no gameplay changes, just random/meme thingies)
			else if (command == "SCREAM") {
				this.textFeed("WAAAAA!");
			}
			else if (room == 1 && command == "BASH DOOR") {
				this.textFeed("You try hard, but it does not help.");
			}
			else if (room == 1 && command == "RAM DOOR") {
				this.textFeed("You try hard, but it does not help.");
			}
			else if (room == 1 && command == "KICK DOOR") {
				this.textFeed("You try hard, but it does not help.");
			}
			else if (command == "SING") {
				this.textFeed("Falalalalaaalalalalaaaaaa!");
			}
			else if (command == "EAT") {
				this.textFeed("OMNOMNOM! But wait, what can I actually eat here?");
			}
			else if (command == "RUN") {
				this.textFeed("You run, and run, and run, and ... slam your face into the wall.");
			}
			else if (command == "CALL PARENTS") {
				this.textFeed("The birth parents you are trying to reach do not love you.  Please");
				this.textFeed("hang up. Oh, that is sad.");
			}
			else if (command == "42") {
				this.textFeed("What is the meaning of life, the universe and everything?");
			}
			else if (command == "SHUTDOWN") {
				this.textFeed("Permission denied.");
			}
			else if (command == "SUDO SHUTDOWN") {
				this.textFeed("Dang, you got me. But you do not know the root password though!");
			}
			else if (command == "420") {
				this.textFeed("BLAZE IT!");
			}
			else if (command == "AND HIS NAME IS") {
				this.textFeed("JOHN CENA!");
			}
			else if (command == "MLG") {
				this.textFeed("I 360 noscope you scrub, get r3kt.");
			}
			else if (command == "RATE") {
				this.textFeed("I r8 gr8 8/8 m8.");
			}
			else if (command == "PING") {
				this.textFeed("PONG!");
			}
			else if (command == "LEAVE FACILITY" || command == "LEAVE BUILDING") {
				this.textFeed("It is not going to be that easy!");
			}
			else if (command == "HELLO" || command == "HI" || command == "HEY") {
				this.textFeed("Hey, how are you doing?");
			}
			else if (command == "SAY" || command == "TALK") {
				this.textFeed("People with a high IQ tend to talk to themselves more.");
			}
			else if (command == "SAY SOMETHING") {
				this.textFeed("What?");
			}
			else if (command == "LS") {
				this.textFeed("-rwxr-xr-x 1 root taggrin  24994 Feb 20  2016 howtotalktogirls");
				this.textFeed("-rwxr-xr-x 1 root taggrin   4096 May 12  2016 cheatcodes");
				this.textFeed("-rwxr-xr-x 1 root taggrin  74196 Nov 18  2015 bestselfie");
			}
			else if (command == "CAT HOWTOTALKTOGIRLS") {
				this.textFeed("One does not simply.");
			}
			else if (command == "CAT CHEATCODES") {
				this.textFeed("Press ALT+F4 to instant win!");
			}
			else if (command == "CAT BESTSELFIE") {
				this.textFeed("as/$5aAS5%ksSDsfG3ASlfasklr@%^*lADFlfasF:klfsalfkASxXv/cb./xFASRFA");
				this.textFeed("h34Fa$!6asv!@#f^gAsd/1234ASgv!d5dFh.35ASsda..%as/7234sSqQ623Sfyp%a");
			}
			else if (command == "PWD") {
				this.textFeed("www.taggrin.com/games/radiation.html");
			}
			else if (command == "YOU SHALL NOT") {
				this.textFeed("PASSSSSSSSSSS!");
			}
			else if (command == "CP1987") {
				this.textFeed("*Mumbles something about being retarded*");
			}
			else if (command == "WHAT AM I") {
				this.textFeed("I honestly have no idea.")
			}
			else if (command == "HOW DO YOU TURN THIS ON") {
				this.textFeed("WOLOLO!");
			}
			//Unknown commands are filtered.
			else {
				this.textFeed("I do not recognize that command.");
			}
		}
	},
	
	roomLore: function(number) {
		//Show room text, some may change after specific events (mainly item pickup)
		//-----------------|                                                                |
		if (number == 1) {
			this.textFeed("[FOYER]");
			this.textFeed("The main entrance  hall of the  building. To  the north  and south");
			this.textFeed("you see doors.  To the west are the  shut doors you  used to enter");
			this.textFeed("the building. You also spot an elevator to the east.");
		}
		else if (number == 2) {
			this.textFeed("[OFFICE]");
			this.textFeed("This is  where all the  paperwork got done.  None of the documents");
			this.textFeed("around contain  useful information.  The very old  computer on the");
			this.textFeed("desk indicates this place  hasn't been used for at least 20 years.");
			this.textFeed("To the north  there is a door  with a window  which seems  to lead");
			this.textFeed("outside into a courtyard. To the east and south there are doors.");
		}
		else if (number == 3) {
			this.textFeed("[COURTYARD]");
			this.textFeed("You made  it  outside. Unfortunately  this place has fences around");
			this.textFeed("which  are too high  to climb. In the  courtyard there is a walnut");
			this.textFeed("tree and some benches, indicating this place was used for lunch on");
			this.textFeed("sunny days. To the south is the door going back inside.");
		}
		else if (number == 4) {
			this.textFeed("[LUNCHROOM]");
			this.textFeed("This messy room contains a huge table and a lot of chairs.  On the");
			this.textFeed("wall  hangs a  bulletin board with  holiday cards  and invitations");
			this.textFeed("to parties. There also is a mailbox. To the west is a door.");
		}
		else if (number == 5) {
			this.textFeed("[TOP OF WALNUT TREE]");
			this.textFeed("Pfft. That was quite an exercise to get up here. It looks like you");
			this.textFeed("were not the first to be here as you can spot a bird nest.");
		}
		else if (number == 6) {
			this.textFeed("[JANITOR'S OFFICE]");
			this.textFeed("This is the biggest mess so far. It looks like the janitor was not");
			this.textFeed("one of the busiest types  of persons. You see a locker  hanging on");
			this.textFeed("the wall. To the north there is a door.");
		}
		else if (number == 7) {
			this.textFeed("[ELEVATOR - FLOOR 1]");
			this.textFeed("This elevator did not have any maintenance for a long time, but it");
			this.textFeed("seems to be  in working condition.  The elevator doors  are to the");
			this.textFeed("west. Which floor do you want to go?");
		}
		else if (number == 8) {
			this.textFeed("[ELEVATOR - FLOOR 2]");
			this.textFeed("This elevator did not have any maintenance for a long time, but it");
			this.textFeed("seems to be  in working condition.  The elevator doors  are to the");
			this.textFeed("east. Which floor do you want to go?");
		}
		else if (number == 9) {
			this.textFeed("[HALLWAY]");
			this.textFeed("The main walkway of the second floor. To the west is the elevator.");
			this.textFeed("To the east there is a door  which has some sort of  keypad. There");
			this.textFeed("also is a door to the south. To the north is a vent.");
		}
		else if (number == 10) {
			if (box == false) {
				this.textFeed("[STORAGE]");
				this.textFeed("This  small room  is empty  except for a  medium-sized box  in the");
				this.textFeed("center of the room. To the north is a door.");
			}
			else if (box == true && trapdoor == false) {
				this.textFeed("[STORAGE]");
				this.textFeed("This  small room  is empty  except for a  medium-sized box  pushed");
				this.textFeed("to the side revealing a trap door. To the north is a door.");
			}
			else if (trapdoor == true && screwdriver == false) {
				this.textFeed("[STORAGE]");
				this.textFeed("This  small room  is empty  except for a  medium-sized box  pushed");
				this.textFeed("to the side revealing a trap door.  Inside the revealed space is a");
				this.textFeed("screwdriver. To the north is a door.");
			}
			else if (trapdoor == true && screwdriver == true) {
				this.textFeed("[STORAGE]");
				this.textFeed("This  small room  is empty  except for a  medium-sized box  pushed");
				this.textFeed("to the side revealing a trap door. To the north is a door.");
			}
		}
		else if (number == 11) {
			this.textFeed("[HIDDEN ROOM]");
			this.textFeed("Through the vent you enter a small  room with only a window and no");
			this.textFeed("doors. It seems  like not a lot  of people  knew about this place.");
			this.textFeed("A message is written on the wall.");
		}
		else if (number == 12) {
			this.textFeed("[HOLE IN THE FLOOR]");
			this.textFeed("This room  contains nothing but  a hole in the floor.  Without any");
			this.textFeed("tools you will not be able to get back up.");
		}
		else if (number == 13) {
			if (hammer == false) {
				this.textFeed("[CONNECTOR]");
				this.textFeed("This path was used to connect the main hall to the machines deeper");
				this.textFeed("in the building.  The door to  the west is been  blocked by  stone");
				this.textFeed("rubble. A hammer lays next to it. To the east there is a door.");
			}
			else if (hammer == true) {
				this.textFeed("[CONNECTOR]");
				this.textFeed("This path was used to connect the main hall to the machines deeper");
				this.textFeed("in the building.  The door to  the west is been  blocked by  stone");
				this.textFeed("rubble. To the east there is a door.");
			}
		}
		else if (number == 14) {
			this.textFeed("[T-SPLIT]");
			this.textFeed("This small area splits off in three directions. There is a door to");
			this.textFeed("the north and west.  To the east there is a door  with a radiation");
			this.textFeed("warning sign.");
		}
		else if (number == 15) {
			if (clock == false) {
				this.textFeed("[CONTROL ROOM]");
				this.textFeed("This is the brain of the facility.  There are a lot of buttons you");
				this.textFeed("better not press for the sake of safety. On the wall hangs a clock");
				this.textFeed("which surprisingly is still ticking.  There is also a chest in the");
				this.textFeed("room. To the  east there  are stairs going down,  but it is really");
				this.textFeed("dark there. To the south is a door.");
			}
			else if (clock == true) {
				this.textFeed("[CONTROL ROOM]");
				this.textFeed("This is the brain of the facility.  There are a lot of buttons you");
				this.textFeed("better not  press for the sake of safety. There is  a chest in the");
				this.textFeed("room. To the  east there  are stairs going down,  but it is really");
				this.textFeed("dark there. To the south is a door.");
			}
		}
		else if (number == 16) {
			if (glassshatter == false) {
				this.textFeed("[BASEMENT]");
				this.textFeed("It is  really  dark down  here. Your  flashlight shines on a glass");
				this.textFeed("casing containing a hazmat suit. To the west are stairs going back");
				this.textFeed("up to the first floor.");
			}
			else if (glassshatter == true) {
				this.textFeed("[BASEMENT]");
				this.textFeed("It is  really  dark down  here. Your flashlight shines on a broken");
				this.textFeed("glass casing. To the west are stairs going back up.");
			}
		}
		else if (number == 17) {
			if (rope == false && c4 == false) {
				this.textFeed("[REACTOR ROOM]");
				this.textFeed("In the reactor  room you see a C4 charge tied to the  railing with");
				this.textFeed("a rope. Looks like someone  tried to attack this station but never");
				this.textFeed("finished the job.");
			}
			else if (rope == false && c4 == true) {
				this.textFeed("[REACTOR ROOM]");
				this.textFeed("In the reactor room you see a rope on the floor.");
			}
			else if (rope == true && c4 == false) {
				this.textFeed("[REACTOR ROOM]");
				this.textFeed("In the reactor room you see a C4 charge on the floor.");
			}
			else if (rope == true && c4 == true) {
				this.textFeed("[REACTOR ROOM]");
				this.textFeed("The reactor room is empty. You better keep moving.");
			}
		}
	},
	
	textFeed: function (phrase) {
		//Add new line to text buffer
		buffer.shift();
		buffer.push(phrase);
	},
	
	toggleSound: function (mute,pointer) {
		//Toggle sound with mute button
		if (mute.frame == 0) {
			mute.frame = 1;
			this.sound.mute = true;
		}
		else if (mute.frame == 1) {
			mute.frame = 0;
			this.sound.mute = false;
		}
	},
};


}
/*
     FILE ARCHIVED ON 23:21:10 Aug 02, 2019 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 14:48:34 Nov 08, 2021.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 1185.145
  exclusion.robots: 0.117
  exclusion.robots.policy: 0.11
  RedisCDXSource: 473.812
  esindex: 0.015
  LoadShardBlock: 679.815 (3)
  PetaboxLoader3.datanode: 342.191 (4)
  CDXLines.iter: 27.488 (3)
  load_resource: 147.055
  PetaboxLoader3.resolve: 66.101
*/