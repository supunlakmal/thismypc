import { MongoClient } from "mongodb";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import md5 from 'md5';
import validator from 'validator';



type Data = {
  name: string;
};

function respond(type:boolean, msg:string, data:any) {
  const res:any = {};
  res.data = data;
  res.message = msg;
  res.status = type;
  return res;
}



export default async  function  handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  

  const email = req.body.email;
  const password = md5(req.body.password);
  req.body.password = password;
  // const userData = req.body;
  if (
    req.body.email === "" ||
    req.body.password === "" ||
    req.body.firstName === "" ||
    req.body.lastName === ""
  ) {
    res.status(401).json(
      respond(false, "username/password/first name/last name required", null)
    );
  }
  if (
    !validator.isAlpha(req.body.firstName) ||
    !validator.isAlpha(req.body.lastName)
  ) {
    res.status(401).json(
      respond(false, "First Name and Last Name need to be only string", null)
    );
  }
  if (!validator.isEmail(email)) {
    res.status(401).json(respond(false, "Invalid Email", null));
  }

  res.status(200).json({ name: 'OK' });


  // search user by user name
  // const user = await User.searchEmailUser(email);
  // if (!user) {
  //   const userClass = new userComponent();
  //   // create  room id
  //   const ioSocketID = md5(req.body.email + Date.now());
  //   userData.ioSocketID = ioSocketID;
  //   userData.authentication_key = md5(ioSocketID);
  //   const newUser = await User.createUser(userData);
  //   if (newUser) {
  //     // user  class
  //     userClass
  //       .setUserDataToClass(newUser)
  //       .userID()
  //       .userFirstName()
  //       .userLastName()
  //       .userEmail()
  //       .getAuthenticationKey();
  //     res
  //       .status(200)
  //       .json(respond(true, "User Information", userClass.getUser()));
  //   }
  // } else {
  //   res.status(401);
  //   res.json(respond(false, "User  Already exit", null));
  // }




  





}


