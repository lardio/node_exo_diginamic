// fonctions utilisées par student.controller
const emailIsValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

//check si la date est au format YYYY-MM-DD - retourne un bool
const dateIsValid = (str) => {
    if(str=="" || str==null){return false;}								
    var m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
    if( m === null || typeof m !== 'object'){return false;}				
    if (typeof m !== 'object' && m !== null && m.size!==3){return false;}     
    var ret = true; // définitiation du retour par défaut a true						
    var thisYear = new Date().getFullYear(); 
    var minYear = 1920; //année minimum

    if( (m[1].length < 4) || m[1] < minYear || m[1] > thisYear){ret = false;} // check annéee
    if( (m[2].length < 2) || m[2] < 1 || m[2] > 12){ret = false;} // check lois
    if( (m[3].length < 2) || m[3] < 1 || m[3] > 31){ret = false;} // check jour
    return ret;			
}

const getAge = (birthday) => {
    const birthdate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    var mois = today.getMonth() - birthdate.getMonth();
    if (mois < 0 || (mois === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    return age;
}

module.exports = {
    emailIsValid, dateIsValid, getAge
}