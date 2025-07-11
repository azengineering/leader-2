'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, Loader2, X } from 'lucide-react';

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
import { useToast } from "@/hooks/use-toast";
import { useState, Suspense } from "react";
import { createClient } from '@/lib/supabase/client';

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

function ForgotPasswordContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // First, check if the user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', values.email)
        .single();

      if (userError || !user) {
        toast({
          title: "Account not found",
          description: "No account exists with this email. Please sign up first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      setSubmittedEmail(values.email);
      setIsSuccess(true);
      toast({
        title: "Check your email",
        description: "A password reset link has been sent to your email address.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              <KeyRound className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Forgot Password</CardTitle>
            <CardDescription className="pt-1">
              {isSuccess 
                ? "Check your inbox for the next steps."
                : "Enter your email to receive a password reset link."
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 space-y-6">
            {isSuccess ? (
              <div className="text-center p-4 bg-green-100 text-green-800 rounded-md">
                <p>A password reset link has been sent to <strong>{submittedEmail}</strong>. Please check your inbox and follow the instructions.</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="name@example.com" 
                            {...field} 
                            className="py-6"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-center">
                    <Button 
                      type="submit" 
                      className="py-6 text-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center p-8 bg-secondary/30 rounded-b-xl">
            <p className="text-sm text-muted-foreground">
              Remember your password? <Link href="/login" className="text-primary hover:underline font-bold">Login</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
