import { Button } from "@/components/ui/button";
import oauth2Client from "./utils/google-auth";
import Link from "next/link";

export default function Home() {

  const SCOPE = ["https://www.googleapis.com/auth/drive.metadata.readonly", 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file'];

  const authorizationURL = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: 'consent',
    scope: SCOPE,
  });


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Link href={authorizationURL}><Button>Login to Google</Button></Link>
    </div>
  );
}
