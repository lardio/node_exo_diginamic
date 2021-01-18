const jwt = require('jsonwebtoken')
const privateKey = require('../config/private_key')
  
module.exports = (req, res, next) => {
    token = req.headers["x-access-token"]; //ici que se trouve le jeton
    console.log(authorizationHeader)
  
  if(!token) { //si jeton pas fourni
    const message = `Vous n'avez pas fourni de jeton d'authentification. Merci d'en fournir un.`;
    return res.status(403).json({ message })
  }
    
    const decodedToken = jwt.verify(token, privateKey, (error, decodedToken) => {
    if(error) {
      const message = `L'utilisateur n'est pas autorisé à accèder à cette ressource.`;
      return res.status(401).json({ message, data: error })
    }
  
    const userId = decodedToken.userId;
    console.log("TOKEN : \n", decodedToken);
    if (req.body.userId && req.body.userId !== userId) {
      const message = `L'identifiant de l'utilisateur est invalide.`
      res.status(401).json({ message })
    } else {
        res.json("fin test");
      //next() //si tout ok on passe a létape demandée.
    }
  })
}
