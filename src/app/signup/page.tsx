
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, X, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useLanguage } from '@/context/language-context';
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
      c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
      c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
      C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
      c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.574l6.19,5.238
      C42.021,35.579,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { signup, signInWithGoogle, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await signup(values.email, values.password);
      // The signup function will handle redirection to login page with a toast
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    if (isGoogleLoading) return;
    
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      
      toast({
        title: "Welcome to PolitiRate!",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Google Sign-Up Failed",
        description: error instanceof Error ? error.message : "Unable to sign up with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Card className="w-full max-w-md shadow-2xl border-border/20 rounded-xl relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" 
            onClick={() => router.back()}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
          
          <CardHeader className="text-center p-8">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <UserPlus className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">{t('signupPage.title')}</CardTitle>
            <CardDescription className="pt-1">{t('signupPage.description')}</CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 space-y-6">
            {/* Dedicated Google Sign-Up Section */}
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full py-6 text-lg" 
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <GoogleIcon className="mr-3 h-6 w-6" />
                    Sign up with Google
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium">Or create account with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('signupPage.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@example.com" 
                          {...field} 
                          className="py-6"
                          disabled={isLoading || isGoogleLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('signupPage.passwordLabel')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="py-6"
                          disabled={isLoading || isGoogleLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('signupPage.confirmPasswordLabel')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="py-6"
                          disabled={isLoading || isGoogleLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    t('signupPage.signupButton')
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center p-8 bg-secondary/30 rounded-b-xl">
            <p className="text-sm text-muted-foreground">
              {t('signupPage.loginPrompt')} <Link href="/login" className="text-primary hover:underline font-bold">Login</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
