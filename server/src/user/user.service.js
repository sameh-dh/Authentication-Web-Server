const db = require("../../database-mysql/index");
const bcrypt = require("bcryptjs");


const addUserService = async (userData) => {
  return new Promise(async (resolve, reject) => {
    const query = "INSERT INTO user (email,password,name,surname,phone_number,photo_user,social_media_link,governorat,pays,bio) VALUES (?)";
    const values = [
      userData.email,
      userData.password,
      userData.name,
      userData.surname,
      userData.phone_number,
      userData.photo_user,
      JSON.stringify({
        "facebook": null,
        "whatsapp": null,
        "linkedin": null
      }),
      userData.governorat,
      userData.pays,
      userData.bio
    ];
    db.query(query, [values], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.affectedRows === 0) {
          resolve(null);
        } else {
          resolve(results);
        }
      }
    });
  });
};


const updateUserService = async (idUser, fieldsToUpdate) => {
  return new Promise(async (resolve, reject) => {
    const query = "UPDATE user SET ? WHERE idUser = ?";
    db.query(query, [fieldsToUpdate, idUser], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.changedRows === 0) {
          resolve(null);
        } else {
          resolve(results);
        }
      }
    });
  });
};

const updateUserStatus = async (email_user) => {
  return new Promise(async (resolve, reject) => {
    const query = "UPDATE user SET status='activated' WHERE email = ?";
    db.query(query, [email_user], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.changedRows === 0) {
          resolve(null);
        } else {
          resolve(results);
        }
      }
    });
  });
};


const checkUserStatus = async (email_user) => {
  return new Promise(async (resolve, reject) => {
    const query = "SELECT email FROM user WHERE email=? AND status='activated'";
    db.query(query, [email_user], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.affectedRows === 0) {
          resolve(null);
        } else {
          resolve(results);
        }
      }
    });
  });
}


const getUserByIdService = async (id) => {
  return new Promise(async (resolve, reject) => {
    const query = "SELECT * FROM user WHERE idUser = ?";
    db.query(query, [id], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          resolve([results]);
        }
      }
    });
  });
};

const getUserByEmailAndPasswordService = async (email) => {
  return new Promise(async (resolve, reject) => {
    const query = "SELECT * FROM user WHERE email = ?";
    db.query(query, [email], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0]);
        }
      }
    });
  });
};

const getAllUserService = async () => {
  return new Promise(async (resolve, reject) => {
    const query = "SELECT * FROM user";
    db.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          resolve([results]);
        }
      }
    });
  });
};

const deleteUserByIdService = async (id) => {
  return new Promise(async (resolve, reject) => {
    const query = "UPDATE user SET deactivated = 1 WHERE idUser = ?";
    db.query(query, [id], (error, result) => {
      if (error) {
        reject(error);
      } else {
        if (result.changedRows === 0) {
          resolve(null);
        } else {
          resolve(result);
        }
      }
    });
  });
};

const email_check = async (email) => {
  return new Promise(async (resolve, reject) => {
    const query = "SELECT email FROM user WHERE email=?";
    db.query(query, [email], (error, result) => {
      if (error) {
        reject(error);
      } else {
        if (result.changedRows === 0) {
          resolve(null);
        } else {
          resolve(result);
        }
      }
    });
  });
}

const updatePasswordService = async (email, hashedPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = "UPDATE user SET password = ? WHERE email = ?";
      db.query(query, [hashedPassword, email], (error, results) => {
        if (error) {
          console.error("Error executing database query:", error);
          reject(error);
        } else {
          if (results.changedRows === 0) {
            // No rows were affected, meaning the user with the provided email was not found
            resolve(null);
          } else {
            // Password updated successfully
            resolve(results);
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};



module.exports = {
  addUserService,
  updateUserService,
  getUserByIdService,
  getAllUserService,
  deleteUserByIdService,
  getUserByEmailAndPasswordService,
  email_check,
  updateUserStatus,
  checkUserStatus,
  updatePasswordService
};
