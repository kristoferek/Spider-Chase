# Spider Chase
### Project Six of Openclassrooms "Frontend" course

It is a simple **game** where two spiders walk on the square board consisting of empty fields, fields with weapon and fields with obstacles (they can't step on these).
Game was design with only one external library - jQuery.

[Spider Chase online](https://kristoferek.github.io/Spider-Chase/) - see how it works

## Game logic
Javascript code is organizad on following layers:
1. **Game.js** includes
  1. *Game* object - handles board initialization, players, weapons and actions like moving, range checking, battle
  2. *Player* object - stores and updates player position, weapon, range, power and health
  3. *Board* object - stores and updates board of empty fields, weapon, and obstacles
  3. *Weapon* object - stores and updates filed position, power
  4. *NextStep* object - stores and updates actual player possible movement path
2. **Display.js** includes
  1. *Display object* - responsible for displaying and hiding board, players and weapons by adding or removing css classes
  2. *Modal object* - displays and hides different type modal windows depending on game state
3. **Handle.js** includes
  1. Handle object - responsible for game logic and event loop as well as battle decision update
4. **App.js** initialize and strats the game

## Styling
Styling bases on css classes which are organized according to game objects or display functions.
* **board.css** - defines all classes for board, fields, obstacles
* **weapon.css** - defines classes for different weapons
* **player.css** - defines classes for player and animation for player actions - movement in different directions, staying, attacking, defending
* **modal.css** - defeines classes for modal window
* **title.css** - defeines classes for game title
* **information.css** - defines classes for information section aside the board
* **copyright.css** - defeines classes for copyrioght information

## Technological stack
I used small Toshiba laptop with:
* MS **Windows 10**
* **Atom** editor installed supported by **jslint** package.
* Browsers **Chrome, Opera, Firefox** with inspector

All elements were designed manualy, and then tested in online services, like:
* javascript - http://jshint.com/
* jQuery - http://jsfiddle.net
* css - http://pleeease.io/play/
* html - https://www.freeformatter.com/html-validator.html
No npm, bundlers etc.

## To do
* experiment with different backgrounds
* add social media support
* implement **websocket** for online playing experience
* make this game again with __React__ or/and __Canvas__
