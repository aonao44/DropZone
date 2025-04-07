import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/sign-in");

  // 以下のコードはリダイレクト後は実行されませんが、TypeScriptのエラーを回避するために残しています
  return null;
}
