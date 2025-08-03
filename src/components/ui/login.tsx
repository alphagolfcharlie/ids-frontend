import {
    Dialog,
    //DialogClose,
    DialogContent,
    //DialogDescription,
    //DialogFooter,
    //DialogHeader,
    //DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"  
import {
    Card,
    //CardAction,
    CardContent,
    CardDescription,
    //CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
//import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
//import { Label } from "@/components/ui/label";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";  
import { DialogTitle } from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";

export function LoginDialog() {
    const navigate = useNavigate()
    const authorizedEmails = import.meta.env.VITE_AUTHORIZED_EMAILS.split(","); // Access authorized emails from the environment

    const handleGoogleLoginSuccess = (credentialResponse: any) => {
        const decoded: any = jwtDecode(credentialResponse.credential); // Decode the JWT
        console.log("User Info:", decoded);
    
        const userEmail = decoded.email;
    
        // Check if the user's email is authorized
        if (authorizedEmails.includes(userEmail)) {
          console.log("Authorized user:", userEmail);
          navigate("/admin"); // Redirect to the admin page
        } else {
          console.error("Unauthorized user:", userEmail);
          alert("You are not authorized to access the admin page.");
        }
      };
    
      const handleGoogleLoginError = () => {
        console.error("Login Failed");
      };

    return (

        <Dialog>
        <form>
            <DialogTrigger asChild>
            <Button variant="outline">Admin controls</Button>
            </DialogTrigger>
            <DialogTitle></DialogTitle>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <Card className="w-full max-w-sm bg-transparent border-none">
            <CardHeader>
                <CardTitle>Access admin panel</CardTitle>
                <CardDescription>
                Use your Google account to log in. VATSIM OAuth coming soon. 
                </CardDescription>
            </CardHeader>
            <CardContent>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                />
              </CardContent>
            </Card>
            </DialogContent>
        </form>
        </Dialog>
    );
  }