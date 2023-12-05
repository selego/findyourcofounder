import { NextResponse } from "next/server";

import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(req) {
  await connectMongoDB();
  const { id } = await req.json();
  await User.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
  return NextResponse.json({ message: "clicked" });
}

// const config = { secret: "YOUR_SECRET" };
// const JWT_MAX_AGE = "365d"; // or your desired JWT max age.
//
// const cookieOptions = () => {
//   return { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" };
// };

// export async function POST(req, res) {
//   try {
//     const { password, email, name } = req.body;
//
//     if (password && !validatePassword(password)) {
//       return res.status(200).json({ ok: false, user: null, code: "PASSWORD_NOT_VALIDATED" });
//     }
//
//     const user = await User.create({ name, password, email });
//     const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: JWT_MAX_AGE });
//
//     res.setHeader("Set-Cookie", `jwt=${token}; ${cookieOptions()}`);
//
//     return res.status(200).json({ user, token, ok: true });
//   } catch (error) {
//     console.log("e", error);
//     if (error.code === 11000) {
//       return res.status(409).json({ ok: false, code: "USER_ALREADY_REGISTERED" });
//     }
//     capture(error); // Assuming this is an error capturing utility you have.
//     return res.status(500).json({ ok: false, code: "SERVER_ERROR" });
//   }
// }
