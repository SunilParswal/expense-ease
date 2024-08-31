import connectDb from "@/lib/mongoose-config";
import UserModel from "@/models/user/user-model";
import { errorMessages } from "@/utils/const";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ResetPasswordFormSchema } from "@/schemas/reset-password-schema";

type ReqObjI = {
  userId: string;
  password: string;
};

export const POST = async (req: NextRequest) => {
  const data = (await req.json()) as ReqObjI;

  // Creating an object with the confirmPassword to validate with zod schema
  const objToParse = { ...data, confirmPassword: data.password };

  try {
    ResetPasswordFormSchema.parse(objToParse);
    await connectDb();

    await UserModel.findByIdAndUpdate(data.userId, {
      password: data.password,
    });

    return NextResponse.json(
      { ok: true, message: "You can now log in with the new password" },
      { status: 200 },
    );
  } catch (err) {
    console.log("ERROR RESETTING THE PASSWORD", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: errorMessages.incorrectData },
        { status: 400 },
      );
    }
    const errorMessage =
      err instanceof Error ? err.message : errorMessages.resetPassword;
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 },
    );
  }
};
