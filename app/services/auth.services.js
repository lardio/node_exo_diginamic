const jwt = require('jsonwebtoken');
const privateKey = require('../config/private_key');
const { User } = require('../models/db')
  
module.exports = (req, res, next) => {
    console.log("requete pour auth");
    const token = req.headers["x-access-token"];

    if(!token) { //si jeton pas fourni
        const message = `Vous n'avez pas fourni de jeton d'authentification. Ajoutez-en un dans l'en-tête de la requête.`;
        return res.status(401).json({ message })
    }
    
    //const token = authorizationHeader.split(' ')[1] //recuperation du jeton
    const decodedToken = jwt.verify(token, privateKey.privateKey, (error, decodedToken) => {
        if(error) {
            const message = `L'utilisateur n'est pas autorisé à accèder à cette ressource.`;
            return res.status(401).json({ message, data: error.message });
        }

        let userId = decodedToken.userId;

        //verif si le compte de l'user a pas été supprimé depuis la création de son token
        const user_from_token = await User.findByPk(userId);
        if(!user_from_token) {
            const message = "Votre compte existe plus. Vous n'etes pas authoriser a acceder a cette page.";
            return res.status(401).json({ message })
        }
        
        res.locals.id = userId;
        res.locals.user = user_from_token;
        next();
    })
}
