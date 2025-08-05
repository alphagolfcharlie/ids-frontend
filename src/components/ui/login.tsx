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
// import { jwtDecode } from "jwt-decode";  
import { DialogTitle } from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";

export function LoginDialog() {
    const navigate = useNavigate()

    const handleGoogleLoginSuccess = async (credentialResponse: any) => {
        try {
          // Decode the Google ID token to get user info (optional)
          // const decoded: any = jwtDecode(credentialResponse.credential);
    
          // Send the Google ID token to your backend for verification
          const response = await fetch("/api/google-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: credentialResponse.credential }),
          });
    
          if (!response.ok) {
            throw new Error("Failed to log in");
          }
    
          const data = await response.json();
    
          // Store the backend-issued JWT
          localStorage.setItem("authToken", data.token);
    
          // Redirect to the admin page
          navigate("/admin");
        } catch (err) {
          console.error("Login failed:", err);
          alert("Login failed. Please try again.");
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