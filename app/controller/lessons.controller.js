const { Lesson, User } = require("../models/db");
const { checkFinished } = require("../services/lessons.services");
const { messageKO, defineTypeUser} = require('../services/general.services');

exports.getAll = async (req, res) => {
    try {
        let listeCours = await Lesson.findAll();
        if(!listeCours.length) {
            const message = "La liste des cours est vide.";
            return res.status(404).json({ message });
        }
        const message = "La liste des cours a bien été récupérée.";
        listeCours = listeCours.map(cours => {
            cours.is_finished = checkFinished(cours.ending_date);
            return cours;
        });
        res.status(200).json({ message, listeCours });
    }
    catch (error) {
        messageKO(error, res);
    }
}

exports.update = async (req, res) => {
    if (req.body.title && req.body.hours && req.body.description && req.body.file_name && req.body.starting_date && req.body.ending_date && req.params.id) {
        try {
            const cours = await Lesson.update(req.body, { where: { id: req.params.id } });
            const message = "Le cours a été correctement MAJ".
            res.json({ message, cours });
        } catch (error) {
            messageKO(error, res)
        }
    } else {
        const message = "Requete annulee. Tous les champs necessaires à la MAJ du cours n'étaient pas present";
        res.status(400).json({ message });
    }
}

exports.create = async (req, res) => {
    if (req.body.title && req.body.hours && req.body.file_name && req.body.description && req.body.starting_date && req.body.ending_date) {
        try {
            const id = res.locals.id;
            let user = res.locals.user;

            //creation du cours
            let cours = await Lesson.create(req.body);
            user = await User.findByPk(id);

            //ajout de l'association entre soit eleve/teacher et le cours
            const userType = await defineTypeUser(user);
            await userType.role.addLesson(cours.id)

            const message = "La création du cours a réussie.";
            res.json({ message, cours });
        } catch (error) {
            messageKO(error, res);
        }
    } else {
        res.status(400).json({ error: `Veuillez remplir les tous les champs neccessaires`});
    }
}

exports.getById = async (req, res) => {
    try {
        let cours = await Lesson.findByPk(req.params.id);
        if(cours === null) {
            const message = "le cours demande existe pas";
            return res.status(400).json({ message })
        }

        const message = "Le cours a bien été récupéré.";
        cours.is_finished = checkFinished(cours.ending_date);
        res.json({message , cours});
    } catch (error) {   
        messageKO(error, res)
    }
}

exports.remove = async (req, res) => {
    try {
        const id = res.locals.id;
        user = await User.findByPk(id);

        //on vérif d'abord si la lecon qu'on tente de supprimer existe 
        let lessonCheck = await Lesson.findOne({ where: { id: req.params.id }});
        if(lessonCheck === null) {
            return res.status(404).json({ message: "La lesson que vous voulez supprimer n'existe pas." });
        }

        //recuperation du type de l'user;
        const userType = await defineTypeUser(user);

        //verif si l'user via son role est bien associé au cours qu'on essaye de supprimer via la relation teacher/student - cours
        let checkPoprioLesson = await userType.role.hasLessons(lessonCheck);
        if(!checkPoprioLesson) {
            message = "Vous ne pouvez pas supprimer un cours qui ne vous appartient pas.";
            return res.status(400).json({ message })
        }

        //a partir de la tout est ok
        await Lesson.destroy({ where: { id: req.params.id } });
        message = "Le cours a correctement été supprimé.";
        res.json({ message, DeletedCours : lessonCheck });
    } catch (error) {
        messageKO(error, res);
    }
    
}

exports.modifyLesson = async (req, res) => {
    if(req.body.title && req.body.hours && req.body.file_name && req.body.description && req.body.starting_date && req.body.ending_date) {
        try {
            const id = res.locals.id;

            //check si le cours existe
            let cours = await Lesson.findByPk(req.params.id);
            if(cours === null) {
                const message = "Le cours que vous souhaitez modifier existe pas.";
                return res.status(404).json({ message });
            }

            const user = await User.findByPk(id);
            //si l'user est attaché a aucun profil
            if(user.studentId === null && user.teacherId === null) {
                const message = "Votre profil etudiant ou de professeur n'est pas complété. Merci de le faire avant de modifier un cours.";
                return res.status(404).json({ message });
            }

            //verif si l'user a le droit sur le commentaire
            userProfil = await defineTypeUser(user);
            let checkDroit = await userProfil.role.hasLesson(cours);
            if(!checkDroit) {
                const message = "Requete annulée. Le cours que vous souhaitez modifier appartient a un autre utilisateur.";
                return res.status(404).json({ message });
            }

            await Lesson.update(req.body, {
                where: { id: req.params.id }
            });
            //recuperation de la version a jour
            cours = await Lesson.findByPk(req.params.id);

            const message = "Le cours a bien été mis a jour.";
            res.json({ message , cours})
        }catch(error) {
            messageKO(error, res);
        }
    } else {
        const message = "Requete annulée. Des champs sont manquants.";
        res.status(404).json({ message });
    }
}