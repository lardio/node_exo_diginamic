const { Teacher } = require('../models/db');
const { messageKO } = require('../services/general.services');


exports.getAll = async (req, res) => {
   try {
      let listeProf = await Teacher.findAll();
      if(!listeProf.length) {
         const message = "La liste des professeurs est vide.";
         return res.status(400).json({ message });
      }
      const message = `La liste des récupérée. Il y'a en tout ${listeProf.length} professeur(s).`;
      res.json({ message, listeProf });
   } catch (error) {
      messageKO(error, res);
   }  
}

exports.getById = async (req, res) => {
   try {
      let professeur = await Teacher.findByPk(req.params.id);
      if(professeur === null) {
         const message = "Le professeur demandé existe pas. Essayez avec un nouvel ID";
         return res.status(400).json({ message })
      }
      const message = 'Un professeur a bien été trouvé.'
      res.json({ message, data: professeur })
   } catch (error) {
      messageKO(error, res);
   }
}

exports.create = async (req, res) => {
   console.log("APPEL PR CREATION PROF");
   if (req.body.first_name && req.body.last_name && req.body.bio && req.body.subject && req.body.profile_picture) {
      try {
         const teacherNew = await Teacher.create(req.body);
         return teacherNew;
      } catch (error) {
         messageKO(error, res)
      }
   } else {
      const message = "Requete annulée. Des informations necessaire à la création du professeur étaient manquantes.";
      res.status(400).json({ message });
   }
}

exports.update = async (req, res, id) => {
   if (req.body.first_name && req.body.last_name && req.body.bio && req.body.subject && req.body.profile_picture) {
      try {
         await Teacher.update(req.body, {
            where: {
               id: id
            }
         });
         return
      } catch (error) {
         messageKO(error, res)
      }
   } else {
      message = "Requete annulée. Des informations necessaire à la MAJ du professeur étaient manquantes."
      res.status(400).json({ message });
   }
}