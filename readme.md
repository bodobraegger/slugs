# Gender Equality in Computer Science: Video Games as Preparation for Future Learning

##  Bodo Braegger

## Master Thesis
---

Paste here the abstract of your thesis


---
The main coding product of this thesis is a client-side JavaScript game which uses the [Phaser 3.5 framework](https://phaser.io/). To run the game, either visit [beings.ga/me.html](https://beings.ga/me.html). 

Or you can clone this repository and run the `me.html` file in either Chrome, Brave or Firefox, no additional software is needed, although a basic local HTTP server that auto-refreshes can facilitate development, just run it in the project root. Example using the node package reload: `reload -b --start-page me.html` from the server root, then visit [localhost:8080](#) in your browser. 

The repository is structured as follows:
- The code for the game is in the `me.html` file in the folder root, and the `Source/slugs/` folder. The dependencies are included in the `Source/slugs/js/lib` folder for convenience. There are no executable or any other prerequirements. The code makes use of several worst-practises such as having global variables storing all game relevant objects are exposed to make it more inviting to 'hack' the game, and mixing functional and quasi object-oriented programming freely. Most of the game logic is in the `Source/slugs/js/Scene2.js`, `Source/slugs/js/slug.js`, `Source/slugs/js/snake.js` and `Source/slugs/js/terminal.js` files.
- The code for the online survey is written in the [oTree](https://www.otree.org/) python framework, and included in the folders `Source/survey/` (otree 5+), and `Source/survey_otree3port/` (otree 3.3.11). I included both because the oTree servers at ETH were not up to date and I realized this too late. To run this, please reference the online oTree documentation.
- The LaTeX code for the report pdf is in the `Documents/Report/latex` folder
- In general, all PDF files are in the Documents folder. 
