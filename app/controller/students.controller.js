const { Student, User, Lesson } = require('../models/db');
const { dateIsValid, getAge } = require('../services/students.services');
const { messageKO, defineTypeUser } = require('../services/general.services');

exports.getAll = async (req, res) => {
   try {
      let listeEtudiant = await Student.findAll();
      if(!listeEtudiant.length) {
         const message = "La liste des etudiants est vide.";
         return res.status(400).json({ message });
      }

      //MAJ de la liste des Etudiants avec le calcul de l'age
      listeEtudiants = listeEtudiants.map(etudiant => {
         etudiant.age = getAge(etudiant.birthdate);
         return etudiant;
      });

      const message = `La liste des récupérée. Il y'a en tout ${listeEtudiant.length} etudiant(s).`;
      res.json({ message, listeEtudiant });
   } catch (error) {
      messageKO(error, res);
   }  
}

exports.getById = async (req, res) => {
   try {
      let etudiant = await Student.findByPk(req.params.id);
      if(etudiant === null) {
         const message = "L'etudiant demande existe pas. Essayez avec un nouvel ID";
         return res.status(400).json({ message })
      }
      etudiant.age = getAge(etudiant.birthdate);
      const message = 'Un étudiant a bien été trouvé.'
      res.json({ message, data: etudiant })
   } catch (error) {
      messageKO(error, res);
   }
}

exports.create = async (req, res, fromUser = false) => {
   if (req.body.first_name && req.body.last_name && req.body.birthdate && req.body.bio && req.body.profile_picture) {
      try {

         //Validation date de naissance
         if(!dateIsValid(req.body.birthdate)) {
            const message = 'Requete annulée - La date de naissance est dans le mauvais format - merci de corriger';
            return res.status(400).json({ message })}
         
         //Definition de l'age
         req.body.age = getAge(req.body.birthdate);

         const etudiantNew = await Student.create(req.body);
         return etudiantNew;

         //pour detecter si l'appel vient de la methode put de user. Mis en commentaire car c'est la seule possibilité d'appek a cette fonction
         /*
         if(fromUser) {
            return etudiantNew
         } else {
            const message = `L'étudiant ${req.body.first_name} a bien été créé.`;
            res.json({ message, data: etudiantNew });
         }*/

      } catch (error) {
         messageKO(error, res)
      }
   } else {
      message = "Requete annulée. Des informations necessaire à la création de l'etudiant étaient manquantes."
      res.status(400).json({ message });
   }
}

exports.update = async (req, res, id) => {
   if (req.body.first_name && req.body.last_name && req.body.birthdate && req.body.bio && req.body.level && req.body.profile_picture) {
      try {
         await Student.update(req.body, {
            where: {
               id: id
            }
         });
         return;
      } catch (error) {
         messageKO(error, res)
      }
   } else {
      message = "Requete annulée. Des informations necessaire à la MAJ de l'etudiant étaient manquantes."
      res.status(400).json({ message });
   }
}

exports.addPote =  async (req, res) => {
   try {
      const id = res.locals.id;
      const userBase = await User.findByPk(id);
      const studentBase = await defineTypeUser(userBase);

      //check si on est bien un etudiant
      if (studentBase.type === 1) {
         const studentToAdd = await Student.findByPk(req.params.id);

         //check si l'étudiant qu'on veut ajouter existe
         if(studentToAdd === null) {
            const message = "l'étudiant que vous souhaitez ajouter comme ami existe pas";
            return res.status(400).json({ message });
         }

         //ajout de la relation
         await studentBase.role.addBro(studentToAdd);
         const message = "Votre amitié a bien été ajoutée."
         return res.json({ message, newFriend : studentToAdd })
      }
      const message = "Vous devez être un étudiant pour pouvoir ajouter un autre étudiant comme ami";
      res.status(404).json({ message });
   } catch (error) {
      messageKO(error, res)
   }
}

exports.removePote =  async (req, res) => {
   try {
      const id = res.locals.id;
      const userBase = await User.findByPk(id);
      const studentBase = await defineTypeUser(userBase);

      //check si on est bien un etudiant
      if (studentBase.type === 1) {
         const studentToRemove = await Student.findByPk(req.params.id);

         //check si l'amitié qu'on veut supprimer existe (si l'ajout a été fait par le student qu'on veut supprimer, ce sera via l'autre cle - donc check des deux)
         const check1 = await studentBase.role.hasBro(studentToRemove);
         const check2 = await studentBase.role.hasBro2(studentToRemove);

         //on double le check sans elseif au cas ou l'amitié a été ajouté dans les deux sens
         if(check1) {
            await studentBase.role.removeBro(studentToRemove);
         } 
         if (check2) {
            await studentBase.role.removeBro2(studentToRemove);
         }
         if (!check2 && !check1) {
            const message = "L'amitié que vous souhaitez supprimer existe pas";
            return res.status(404).json({ message });
         }

         const message = "Votre amitié a bien été supprimée.";
         return res.json({
            message,
            deletedFriend : studentToRemove
         })
      }
      const message = "Vous devez être un étudiant pour pouvoir ajouter un autre étudiant comme ami.";
      res.status(404).json({ message });
   } catch (error) {
      messageKO(error, res);
   }
}

exports.addLesson = async (req, res) => {
   try {
      const id = res.locals.id;
      let lesson = await Lesson.findByPk(req.params.id);

      //check si la lesson exite
      if(lesson === null) {
         const message = "Le cours auquel vous voulez vous inscrire existe pas";
         return res.status(404).json({ message });
      }

      let user = await User.findByPk(id);
      //check si on est un etudiant
      if(user.type != 1) {
         const message = "Vous essayer de vous enregistrer au cours sur la page des etudiants alors que vous etes professeur. Requete annulée.";
         return res.status(404).json({ message });
      }

      //check si notre profil etudiant existe
      if(user.studentId === null) {
         const message = "Vous essayer de vous enregistrer au cours sur la page des etudiants alors que votre profil etudiant n'existe pas. Merci d'en créer un avant.";
         return res.status(404).json({ message });
      }
      
      //a partir d'ici c'est ok pour ajout
      let student = await Student.findByPk(user.studentId);
      await student.addLesson(lesson);
      const message = "Vous vous etes bien inscrit pour le cours suivant.";
      res.json({ message, lesson });
     
   } catch (error) {
      messageKO(error, res);
   }
}

/*
exports.remove = async (req, resp) =>{
try {
       await Student.destroy({
         where: {
            id: req.params.id
         }
       });
   res.status(200);
        res.json({"message":"element removed"});
   } catch (e) {
      resp.json(500);
      resp.json({ error: e });
   }
}
*/