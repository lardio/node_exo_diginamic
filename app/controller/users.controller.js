const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { messageKO, defineTypeUser } = require('../services/general.services');
const { checkDuplicateEmail } = require("../services/user.services");
const { User, Student } = require('../models/db');
const privateKey = require('../config/private_key');  
const studentMethodes = require('./students.controller'); 
const teacherMethodes = require('./teachers.controller'); 

exports.login = async (req, res, messageRegister = null, userRegister = null) => {
    if (req.body.password && req.body.email) {
        try {
            let user;
            //si la requete vient directement de login et non de register
            if(typeof userRegister != 'object') {
                user = await User.findOne({ where: { email: req.body.email }});
                if (!user) {
                    return res.status(404).send({ message: "Cet email ne correspond a aucun compte." });};
    
                const verifPassword = bcrypt.compareSync(req.body.password, user.password);
                
                if(!verifPassword) {
                    const message = `Le mdp est incorrect`;
                    return res.status(401).json({ message })};
            } else {
                user = userRegister;
            }
            //JWT
            const token = jwt.sign( //besoin de 3 params
                {userId : user.id},
                privateKey.privateKey,
                {expiresIn : '24h'}
            );

            //check si user est etudiant ou prof
            const typeUser = await defineTypeUser(user);
            console.log(typeUser);
            let messageEnd = typeof messageRegister === "string" ? messageRegister : "Vous vous êtes bien identifié - Merci de récuperer votre token pour vos futurs requetes sur l'API.";
            res.json({
                eeee : messageEnd,
                data : {
                    id : user.id,
                    email : user.email,
                    token : token,
                    role : typeUser.typeString,
                    informations : typeUser.role,
                }
            })
        }
        catch (error) {
            messageKO(error, res);
        }
    } else {
        const message = "Demande de login annulée. Merci de renseigner votre email et votre mdp.";
        return res.status(400).json({ message });
    }
}

exports.register = async (req, res) => {
    if(req.body.password && req.body.email && req.body.type) {
        try {
            const emailOccupe = await checkDuplicateEmail(req, res);
            if (!emailOccupe) {
                let user = await User.create({
                    email: req.body.email,
                    password: bcrypt.hashSync(req.body.password, 8),
                    type: req.body.type
                });
                //redirection vers le login pour connection automatique et fournir le token
                this.login(req, res, "Votre compte a bien été créé. Vous avez aussi été directement authentifié avec la création de votre compte. Vous pouvez donc récupérer votre token pour éxecuter vos futurs requetes sur l'API", user);
            } else {
                const message = "L'email renseigné est déjà utilisé. Merci d'en renseigner un autre.";
                res.status(409).json({ message });
            }
        } catch (error) {
            messageKO(error, res);
        }
    } else {
        const message = "Demande de creation de compte annulée. Merci de renseigner tous les champs obligatoires (email & password).";
        res.status(400).json({ message });
    }
}

exports.modifyMail = async (req, res) => {
    if(req.body.email) {
        try {
            const id = res.locals.id;
            let user = await User.findOne({ where: { id: id }});
            user.email = req.body.email;
            await user.save();
            const message = "Votre email a bien été modifié.";
            res.json({ message, data : user.email });
        } catch(error) {
            messageKO(error, res);
        }    
    } else {
        const message = "Merci de renseigner le mail dans votre requete pour le modifier.";
        req.status(400).json({ message });
    }
}

exports.modifyPassword = async (req, res) => {
    if(req.body.old_password && req.body.new_password) {
        try {
            const id = res.locals.id;
            let user = await User.findOne({ where: { id: id }});
            const verifPassword = bcrypt.compareSync(req.body.old_password, user.password);
            if(verifPassword) {
                user.password = bcrypt.hashSync(req.body.new_password, 8);
                await user.save();
                const message = "Votre mot de passe a été correctement modifié.";
                res.json({ message });
            } else {
                const message = "Demande annulée. L'ancien mot de passe renseigné n'est pas correct.";
                res.status(400).json({ message });
            }
        } catch(error) {
            messageKO(error, res);
        }    
    } else {
        const message = "Merci de renseigner le nouveau et l'ancien mot de passe dans votre requete pour le modifier.";
        res.status(400).json({ message });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const id = res.locals.id;
        let user = await User.findOne({ where: { id: id }});
        await Student.destroy({where : { id: res.locals.id }});
        const message = "Votre compte a bien été supprimé.";
        res.json({ message, userDeleted : user });
    } catch(error) {
        messageKO(error, res);
    }
}

exports.getInfo = async (req, res) => {
    try {
        const id = res.locals.id;
        let user = await User.findOne({ where: { id: id }});

        const studentInfo = await defineTypeUser(user);
        const message = "Voici les informations de votre compte.";
        res.json({
            message,
            email : user.email,
            role : studentInfo.typeString,
            data : studentInfo.role 
        });
    } catch(error) {
        messageKO(error, res);
    }
}

exports.changeMyInfo = async (req, res) => {
    try {
        const id = res.locals.id;
        let user = await User.findOne({ where: { id: id }});
        const typeUser = await defineTypeUser(user);
        const typeUserString = typeUser.typeString;
        if(typeUser.role === null) {
            const message = `Vous avez fait une demande de MAJ de votre compte ${typeUserString} alors que celui-ci exite pas.`;
            return res.status(400).json({ message });
        }
        typeUser.type === 1 ? await studentMethodes.update(req, res, typeUser.role.id) : await teacherMethodes.update(req, res, typeUser.role.id);
        await defineTypeUser(user);
        const message = "Vos informations ont bien été mises à jour.";
        res.json({
            message,
            email : user.email,
            role : typeUser.typeString,
            newData : req.body
        })
    } catch(error) {
        messageKO(error, res);
    }
}

exports.createMyInfo = async (req, res) => {
    try {
        const id = res.locals.id;
        let user = await User.findOne({ where: { id: id }});
        const newRoleDataUser = user.type === 1 ? await studentMethodes.create(req, res) : await teacherMethodes.create(req, res);
        user.type === 1 ? await user.setStudent(newRoleDataUser) : await user.setTeacher(newRoleDataUser);
        const message = "Le profil de votre compte a bien été créé."
        res.json({ 
            message, 
            role : user.typeString,
            data : newRoleDataUser 
        });
    } catch(error) {
        messageKO(error, res);
    }
}
