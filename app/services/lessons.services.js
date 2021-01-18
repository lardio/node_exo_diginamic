exports.checkFinished = (endDate) => {
    const Datenow = new Date();
    const dataFinished = new Date(endDate);
    console.log(Datenow < dataFinished);
    if (Datenow > dataFinished) 
        return false;
    return true;
}