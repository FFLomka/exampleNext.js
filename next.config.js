require('dotenv').config()

module.exports = {
	env: {
		API_URL : process.env.API_URL,
		DADATA_URL : process.env.DADATA_URL,
		TOKEN : process.env.TOKEN,
		SECRET : process.env.SECRET,
	}
}