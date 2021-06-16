const sqlite3 = require('sqlite3').verbose();

//DB connect
let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
});




module.exports = {

    //Get GNSS
    getGnss: async function() {
        return new Promise(resolve => {
            db.all("SELECT * FROM gnss", async (err, row) => {
                if (err) {
                    console.log(err);
                    resolve(err);
                } else {
                    resolve(row);
                }
            });
        })
    },




    //Get todde
    filterResult: async function(gnssAll, required) {
        return new Promise(resolve => {
          console.log(gnssAll.length);
          indexLength = gnssAll.length - 1;
          listAll =  [];
          listKeyReq = [];
          for (var i = 0; i < gnssAll.length; i++) {
              tillvModell = gnssAll[i].tillverkare + "-" + gnssAll[i].modell
              listAll[tillvModell] = 0;
          }

          console.log(listAll);



          // for (const [keyReq, valueReq] of Object.entries(required)) {
          //     this.testis(keyReq, gnssAll)
          // }



          for (var i = 0; i < gnssAll.length; i++) {

              for (const [keyAll, valueAll] of Object.entries(gnssAll[i])) {
                  let currModell = gnssAll[i].tillverkare + "-" + gnssAll[i].modell;
                  for (const [keyReq, valueReq] of Object.entries(required)) {
                      if (keyReq == keyAll) {
                        if (keyReq.charAt(0) == "-") {
                            if (valueReq >= valueAll) {
                                listAll[currModell] = listAll[currModell] + 1;
                                break;
                            } else {
                              break
                            }

                        } if (keyReq.charAt(0) == "+") {
                            if (valueReq <= valueAll) {
                                listAll[currModell] = listAll[currModell] + 1;
                                break;
                            } else {
                              break
                            }
                        } if (keyReq.charAt(0) == "_") {
                            if (valueReq == valueAll) {
                                listAll[currModell] = listAll[currModell] + 1;
                                break;
                            } else {
                              break
                            }
                        } else {
                            console.log("Yolo");
                            break
                        }
                      }
                  }
              }
          }

          console.log(listAll);



          //Grovt?
          //Grovt?

          // for (var i = 0; i < gnssAll.length; i++) {
          //
          //     for (const [keyAll, valueAll] of Object.entries(gnssAll[i])) {
          //         let currModell = gnssAll[i].tillverkare + "-" + gnssAll[i].modell;
          //         for (const [keyReq, valueReq] of Object.entries(required)) {
          //             if (keyReq == keyAll) {
          //               console.log("x");
          //               console.log(currModell);
          //               if (keyReq.charAt(0) == "-") {
          //                   //Checka att inom värde och isf adda men annars ej
          //                   listAll[currModell] = listAll[currModell] + 1;
          //                   console.log("minus");
          //                   break
          //               } if (keyReq.charAt(0) == "+") {
          //                   //Checka att inom värde och isf adda men annars ej
          //                   listAll[currModell] = listAll[currModell] + 1;
          //                   console.log("plus");
          //                   break
          //               } else {
          //                   //Checka att inom värde och isf adda men annars ej
          //                   listAll[currModell] = listAll[currModell] + 1;
          //                   console.log("Yolo");
          //                   break
          //               }
          //             }
          //         }
          //     }
          // }
          //
          // console.log(listAll);
























          //Nått är fel här
          //Kör bara för första gnnsAll....


          // for (const [keyReq, valueReq] of Object.entries(required)) {
          //     for (const [keyAll, valueAll] of Object.entries(gnssAll[indexLength])) {
          //         if (keyReq == keyAll) {
          //           if (keyReq.charAt(0) == "-") {
          //               //Checka att inom värde och isf adda men annars ej
          //               listAll[tillvModell] = listAll[tillvModell] + 1;
          //               console.log("minus");
          //               break
          //           } if (keyReq.charAt(0) == "+") {
          //               //Checka att inom värde och isf adda men annars ej
          //               listAll[tillvModell] = listAll[tillvModell] + 1;
          //               console.log("plus");
          //               break
          //           } else {
          //               //Checka att inom värde och isf adda men annars ej
          //               listAll[tillvModell] = listAll[tillvModell] + 1;
          //               console.log("Yolo");
          //               break
          //           }
          //         }
          //     }
          // }
          // console.log(listAll);




            resolve(listAll);

        })
    },

    //Vid login
    testis: async function() {
        console.log("kaka");
    },







    //Vid login
    getWords: async function() {
        return new Promise(resolve => {
            let arrayWords = [];
            db.all("SELECT * FROM words", async (err, row) => {
                if (err) {
                    console.log(err);
                } else {
                    row.forEach(element => arrayWords.push(element["word"]));
                    global.words = arrayWords;
                    resolve(arrayWords);
                }
            });
        })
    },
    //Vid login
    setUserWords: async function() {
        return new Promise(resolve => {
            let wordsList = global.words;

            for (let i = 0; i < wordsList.length; i++) {
                db.get("SELECT COUNT(*) AS total FROM data WHERE word = ? AND user_id = ?",
                wordsList[i],global.userBackupId,(err, row) => {
                    if (err) {
                        resolve(err);
                    } else {
                        if (row.total == 0) {
                            //ord finns inte
                            db.run("INSERT INTO data (user_id, word, res_word, nr_of_tries) VALUES (?, ?, ?, ?)",
                                global.userBackupId, wordsList[i], wordsList[i], 1, (err) => {
                                if (err) {
                                    resolve(err);
                                }
                            });
                        }
                    }
                    resolve("success");
                });
            }
        })
    },
    //Vid login
    getUserWords: async function() {
        return new Promise(resolve => {
            db.all("SELECT * FROM data WHERE user_id = ?",
            global.userBackupId, async (err, row) => {
                if (err) {
                    console.log(err);
                    resolve(err);
                } else {
                    let Obj = {};
                    for (let i = 0; i < row.length; i++) {
                        if (!(row[i]["word"] in Obj)) {
                            Obj[row[i]["word"]] = [row[i]["res_word"]];
                        } else {
                            Obj[row[i]["word"]].push(row[i]["res_word"]);
                        }

                    }
                    global.userWords = Obj;
                    resolve(Obj);
                }

            });


        })
    },

    //Vid login
    getCounterWords: async function() {
        return new Promise(resolve => {
            let count = 0;
            for (var c in global.words) {
                count = count + 1;
            }
            global.counterWords = count;

            resolve(count);
        })

    },
    //Lägger till ett(+1) på räknaren i DB om ordet redan finns
    addToNrOfTries: async function() {
        return new Promise(resolve => {
            db.get("SELECT nr_of_tries FROM data WHERE user_id = ? AND res_word = ?",
            global.userBackupId,global.subWord,(err, row) => {
                if (err) {
                    resolve(err);
                } else {
                    let newNumberOfTries = row.nr_of_tries + 1;
                    db.run("UPDATE data SET nr_of_tries = ? WHERE user_id = ? AND res_word = ?",
                        newNumberOfTries, global.userBackupId, global.subWord, (err) => {
                        if (err) {
                            resolve(err);
                        }
                    });
                    resolve("success");
                }
            });
        })
    },
    //Lägger till ordet som var "fel" i res_word tillsammans emd user_id
    addResWord: async function() {
        return new Promise(resolve => {
            db.run("INSERT INTO data (user_id, word, res_word, nr_of_tries) VALUES (?, ?, ?, ?)",
                global.userBackupId, global.currentWord, global.subWord, 1, (err) => {
                if (err) {
                    resolve(err);
                }
            });
            resolve("Success");
        })
    },
    //Sparar poäng i statisctis tabellen
    addToStatistics: async function() {
        return new Promise(resolve => {
            db.run("INSERT INTO statistics (user_id, score, total_score) VALUES (?, ?, ?)",
                global.userBackupId, global.score, global.counterWords, (err) => {
                if (err) {
                    resolve(err);
                }
            });
            resolve("Success");
        })
    },
    //Nollställer startCounter
    resetStartCounter: async function() {
        return new Promise(resolve => {
            global.startCounter = 0;
            resolve(0);
        })
    },
    //Nollställer score
    resetScore: async function() {
        return new Promise(resolve => {
            global.score = 0;
            resolve(0);
        })
    }

}
