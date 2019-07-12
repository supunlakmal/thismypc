module.exports.userResources = function(userData) {

    return {
         userID:userData._id,
         userFirstName:userData.name,
         userLastName:userData.nameLast,
         email:userData.email,
    };

};