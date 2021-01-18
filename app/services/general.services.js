messageKO = (error, res) => {
    const message = "Une erreur est apparue lors de votre requete. Veuillez retenter plus tard.";
    console.log(error);
    return res.status(500).json({ message, data : error.message });
}

defineTypeUser = async (userToVerify) => {
    if (userToVerify.type === 2 && userToVerify.teacherId) {
        console.log("PROFESSEUR !");
        let teacher = await userToVerify.getTeacher();
        return {role : teacher, type : 2, typeString : "Teacher"};
    } else if (userToVerify.type === 1 && userToVerify.studentId) {
        console.log("ETUDIANT !");
        let student = await userToVerify.getStudent();
        return {role : student, type : 1, typeString : "student"};
    } else {
        return {role : null, type : userToVerify.type, typeString : userToVerify.type === 1 ? "Student" : "Teacher"};
    }
}

module.exports = {
    messageKO, defineTypeUser
}