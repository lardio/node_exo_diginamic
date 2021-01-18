const { User } = require("../models/db");

checkDuplicateEmail = async (req, res) => {
    try {
        let user = await User.findOne({
            where: { email: req.body.email }
        })
        if (user) {
            res.status(400).send({message: "Cet email est déja utilisé."});
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

module.exports = {
    checkDuplicateEmail
}