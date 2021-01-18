const { Publication, User, Student, Teacher, Lesson } = require('../models/db');
const { messageKO, defineTypeUser } = require('../services/general.services');

exports.addPublication = async (req, res) => {
    if(req.body.title && req.body.body_text && req.body.type && req.body.lesson_id) {
        try {
            const id = res.locals.id;
            const user = await User.findByPk(id);
            //si l'user est attaché a aucun profil
            if(user.studentId === null && user.teacherId === null) {
                const message = "Une publication créée sera associée a un profil d'étudiant ou de professeur existant. Merci de compléter votre profil avant de créer un cours.";
                return res.status(404).json({ message });
            }

            //verif si le cours auquel on veut ajouter la publi existe
            const cours = await Lesson.findByPk(req.body.lesson_id);
            if(cours === null) {
                const message = "Le cours auquel vous voulez ajouter la publication existe pas";
                return res.status(404).json({ message });
            }
    
            const datePubli = new Date();
            req.body.creation_date = datePubli.getFullYear() + "-" + (datePubli.getMonth() + 1) + "-" + datePubli.getDate();
            const publi = await Publication.create(req.body);

            //recuperation du profil de l'user et ajout de l'assoc , ajout aussi de lassoc publi - cours
            userProfil = await defineTypeUser(user);
            await userProfil.role.addPublication(publi);
            await publi.setLesson(cours);

            const message = "La creation de la publication a fonctionnée.";
            res.json({ message , publication : publi})

        }catch(error) {
            messageKO(error, res);
        }
    } else {
        const message = "Requete annulée. Des champs sont manquants.";
        res.status(404).json({ message });
    }
}

exports.modifyPublication = async (req, res) => {
    if(req.body.title && req.body.body_text && req.body.type && req.body.lesson_id) {
        try {
            const id = res.locals.id;

            //check si la publi existe
            const publi = await Publication.findByPk(req.params.id);
            if(publi === null) {
                const message = "La publication que vous souhaitez modifier existe pas.";
                return res.status(404).json({ message });
            }

            const user = await User.findByPk(id);
            //si l'user est attaché a aucun profil
            if(user.studentId === null && user.teacherId === null) {
                const message = "Votre pforil etudiant ou de professeur n'est pas complété. Merci de le faire avant de modifier une publication.";
                return res.status(404).json({ message });
            }

            //verif si l'user a le droit sur la publication
            userProfil = await defineTypeUser(user);
            let checkDroit = await userProfil.role.hasPublication(publi);
            if(!checkDroit) {
                const message = "Requete annulée. La publication que vous souhaitez modifier appartient a un autre utilisateur.";
                return res.status(404).json({ message });
            }

            await Publication.update(req.body, {
                where: { id: req.params.id }
            });

            const message = "La publication a bien été mise a jour.";
            res.json({ message , publication : publi})
        }catch(error) {
            messageKO(error, res);
        }
    } else {
        const message = "Requete annulée. Des champs sont manquants.";
        res.status(404).json({ message });
    }
}

exports.deletePublication = async (req, res) => {
    try {
        const id = res.locals.id;

        //check si la publi existe
        const publi = await Publication.findByPk(req.params.id);
        if(publi === null) {
            const message = "La publication que vous souhaitez supprimer existe pas.";
            return res.status(404).json({ message });
        }

        const user = await User.findByPk(id);
        //si l'user est attaché a aucun profil
        if(user.studentId === null && user.teacherId === null) {
            const message = "Votre profil etudiant ou de professeur n'est pas complété. Merci de le faire avant de supprimer une publication.";
            return res.status(404).json({ message });
        }

        //verif si l'user a le droit sur la publication
        userProfil = await defineTypeUser(user);
        let checkDroit = await userProfil.role.hasPublication(publi);
        if(!checkDroit) {
            const message = "Requete annulée. La publication que vous souhaitez supprimer appartient a un autre utilisateur.";
            return res.status(404).json({ message });
        }

        await Publication.destroy({ where: { id: req.params.id }});

        const message = "La publication a bien été supprimée.";
        res.json({ message , publicationDeleted : publi})
    }catch(error) {
        messageKO(error, res);
    }
}

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const publi = await Publication.findByPk(id);
        if(publi === null) {
            const message = "La publicaiton que vous souhaitez consulter existe pas";
            return res.status(404).json({ message });
        }
        const message = "La publication a été recupérée."
        res.json({message, publication : publi});
    }catch(error) {
        messageKO(error, res);
    }
}

exports.getAll = async (req, res) => {
    try {
       let listePubli = await Publication.findAll();
       if(!listePubli.length) {
          const message = "La liste des publications est vide.";
          return res.status(400).json({ message });
       }
       const message = `La liste des publication a été récupérée. Il y'a en tout ${listePubli.length} publication(s).`;
       res.json({ message, Publications : listePubli });
    } catch (error) {
       messageKO(error, res);
    }  
}