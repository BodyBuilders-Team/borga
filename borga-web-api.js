'use strict';


const express = require('express');
const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/borga-api-spec.json');
const errors = require('./borga-errors');


module.exports = function (services) {

	/**
	 * Searches for an identification Bearer token in the request's Authorization Header.
	 * @param {Object} req 
	 * @returns the token found if it´s a Bearer Token. 
	 */
	function getBearerToken(req) {
		const auth = req.header('Authorization');
		if (auth) {
			const authData = auth.trim();
			if (authData.substr(0, 6).toLowerCase() === 'bearer')
				return authData.replace(/^bearer\s+/i, '');
		}
		return null;
	}


	/**
	 * Get the user token from the request.
	 * @param {Object} req 
	 * @returns user token
	 */
	function getUserToken(req) {
		return req.user && req.user.token;
	}


	/**
	 * Sends as response an object containing the cause of the error.
	 * @param {Object} res 
	 * @param {Object} err
	 */
	function onError(res, err) {
		switch (err.name) {
			case 'MISSING_PARAM':
			case 'BAD_REQUEST':
				res.status(400);
				break;
			case 'UNAUTHENTICATED':
				res.status(401);
				break;
			case 'NOT_FOUND':
				res.status(404);
				break;
			case 'ALREADY_EXISTS':
				res.status(409);
				break;
			case 'EXT_SVC_FAIL':
				res.status(502);
				break;
			case 'FAIL':
			default:
				console.log(err);
				res.status(500);
		}
		res.json({ cause: err });
	}


	/**
	 * Validates a request, checking its query parameters and/or body properties, given a schema.
	 * @param {Object} schema 
	 * @returns middleware function
	 */
	function validateRequest(schema) {
		return (req, res, next) => {
			try {
				const info = {};

				if (schema.query) {
					for (const i in schema.query.required) {
						const param = schema.query.required[i];
						if (!req.query[param])
							info[param] = "required parameter missing";
					}

					for (const param in req.query) {
						if (!schema.query.params.includes(param))
							info[param] = "unknown query parameter";
					}
				}

				if (schema.body) {
					for (const property in schema.body) {
						const value = req.body[property];
						const type = schema.body[property].type;
						const required = schema.body[property].required;

						if (required && !value)
							info[property] = "required property missing";
						else if (value && typeof value !== type)
							info[property] = "wrong type. expected " + type + ". instead got " + typeof value;
					}

					for (const property in req.body) {
						if (!schema.body[property])
							info[property] = "unknown body property";
					}
				}

				if (Object.keys(info).length > 0)
					throw errors.BAD_REQUEST(info);

				next();
			}
			catch (err) {
				onError(res, err);
			}
		}
	}


	/**
	 * Sends as response an object containing the most popular games among all users.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function getPopularGames(req, res) {
		try {
			const popularGames = Object.values(await services.getPopularGames());
			res.json({ popularGames: Object.fromEntries(popularGames.map(game => [game.id, game.name])) });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Sends as response an object containing an array of games obtained given a name and other optional filter params.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function searchGamesByName(req, res) {
		const gameName = req.query.gameName;
		const limit = req.query.limit;
		const order_by = req.query.order_by;
		const ascending = req.query.ascending;

		try {
			const games = await services.searchGamesByName(gameName, limit, order_by, ascending);
			res.json({ games });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Sends as response an object containing the game details obtained given an id.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function getGameDetails(req, res) { // TODO add to documentation
		const gameId = req.params.gameId;

		try {
			const game = await services.getGameDetails(gameId);
			res.json({ game });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Creates a new user. In case of success, sends as response an object with the new user's information.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function createNewUser(req, res) {
		const userId = req.body.userId;
		const userName = req.body.userName;
		const password = req.body.password;

		try {
			const userInfo = await services.createNewUser(userId, userName, password);
			res.json({ "Created user": userInfo });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Creates a new group. In case of success, sends as response an object with the name of the created group.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function createGroup(req, res) {
		const token = getUserToken(req);
		const userId = req.params.userId;
		const groupName = req.body.groupName;
		const groupDescription = req.body.groupDescription;

		try {
			const groupInfo = await services.createGroup(token, userId, groupName, groupDescription);
			res.json({ "Created group": groupInfo });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Edits a group with the specified parameters. In case of success, sends as response an object with the new name of the edited group.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function editGroup(req, res) {
		const token = getUserToken(req);
		const userId = req.params.userId;
		const groupId = req.params.groupId;
		const newGroupName = req.body.newGroupName;
		const newGroupDescription = req.body.newGroupDescription;

		try {
			const groupInfo = await services.editGroup(token, userId, groupId, newGroupName, newGroupDescription);
			res.json({ "Edited group": groupInfo });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Sends as response the list of all groups of the specified user.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function listGroups(req, res) {
		const token = getUserToken(req);
		const userId = req.params.userId;

		try {
			const groups = await services.listUserGroups(token, userId);
			res.json(groups);
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Deletes a group. In case of success, sends as response an object with the name of the deleted group.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function deleteGroup(req, res) {
		const token = getUserToken(req);
		const userId = req.params.userId;
		const groupId = req.params.groupId;

		try {
			const groupInfo = await services.deleteGroup(token, userId, groupId);
			res.json({ "Deleted group": groupInfo });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Sends as response an object containing the details of the specified group. 
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function getGroupDetails(req, res) {
		const token = getUserToken(req);
		const userId = req.params.userId;
		const groupId = req.params.groupId;

		try {
			const details = await services.getGroupDetails(token, userId, groupId);
			res.json(details);
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Adds a game to a group. In case of success, sends as response an object with the name of the added game.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function addGameToGroup(req, res) {
		const token = getUserToken(req);
		const userId = req.params.userId;
		const groupId = req.params.groupId;
		const gameId = req.body.gameId;

		try {
			const addedGame = await services.addGameToGroup(token, userId, groupId, gameId);
			res.json({ "Added game": addedGame });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Removes a game from a group. In case of success, sends as response an object with the name of the removed game.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function removeGameFromGroup(req, res) {
		const token = getUserToken(req);
		const userId = req.params.userId;
		const groupId = req.params.groupId;
		const gameId = req.params.gameId;

		try {
			const name = await services.removeGameFromGroup(token, userId, groupId, gameId);
			res.json({ "Removed game": name });
		} catch (err) {
			onError(res, err);
		}
	}

	/**
	 * Extracts the bearer token in the requests and executes the callback function.
	 * @param {Object} req 
	 * @param {Object} res 
	 * @param {Function} next 
	 */
	function extractToken(req, res, next) {
		const bearerToken = getBearerToken(req);

		if (bearerToken)
			req.user = { token: bearerToken }

		next();
	}


	const router = express.Router();

	router.use('/docs', openApiUi.serve);
	router.get('/docs', openApiUi.setup(openApiSpec));

	router.use(express.json());
	router.use(extractToken);


	// Games 
	router.get('/games/popular', getPopularGames);

	router.get('/games/search', validateRequest({
		query: {
			params: ["gameName", "limit", "order_by", "ascending"],
			required: ["gameName"]
		}
	}), searchGamesByName);

	router.get('/games/:gameId', getGameDetails);

	// User 
	router.post('/user', validateRequest({
		body: {
			userId: { type: "string", required: true },
			userName: { type: "string", required: true },
			password: { type: "string", required: true }
		}
	}), createNewUser);

	router.post('/user/:userId/groups', validateRequest({
		body: {
			groupName: { type: "string", required: true },
			groupDescription: { type: "string", required: true }
		}
	}), createGroup);

	router.post('/user/:userId/groups/:groupId', validateRequest({
		body: {
			newGroupName: { type: "string", required: false },
			newGroupDescription: { type: "string", required: false }
		}
	}), editGroup);

	router.get('/user/:userId/groups', listGroups);

	router.delete('/user/:userId/groups/:groupId', deleteGroup);

	router.get('/user/:userId/groups/:groupId', getGroupDetails);

	router.post('/user/:userId/groups/:groupId/games', validateRequest({
		body: {
			gameId: { type: "string", required: true }
		}
	}), addGameToGroup);

	router.delete('/user/:userId/groups/:groupId/games/:gameId', removeGameFromGroup);


	// URI Not Found
	router.use(function (req, res) {
		res.status(404).send(errors.NOT_FOUND(`Cannot do ${req.method} with ${req.path}.`))
	});

	return router;
};
