# BORGA - BOaRd Games Application

> BORGA provides access, through a web interface, to some of the features provided by the [Board Game Atlas](https://www.boardgameatlas.com/) website, making use of its [Web API](https://www.boardgameatlas.com/api/docs) for this purpose.

> The link for the deployed application is [here](https://isel-ipw-2122-1-g03d2.herokuapp.com/).

<p align="center">
  <img align="center" width="500px" src="docs/gifs/popular-games.gif" alt="Popular Games Gif"/>
</p>

---

# Description

BORGA allows the user to perform the following operations:
  - Search board games by name
  - See details of a specific game
  - Gets the 20 most popular board games
  - Create and manage groups of games (requires login)

These operations can be performed via Web-UI (Website) or Web-API.

---

# Project Structure

The application modules dependencies are the following:

<p align="center">
  <img align="center" width="600px" src="docs/imgs/borga-modules.png" alt="Borga-Modules"/>
</p>

Modules description:

- <code>borga-launch.js</code> - launches the server application

- <code>borga-config.js</code> - contains the application configurations, such as database and guest user information

- <code>borga-server.js</code> - entry point to the server application

- <code>borga-web-site.js</code> - implementation of the web site

- <code>borga-web-api.js</code> - implementation of the HTTP routes that make up the REST API of the web application

- <code>borga-services.js</code> - implementation of the logic of each of the application's functionalities

- <code>board-games-data.js</code> - access to the Board Games Atlas API

- <code>borga-data-mem.js</code> - access to borga data (games, groups and users), stored in memory

- <code>borga-data-db.js</code> - access to borga data (games, groups and users), stored in an [ElasticSearch](https://www.elastic.co/elastic-stack/) database

- <code>borga-errors.js</code> - contains the applications errors list

The <code>borga-data-mem.js</code> and <code>borga-data-db.js</code> modules are at the same level and have similar implementations, so the server can choose which of the two the <code>borga-services.js</code> module uses.

---

# Operations

### Search Games

The user can search games by name, and manipulate the expected result by adding a limit of 
games to be searched and/or ordering the by name, rank or price.
This operations does not require login.

<p align="center">
  <img align="center" width="500px" src="docs/gifs/search-games.gif" alt="Search Games Gif"/>
</p>


### Popular Games

The user also can see the current twenty most popular games from Board Game ATLAS.
This operations does not require login.

<p align="center">
  <img align="center" width="500px" src="docs/gifs/popular-games.gif" alt="Popular Games Gif"/>
</p>


### Game Details

In all game operations it's possible to see the game details by pressing the "Details" button.

<p align="center">
  <img align="center" width="500px" src="docs/gifs/game-details.gif" alt="Game Details Gif"/>
</p>


### Register & Login

To create and manage groups, it's required to be logged in.
The user can register or do login in the following page:

<p align="center">
  <img align="center" width="500px" src="docs/imgs/borga-register-login.png" alt="Borga-Register-Login"/>
</p>


### Groups Creation & Manipulation

If the user is logged in, he can create, edit and delete personal groups of board games.

A group consists of a name, a description and a list of games.


**Create Group**

The user can create a group by passing a name and a description.
Multiple groups can have the same name.

<p align="center">
  <img align="center" width="500px" src="docs/gifs/create-group.gif" alt="Create Group Gif"/>
</p>


**Edit Group**

The user can edit a group by passing a new name and a new description.

<p align="center">
  <img align="center" width="500px" src="docs/gifs/edit-group.gif" alt="Edit Group Gif"/>
</p>


**Delete Group**

The user can delete a group, but once it's deleted there's no going back.

<p align="center">
  <img align="center" width="500px" src="docs/gifs/delete-group.gif" alt="Delete Group Gif"/>
</p>


**Add Games to Group**

The user can add multiple games to a group.

<p align="center">
  <img align="center" width="500px" src="docs/gifs/add-game-to-group.gif" alt="Add Game to Group Gif"/>
</p>


**Remove Games from Group**

The user can remove a game from a group.
A group can be empty.

<p align="center">
  <img align="center" width="500px" src="docs/gifs/remove-game-from-group.gif" alt="Remove Game from Group Gif"/>
</p>

---

# API Documentation

The Web API has the following paths/operations: 

- **GET** <code>/games/popular</code> - Gets the list of the most popular games.
- **GET** <code>/games/search</code> - Searches games by name.
- **GET** <code>/games/{gameId}</code> - Gets the game details.
- **POST** <code>/user</code> - Creates a new user.
- **POST** <code>/user/{userId}/groups</code> - Creates a group providing its name and description.
- **GET** <code>/user/{userId}/groups</code> - Lists all groups.
- **POST** <code>/user/{userId}/groups/{groupId}</code> - Edits a group by changing its name and description.
- **DELETE** <code>/user/{userId}/groups/{groupId}</code> - Deletes a group.
- **GET** <code>/user/{userId}/groups/{groupId}</code> - Gets the details of a group.
- **POST** <code>/user/{userId}/groups/{groupId}/games</code> - Adds a game to a group.
- **DELETE** <code>/user/{userId}/groups/{groupId}/games/{gameId}</code> - Removes a game from a group.

---

# Authors

 - [André Jesus](https://github.com/Andre-J3sus)
 - [Nyckollas Brandão](https://github.com/Nyckoka)
 - [André Santos](https://github.com/AndreSantos0)

**Professor:** Eng. João Trindade

ISEL<br>
Bachelor in Computer Science and Computer Engineering<br>
Introduction to Web Programming - LEIC32D - Group 03<br>
Winter Semester of 2021/2022