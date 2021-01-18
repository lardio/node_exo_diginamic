const { Comment, Publication, User } = require('../models/db');
const { messageKO, defineTypeUser } = require('../services/general.services');

exports.getAll = async (req, res) => {
    try {
       let listeComment = await Comment.findAll();
       if(!listeComment.length) {
          const message = "La liste des commentaires est vide.";
          return res.status(400).json({ message });
       }
       const message = `La liste des commentaires a été récupérée. Il y'a en tout ${listeComment.length} publication(s).`;
       res.json({ message, Commentaires : listeComment });
    } catch (error) {
       messageKO(error, res);
    }  
}

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const comment = await Comment.findByPk(id);
        if(comment === null) {
            const message = "Le commentaire que vous souhaitez consulter existe pas.";
            return res.status(404).json({ message });
        }
        const message = "Le commentaire a été recupéré."
        res.json({message, commentaire : comment});
    }catch(error) {
        messageKO(error, res);
    }
}

exports.addComment = async (req, res) => {
    if(req.body.body_text) {
        try {
            const id = res.locals.id;
            const user = await User.findByPk(id);

            //si l'user est attaché a aucun profil
            if(user.studentId === null && user.teacherId === null) {
                const message = "Un commentaire créé sera associé a un profil d'étudiant ou de professeur existant. Merci de compléter votre profil avant de créer un commentaire.";
                return res.status(404).json({ message });
            }

            //verif si la publication auquel on veut ajouter le commentaire existe
            const publi = await Publication.findByPk(req.params.id);
            if(publi === null) {
                const message = "Le publication auquel vous voulez ajouter le commentaire existe pas";
                return res.status(404).json({ message });
            }
    
            const dateComment = new Date();
            req.body.creation_date = dateComment.getFullYear() + "-" + (dateComment.getMonth() + 1) + "-" + dateComment.getDate();
            const comment = await Comment.create(req.body);

            //recuperation du profil de l'user et ajout de l'assoc , ajout aussi de lassoc publi - comment
            userProfil = await defineTypeUser(user);
            await userProfil.role.addComment(comment);
            await comment.setPublication(publi);

            const message = "La creation du commentaire a fonctionnée.";
            res.json({ message , commentaire : comment})
        }catch(error) {
            messageKO(error, res);
        }
    } else {
        const message = "Requete annulée. Des champs sont manquants.";
        res.status(404).json({ message });
    }
}

exports.modifyComment = async (req, res) => {
    if(req.body.body_text) {
        try {
            const id = res.locals.id;

            //check si le commentaire existe
            let commentaire = await Comment.findByPk(req.params.id);
            if(commentaire === null) {
                const message = "Le commentaire que vous souhaitez modifier existe pas.";
                return res.status(404).json({ message });
            }

            const user = await User.findByPk(id);
            //si l'user est attaché a aucun profil
            if(user.studentId === null && user.teacherId === null) {
                const message = "Votre profil etudiant ou de professeur n'est pas complété. Merci de le faire avant de modifier un commentaire.";
                return res.status(404).json({ message });
            }

            //verif si l'user a le droit sur le commentaire
            userProfil = await defineTypeUser(user);
            let checkDroit = await userProfil.role.hasComment(commentaire);
            if(!checkDroit) {
                const message = "Requete annulée. Le commentaire que vous souhaitez modifier appartient a un autre utilisateur.";
                return res.status(404).json({ message });
            }

            await Comment.update(req.body, {
                where: { id: req.params.id }
            });
            //recuperation commentaire a jour
            commentaire = await Comment.findByPk(req.params.id);

            const message = "Le commentaire a bien été mis a jour.";
            res.json({ message , commentaire})

        }catch(error) {
            messageKO(error, res);
        }
    } else {
        const message = "Requete annulée. Des champs sont manquants.";
        res.status(404).json({ message });
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const id = res.locals.id;

        //check si le commentaire existe
        const commentaire = await Comment.findByPk(req.params.id);
        if(commentaire === null) {
            const message = "Le commentaire que vous souhaitez supprimer existe pas.";
            return res.status(404).json({ message });
        }

        const user = await User.findByPk(id);
        //si l'user est attaché a aucun profil
        if(user.studentId === null && user.teacherId === null) {
            const message = "Votre profil etudiant ou de professeur n'est pas complété. Merci de le faire avant de supprimer un commentaire.";
            return res.status(404).json({ message });
        }

        //verif si l'user a le droit sur le commentaire
        userProfil = await defineTypeUser(user);
        let checkDroit = await userProfil.role.hasComment(commentaire);
        if(!checkDroit) {
            const message = "Requete annulée. Le commentaire que vous souhaitez supprimer appartient a un autre utilisateur.";
            return res.status(404).json({ message });
        }

        await Comment.destroy({ where: { id: req.params.id }});

        const message = "Le commentaire a bien été supprimé.";
        res.json({ message , commentaireDeleted : commentaire });

    }catch(error) {
        messageKO(error, res);
    }
}