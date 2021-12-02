'use strict';


const errors = require('./borga-errors');
const crypto = require('crypto');


/**
 * Object that represents a map of all users: "userId": "userObj".
 * Example of an userObj : {
 * 		"name" : "Paulão",
 * 		"groups": {}
 * }
 * Contains 3 starting users.
 */
let users = {
	"A48280": createUserObj("André Jesus"),
	"A48287": createUserObj("Nyckollas Brandão"),
	"A48309": createUserObj("André Santos")
};

/**
 * Object that represents a map of all games: "gameId": "gameObj".
 */
const games = {};


/**
 * Object containing the association between user token and userId: "token": "userId".
 */
let tokens = {
	'4869fdf7-0e62-46a2-872c-f0dc60fc2c81': "A48280",
	'3e39bce8-07d1-4c05-9ee3-5587e6b8e2e7': "A48287",
	'5d389af1-06db-4401-8aef-36d8d6428f31': "A48309"
};


const numberOfPopularGames = 20;


/**
 * Gets the most popular games.
 * @returns an object containing the ids and names of the twenty most popular games
 */
function getPopularGames() {
	const gameOccurrences = {};

	for (const userId in users) {
		for (const groupName in getUser(userId).groups) {
			for (const gameName in getGroupFromUser(userId, groupName).games) {
				const currentCount = gameOccurrences[gameName];
				gameOccurrences[gameName] = currentCount ? currentCount + 1 : 1;
			}
		}
	}

	const sortedGames = Object.entries(gameOccurrences).sort(([, a], [, b]) => b - a).slice(0, numberOfPopularGames);
	const popularGames = Object.fromEntries(sortedGames.map(game => {[game[0], games[game[0]]]}));

	return popularGames;
}


// ------------------------- Users Functions -------------------------


/**
 * Creates a new user by its id and name.
 * @param {String} userId 
 * @param {String} userName 
 * @returns an object with the new user information
 * @throws ALREADY_EXISTS if the userId already exists
 */
function createNewUser(userId, userName) {
	if (users[userId]) throw errors.ALREADY_EXISTS({ userId });

	const token = crypto.randomUUID()
	tokens[token] = userId;

	users[userId] = createUserObj(userName);

	return { userId, token, userName }
}


// ------------------------- Groups Functions -------------------------


/**
 * Creates a new group of the user.
 * @param {String} userId 
 * @param {String} groupId 
 * @param {String} groupName 
 * @param {String} groupDescription 
 * @returns an object with the new group information
 * @throws ALREADY_EXISTS if the group already exists
 */
function createGroup(userId, groupId, groupName, groupDescription) {
	if (getUser(userId).groups[groupId]) throw errors.ALREADY_EXISTS({ groupId })
	return addGroupToUser(userId, groupId, createGroupObj(groupName, groupDescription));
}


/**
 * Edits a group by changing its name and description.
 * @param {String} userId 
 * @param {String} groupId
 * @param {String} newGroupName 
 * @param {String} newGroupDescription 
 * @returns an object with the edited group information
 */
function editGroup(userId, groupId, newGroupName, newGroupDescription) {
	const group = getGroupFromUser(userId, groupId);
	group.name = newGroupName;
	group.description = newGroupDescription;

	return { groupId, newGroupName, newGroupDescription };
}


/**
 * List all existing groups inside the user.
 * @param {String} userId 
 * @returns object containing all group objects
 */
function listUserGroups(userId) {
	return getUser(userId).groups;
}


/**
 * Deletes the group of the specified groupId.
 * @param {String} userId 
 * @param {String} groupId 
 * @returns an object with the deleted group information
 */
function deleteGroup(userId, groupId) {
	const group = getGroupFromUser(userId, groupId);
	delete getUser(userId).groups[groupId];
	return { groupId, groupName: group.name, groupDescription: group.description };
}


/**
 * Creates a new object containing the group details.
 * @param {Object} groupObj 
 * @returns an object containing the group details
 */
function getGroupDetails(groupObj) {
	return groupObj;
}


// ------------------------- Games Functions -------------------------


/**
 * Adds a new game to a group.
 * @param {String} userId 
 * @param {String} groupId 
 * @param {Object} gameObj
 * @return the added name
 */
function addGameToGroup(userId, groupId, gameObj) {
	const gameId = gameObj.id;
	games[gameId] = gameObj;
	getGroupFromUser(userId, groupId).games[gameId] = gameObj.name;
	return gameObj;
}


/**
 * Removes a game from a group providing its id.
 * @param {String} userId 
 * @param {String} groupId 
 * @param {String} gameId
 * @return the removed game 
 */
function removeGameFromGroup(userId, groupId, gameId) {
	const game = getGameFromGroup(userId, groupId, gameId);

	delete getGroupFromUser(userId, groupId).games[gameId];
	return game;
}


// ------------------------- Tokens -------------------------


/**
 * Return the userId associated with the provided token.
 * @param {String} token 
 * @returns the userId associated with the provided token
 */
function tokenToUserId(token) {
	return tokens[token];
}


// ------------------------- Utils -------------------------


/**
 * Creates a new user object providing its name.
 * @param {String} userName 
 * @returns the user object 
 */
function createUserObj(userName) {
	return {
		name: userName,
		groups: {}
	};
}


/**
 * Creates a new group providing its name and description.
 * @param {String} groupName 
 * @param {String} groupDescription 
 * @returns the group object 
 */
function createGroupObj(groupName, groupDescription) {
	return {
		name: groupName,
		description: groupDescription,
		games: {}
	};
}


/**
 * Adds a new group to the groups object list inside the user.
 * @param {String} userId
 * @param {String} groupId
 * @param {Object} groupObj 
 * @returns an object with the added group information
 */
function addGroupToUser(userId, groupId, groupObj) {
	getUser(userId).groups[groupId] = groupObj;
	return { groupId, groupName: groupObj.name, groupDescription: groupObj.description };
}


/**
 * Gets the user of the specified userId.
 * @param {String} userId
 * @returns the user object
 * @throws NOT_FOUND if the user was not found
 */
function getUser(userId) {
	const userObj = users[userId];
	if (!userObj) throw errors.NOT_FOUND({ userId });
	return userObj;
}


/**
 * Gets the group of the specified groupId and userId.
 * @param {String} userId
 * @param {String} groupId 
 * @returns the group object
 * @throws NOT_FOUND if the group was not found
 */
function getGroupFromUser(userId, groupId) {
	const groupObj = getUser(userId).groups[groupId];
	if (!groupObj) throw errors.NOT_FOUND({ groupId });
	return groupObj;
}


/**
 * Gets the game of the specified gameId.
 * @param {String} userId
 * @param {String} groupName
 * @param {String} gameId
 * @returns the game object
 * @throws NOT_FOUND if the game was not found
 */
function getGameFromGroup(userId, groupId, gameId) {
	const gameName = getGroupFromUser(userId, groupId).games[gameId];
	const game = games[gameId];
	if (!game | !gameName) throw errors.NOT_FOUND({ gameId });
	return game;
}

/**
 * Resets memory by assigning {} to the object users.
 */
function resetMem() {
	users = {};
	tokens = {};
}


/**
 * Empties all user's groups by assigning {} to the object groups.
 */
function resetAllGroups() {
	Object.values(users).forEach(user => {
		user.groups = {};
	});
}


module.exports = {
	getPopularGames,

	//-- User --
	createNewUser,
	tokenToUserId,

	//-- Group --
	createGroup,
	editGroup,
	listUserGroups,
	deleteGroup,
	getGroupDetails,

	//-- Game --
	addGameToGroup,
	removeGameFromGroup,

	//-- Tokens --
	tokenToUserId,

	//-- Utils --
	createUserObj,
	createGroupObj,
	addGroupToUser,
	getUser,
	getGroupFromUser,
	getGameFromGroup,

	resetMem,
	resetAllGroups
};
