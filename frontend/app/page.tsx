import { redirect } from "next/navigation";

export default function Home() {
  // This automatically sends users to the signup page 
  // when they land on your main URL
  redirect("/signup");
}