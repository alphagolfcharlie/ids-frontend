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
import { useState, useEffect } from "react";
//import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
//import { Label } from "@/components/ui/label";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";  
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useNavigate, useLocation } from "react-router-dom";

export function LoginDialog() {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current URL
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false); // State to control the alert dialog

  
    useEffect(() => {
      // Check if the user is logged in by verifying the presence of the token
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token); // Set to true if token exists, false otherwise
    }, []);
  
    const handleGoogleLoginSuccess = async (credentialResponse: any) => {
      try {
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
  
        const decoded: any = jwtDecode(data.token);
        const expirationTime = decoded.exp * 1000;
  
        // Set a timer to log out the user when the token expires
        const timeUntilExpiration = expirationTime - Date.now();
        setTimeout(() => {
          alert("Your session has expired. Please log in again.");
          handleLogout();
        }, timeUntilExpiration);
  
        // Update login state
        setIsLoggedIn(true);
  
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
  
    const handleLogout = () => {
      localStorage.removeItem("authToken"); // Clear the token
      setIsLoggedIn(false); // Update login state
      navigate("/"); // Redirect to the home page
    };
  
    const handleAdminAccess = () => {
      if (isLoggedIn) {
        navigate("/admin"); // Redirect to the admin panel if logged in
      }
    };
  
    const handleHomeAccess = () => {
      navigate("/"); // Redirect to the home page
    };
  
    return (
      <Dialog>
        <form>
        <div className="flex space-x-4">
          {location.pathname === "/admin" ? (
            // If on the admin page, show "Home" button
            <Button
              variant="outline"
              onClick={handleHomeAccess}
            >
              Home
            </Button>
          ) : (
            // If on the home page or other pages, show "Admin controls"
            isLoggedIn ? (
              <Button
                variant="outline"
                onClick={handleAdminAccess}
              >
                Admin controls
              </Button>
            ) : (
              <DialogTrigger asChild>
                <Button variant="outline">
                  Admin controls
                </Button>
              </DialogTrigger>
            )
          )}

          {isLoggedIn && (
            // Always show "Log Out" button if logged in
            <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  onClick={() => setIsAlertDialogOpen(true)} // Open the alert dialog
                >
                  Log Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to log out? You will need to log in again to access the admin panel.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAlertDialogOpen(false)} // Close the dialog
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsAlertDialogOpen(false); // Close the dialog
                      handleLogout(); // Perform logout
                    }}
                  >
                    Log Out
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
  
          <DialogTitle></DialogTitle>
          {!isLoggedIn && (
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
          )}
        </form>
      </Dialog>
    );
  }