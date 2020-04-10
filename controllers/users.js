const User = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

module.exports = {
	signup,
	login,
	index,
	delete: deleteUser,
	update,
};

async function signup(req, res) {
	const user = new User(req.body);
	try {
		await user.save();
		const token = createJWT(user);
		res.json({ token });
	} catch (err) {
		// Probably a duplicate email
		res.status(400).json(err);
	}
}

async function login(req, res) {
	try {
		const user = await User.findOne({ username: req.body.username });
		if (!user) return res.status(401).json({ err: 'bad credentials' });
		user.comparePassword(req.body.pw, (err, isMatch) => {
			if (isMatch) {
				const token = createJWT(user);
				res.json({ token });
			} else {
				return res.status(401).json({ err: 'bad credentials' });
			}
		});
	} catch (err) {
		return res.status(401).json(err);
	}
}

async function index(req, res) {
	const users = await User.find({});
	res.status(200).json(users);
}

async function update(req, res) {
	const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});
	res.status(200).json(updatedUser);
}

async function deleteUser(req, res) {
	const deletedUser = await User.findByIdAndRemove(req.params.id);
	res.status(200).json(deletedUser);
}

/*----- Helper Functions -----*/

function createJWT(user) {
	return jwt.sign(
		{ user }, // data payload
		SECRET,
		{ expiresIn: '24h' }
	);
}
