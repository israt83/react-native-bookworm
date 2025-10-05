// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const protectRoute = async (req, res, next) => {
//   try {
//     // get token
//     const token = req.header("Authorization").replace("Bearer", "");
//     if (!token)
//       return res
//         .status(400)
//         .json({ message: "No Authentication token , access denied" });

//     // verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // find user
//     const user = await User.findById(decoded.userId).select("-password")
//     if(!user) return res.status(401).json({message:"Token is not valid"})
    
        
//     req.user = user;
//     next();    
//   } catch (error) {
//     console.error("Authentication error:",error.message);
//     res.status(401).json({message:"Token is not valid"})
//   }
// };


// export default protectRoute;



import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    // get header
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res
        .status(400)
        .json({ message: "No Authentication token, access denied" });
    }

    // remove "Bearer " and trim spaces
    const token = authHeader.replace("Bearer ", "").trim();

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    // find user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default protectRoute;
